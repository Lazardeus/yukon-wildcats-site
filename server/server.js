require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust first proxy (e.g., when behind Nginx) so rate limiting & IP logging work correctly
// Prevents express-rate-limit ValidationError about unexpected X-Forwarded-For
app.set('trust proxy', 1);

// Ensure JWT secret exists to prevent login crashes
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  const generated = crypto.randomBytes(32).toString('hex');
  process.env.JWT_SECRET = generated;
  console.warn('[SECURITY] JWT_SECRET was missing. Generated a transient secret. Set JWT_SECRET in .env for stable tokens.');
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many API requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // More restrictive for form submissions
  message: 'Too many form submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Performance middleware
app.use(compression()); // Enable gzip compression

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Update with your domain
    : true, // Allow all origins for local development
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Early handler for malformed JSON bodies so users get a 400 with clear guidance instead of generic 500
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body must be valid JSON. Ensure keys and string values are wrapped in double quotes.',
      example: '{"username":"demo","password":"Secret123"}'
    });
  }
  next(err);
});

// Static file serving with caching
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0', // Cache static files in production
  etag: true
}));

app.use('/uploads', express.static('uploads', {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0' // Cache uploads longer
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Admin users
const adminUsers = {
  owner: {
    username: process.env.OWNER_USERNAME || 'admin',
    password: process.env.OWNER_PASSWORD || 'yukonwildcats2024',
    role: 'owner'
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'manager',
    password: process.env.ADMIN_PASSWORD || 'wildcats2024',
    role: 'admin'
  }
};

// Parse additional admins from environment
console.log('ADDITIONAL_ADMINS env var:', process.env.ADDITIONAL_ADMINS);
if (process.env.ADDITIONAL_ADMINS) {
  const additionalAdmins = process.env.ADDITIONAL_ADMINS.split(',');
  console.log('Split admins:', additionalAdmins);
  additionalAdmins.forEach((adminStr, index) => {
    const [username, password, role] = adminStr.split(':');
    console.log(`Processing admin ${index}: username="${username}", password="${password ? '***' : 'empty'}", role="${role}"`);
    if (username && password) {
      adminUsers[`additional_${index}`] = {
        username: username.trim(),
        password: password.trim(),
        role: role?.trim() || 'admin'
      };
    }
  });
}

// Debug: Log loaded admin users (remove passwords for security)
console.log('Loaded admin users:', Object.values(adminUsers).map(u => ({ username: u.username, role: u.role })));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Input validation helper
function validateSubmission(submission) {
  const errors = [];
  
  if (!submission.name || typeof submission.name !== 'string' || submission.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!submission.email || typeof submission.email !== 'string' || !/\S+@\S+\.\S+/.test(submission.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!submission.phone || typeof submission.phone !== 'string' || submission.phone.trim().length < 10) {
    errors.push('Valid phone number is required');
  }
  
  if (!submission.service || typeof submission.service !== 'string') {
    errors.push('Service selection is required');
  }
  
  // Sanitize inputs
  if (submission.name) submission.name = submission.name.trim().substring(0, 100);
  if (submission.email) submission.email = submission.email.trim().toLowerCase().substring(0, 200);
  if (submission.phone) submission.phone = submission.phone.replace(/[^\d\-\+\(\)\s]/g, '').substring(0, 20);
  if (submission.message) submission.message = submission.message.trim().substring(0, 2000);
  
  return { isValid: errors.length === 0, errors, sanitized: submission };
}

// Routes
app.post('/api/submissions', strictLimiter, async (req, res) => {
  const { isValid, errors, sanitized: submission } = validateSubmission(req.body);
  
  if (!isValid) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors 
    });
  }
  
  try {
    // Add timestamp and unique ID
    submission.timestamp = new Date().toISOString();
    submission.id = Date.now() + Math.random().toString(36).substr(2, 9);
    submission.ip = req.ip || 'unknown';
    
    // Save to data/submissions.json with atomic write
    const submissionsPath = path.join(__dirname, 'data', 'submissions.json');
    const tempPath = submissionsPath + '.tmp';
    
    let submissions = [];
    if (fs.existsSync(submissionsPath)) {
      submissions = JSON.parse(fs.readFileSync(submissionsPath, 'utf8'));
    }
    
    submissions.push(submission);
    
    // Atomic write to prevent data corruption
    fs.writeFileSync(tempPath, JSON.stringify(submissions, null, 2));
    fs.renameSync(tempPath, submissionsPath);
    
    res.json({ 
      message: 'Submission saved successfully',
      id: submission.id
    });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ 
      message: 'Internal server error. Please try again later.' 
    });
  }
});

