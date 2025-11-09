require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins for local development
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve the main website files
app.use('/uploads', express.static('uploads'));

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

// Routes
app.post('/api/submissions', async (req, res) => {
  const submission = req.body;
  
  try {
    // Save to data/submissions.json
    const submissionsPath = path.join(__dirname, 'data', 'submissions.json');
    let submissions = [];
    
    if (fs.existsSync(submissionsPath)) {
      submissions = JSON.parse(fs.readFileSync(submissionsPath));
    }
    
    submissions.push(submission);
    fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));
    
    res.json({ message: 'Submission saved successfully' });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ message: 'Error saving submission' });
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

app.post('/api/login', (req, res) => {
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

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on all interfaces at port ${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://192.168.12.87:${PORT}`);
  });
}

module.exports = app;