app.get('/api/submissions', authenticateToken, async (req, res) => {
  try {
    const submissionsPath = path.join(__dirname, 'data', 'submissions.json');
    if (!fs.existsSync(submissionsPath)) {
      return res.json([]);
    }
    
    const submissions = JSON.parse(fs.readFileSync(submissionsPath));
    res.json(submissions);
  } catch (error) {
    console.error('Error reading submissions:', error);
    res.status(500).json({ message: 'Error reading submissions' });
  }
});

// Test endpoint to check API connectivity
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'API is working', 
    timestamp: new Date().toISOString(),
    availableUsers: Object.values(adminUsers).map(u => ({ username: u.username, role: u.role }))
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/login', strictLimiter, (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt: username="${username}", password="${password ? '***' : 'empty'}"`);
  
  // Check both admin and owner credentials
  const user = Object.values(adminUsers).find(u => u.username === username && u.password === password);
  
  if (user) {
    const token = jwt.sign({ username, role: user.role }, process.env.JWT_SECRET);
    console.log(`Login successful for user: ${username} (${user.role})`);
    res.json({ token, role: user.role });
  } else {
    console.log(`Login failed for username: ${username}`);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// --- Client Auth System ---
const clientsFile = path.join(__dirname, 'data', 'clients.json');
if (!fs.existsSync(clientsFile)) {
  fs.writeFileSync(clientsFile, JSON.stringify([], null, 2));
}

function loadClients(){
  try { return JSON.parse(fs.readFileSync(clientsFile,'utf8')); } catch(e){ return []; }
}
function saveClients(list){
  const tmp = clientsFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(list,null,2));
  fs.renameSync(tmp, clientsFile);
}
function hashPassword(pw){ return crypto.createHash('sha256').update(pw).digest('hex'); }

app.post('/api/client/register', strictLimiter, (req,res)=>{
  try {
    const { username, email, password } = req.body;
    if(!username || !email || !password){
      return res.status(400).json({ message: 'Username, email and password required' });
    }
    if(password.length < 6){
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if(!/\S+@\S+\.\S+/.test(email)){ return res.status(400).json({ message: 'Valid email required' }); }
    const clients = loadClients();
    if(clients.find(c=>c.username.toLowerCase()===username.toLowerCase())){
      return res.status(409).json({ message: 'Username already taken' });
    }
    if(clients.find(c=>c.email.toLowerCase()===email.toLowerCase())){
      return res.status(409).json({ message: 'Email already registered' });
    }
    const client = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role: 'client',
      createdAt: new Date().toISOString()
    };
    clients.push(client);
    saveClients(clients);
    res.status(201).json({ message: 'Registered successfully' });
  } catch(err){
    console.error('Client register error', err);
    res.status(500).json({ message: 'Server error registering client' });
  }
});

app.post('/api/client/login', strictLimiter, (req,res)=>{
  try {
    const { username, password } = req.body;
    if(!username || !password){ return res.status(400).json({ message: 'Username and password required' }); }
    const clients = loadClients();
    const hashed = hashPassword(password);
    const client = clients.find(c => (c.username.toLowerCase()===username.toLowerCase() || c.email===username.toLowerCase()) && c.passwordHash === hashed);
    if(!client){ return res.status(401).json({ message: 'Invalid credentials' }); }
    const token = jwt.sign({ username: client.username, role: 'client', id: client.id }, process.env.JWT_SECRET);
    res.json({ token, user: { username: client.username, email: client.email, role: 'client' } });
  } catch(err){
    console.error('Client login error', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Return current authenticated user (admin or client)
app.get('/api/me', authenticateToken, (req, res) => {
  try {
    const { username, role, id } = req.user || {};
    let userInfo = { username, role };
    if(role === 'client') {
      const clients = loadClients();
      const client = clients.find(c => c.username === username || c.id === id);
      if(client) {
        userInfo.email = client.email;
        userInfo.id = client.id;
        userInfo.createdAt = client.createdAt;
      }
    }
    res.json({ success: true, user: userInfo });
  } catch (e) {
    console.error('Error in /api/me', e);
    res.status(500).json({ success: false, message: 'Failed to retrieve user' });
  }
});

app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ 
    message: 'File uploaded successfully',
    filepath: `/uploads/${req.file.filename}`
  });
});

app.post('/api/team', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const { member, title } = req.body;
    const teamPath = path.join(__dirname, 'data', 'team.json');
    let team = [];
    
    if (fs.existsSync(teamPath)) {
      team = JSON.parse(fs.readFileSync(teamPath));
    }
    
    const existingMemberIndex = team.findIndex(m => m.id === member);
    const updateData = {
      id: member,
      name: member.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      title: title,
      photo: req.file ? `/uploads/${req.file.filename}` : undefined
    };

    if (existingMemberIndex !== -1) {
      // Update existing member
      team[existingMemberIndex] = {
        ...team[existingMemberIndex],
        ...updateData,
        photo: updateData.photo || team[existingMemberIndex].photo
      };
    } else {
      // Add new member
      team.push(updateData);
    }

    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      fs.mkdirSync(path.join(__dirname, 'data'));
    }
    fs.writeFileSync(teamPath, JSON.stringify(team, null, 2));
    
    res.json({ message: 'Team member updated successfully', team });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ message: 'Error updating team member' });
  }
});

app.get('/api/team', async (req, res) => {
  try {
    const teamPath = path.join(__dirname, 'data', 'team.json');
    if (!fs.existsSync(teamPath)) {
      return res.json([]);
    }
    
    const team = JSON.parse(fs.readFileSync(teamPath));
    res.json(team);
  } catch (error) {
    console.error('Error reading team data:', error);
    res.status(500).json({ message: 'Error reading team data' });
  }
});

app.post('/api/content', authenticateToken, (req, res) => {
  const { location, type, content } = req.body;
  
  // In a real application, you would save this to a database
  // For now, we'll save it to a JSON file
  const contentPath = './data/content.json';
  let contentData = {};
  
  if (fs.existsSync(contentPath)) {
    contentData = JSON.parse(fs.readFileSync(contentPath));
  }
  
  contentData[location] = { type, content };
  
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }
  
  fs.writeFileSync(contentPath, JSON.stringify(contentData, null, 2));
  
  res.json({ message: 'Content updated successfully' });
});

app.get('/api/content', (req, res) => {
  const contentPath = './data/content.json';
  
  if (!fs.existsSync(contentPath)) {
    return res.json({});
  }
  
  const contentData = JSON.parse(fs.readFileSync(contentPath));
  res.json(contentData);
});

// Dashboard API Endpoints

// Get user dashboard data
app.get('/api/dashboard/:userId', authenticateToken, (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Load service requests
        const requestsFile = path.join(__dirname, 'data', 'service-requests.json');
        let requests = [];
        if (fs.existsSync(requestsFile)) {
            requests = JSON.parse(fs.readFileSync(requestsFile, 'utf8'));
        }
        
        // Filter user's requests
        const userRequests = requests.filter(r => r.userId == userId);
        
        // Calculate stats
        const stats = {
            activeServices: userRequests.filter(r => r.status === 'pending' || r.status === 'in-progress').length,
            totalContracts: userRequests.filter(r => r.status === 'completed').length,
            totalSpent: userRequests.reduce((sum, r) => sum + (r.amount || 0), 0),
            recentActivity: userRequests.slice(-5).reverse()
        };
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading dashboard data'
        });
    }
});

// Email transporter setup
const createTransporter = () => {
    // For development, you can use ethereal email or console logging
    if (process.env.NODE_ENV !== 'production') {
        return nodemailer.createTransporter({
            jsonTransport: true // This will log emails to console in development
        });
    }
    
    // For production, configure with your email service
    return nodemailer.createTransporter({
        service: 'gmail', // or your preferred email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Public service request endpoint (no authentication required)
app.post('/api/public-service-request', strictLimiter, (req, res) => {
    try {
        const { name, email, phone, company, serviceType, packageDetails, timeline, budget, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !serviceType) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and service type are required'
            });
        }
        
        // Email validation
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }
        
        // Load existing requests
        const requestsFile = path.join(__dirname, 'data', 'service-requests.json');
        let requests = [];
        if (fs.existsSync(requestsFile)) {
            requests = JSON.parse(fs.readFileSync(requestsFile, 'utf8'));
        }
        
        // Create new request
        const newRequest = {
            id: Date.now(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : '',
            company: company ? company.trim() : '',
            serviceType: serviceType,
            packageDetails: packageDetails || {},
            timeline: timeline || '',
            budget: budget || '',
            message: message || '',
            status: 'pending',
            source: 'website',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        requests.push(newRequest);
        
        // Save to file
        fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));
        
        // Send email notification
        try {
            const transporter = createTransporter();
            
            const emailContent = `
New Service Request from Yukon Wildcats Website

Client Information:
- Name: ${newRequest.name}
- Email: ${newRequest.email}
- Phone: ${newRequest.phone || 'Not provided'}
- Company: ${newRequest.company || 'Not provided'}

Service Details:
- Service Type: ${newRequest.serviceType}
- Package: ${newRequest.packageDetails.title || 'Not specified'}
- Timeline: ${newRequest.timeline || 'Not specified'}
- Budget: ${newRequest.budget || 'Not specified'}

Message:
${newRequest.message || 'No additional message'}

Request ID: ${newRequest.id}
Submitted: ${new Date(newRequest.createdAt).toLocaleDateString()} at ${new Date(newRequest.createdAt).toLocaleTimeString()}
            `;
            
            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@yukonwildcats.com',
                to: process.env.BUSINESS_EMAIL || 'info@yukonwildcats.com',
                subject: `New Service Request: ${newRequest.serviceType} - ${newRequest.name}`,
                text: emailContent,
                html: emailContent.replace(/\n/g, '<br>')
            };
            
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Email notification error:', error);
                } else {
                    console.log('Email notification sent:', info.messageId || 'Email logged to console');
                }
            });
            
        } catch (emailError) {
            console.error('Email setup error:', emailError);
        }
        
        res.json({
            success: true,
            data: { id: newRequest.id },
            message: 'Service request submitted successfully! We will contact you within 24 hours.'
        });
        
    } catch (error) {
        console.error('Public service request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting service request. Please try again.'
        });
    }
});

// Submit service request (authenticated - for admin use)
app.post('/api/service-request', authenticateToken, (req, res) => {
    try {
        const { userId, serviceType, description, contactInfo } = req.body;
        
        // Validate required fields
        if (!userId || !serviceType) {
            return res.status(400).json({
                success: false,
                message: 'User ID and service type are required'
            });
        }
        
        // Load existing requests
        const requestsFile = path.join(__dirname, 'data', 'service-requests.json');
        let requests = [];
        if (fs.existsSync(requestsFile)) {
            requests = JSON.parse(fs.readFileSync(requestsFile, 'utf8'));
        }
        
        // Create new request
        const newRequest = {
            id: Date.now(),
            userId: userId,
            serviceType: serviceType,
            description: description || '',
            contactInfo: contactInfo || {},
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        requests.push(newRequest);
        
        // Save to file
        fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));
        
        res.json({
            success: true,
            data: newRequest,
            message: 'Service request submitted successfully'
        });
        
    } catch (error) {
        console.error('Service request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting service request'
        });
    }
});

// Get user's service requests
app.get('/api/service-requests/:userId', authenticateToken, (req, res) => {
    try {
        const userId = req.params.userId;
        
        const requestsFile = path.join(__dirname, 'data', 'service-requests.json');
        let requests = [];
        if (fs.existsSync(requestsFile)) {
            requests = JSON.parse(fs.readFileSync(requestsFile, 'utf8'));
        }
        
        const userRequests = requests.filter(r => r.userId == userId);
        
        res.json({
            success: true,
            data: userRequests
        });
        
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading service requests'
        });
    }
});

// Feature flags endpoint
app.get('/api/features', (req, res) => {
  // Central place to expose feature toggles to clients
  const features = {
    grokCodeFast1: process.env.GROK_CODE_FAST_1 === 'true'
  };
  res.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features
  });
});

// Initialize data files
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const requestsFile = path.join(dataDir, 'service-requests.json');
if (!fs.existsSync(requestsFile)) {
    fs.writeFileSync(requestsFile, JSON.stringify([], null, 2));
}

// Global error handlers
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: 'The requested resource does not exist'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on all interfaces at port ${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://192.168.12.87:${PORT}`);
    console.log(`Dashboard API endpoints available`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;