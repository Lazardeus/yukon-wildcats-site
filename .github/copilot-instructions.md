# Yukon Wildcats AI Agent Instructions

This guide helps AI agents understand the essential patterns and architecture of the Yukon Wildcats Contracting website codebase.

## Project Architecture

### Frontend Structure
- **Static HTML Pages**: Main content in individual HTML files (index.html, services.html, etc.)
- **Assets**: Images and icons in assets/ directory  
- **Styling**: Global CSS in css/style.css with consistent design patterns
- **Client Scripts**: Core functionality in js/script.js and particle effects in js/particles-config.js
- **Particles.js**: All pages use animated particle background loaded from CDN

### Backend Structure (server/)
- **Node.js/Express Server**: RESTful API handling authentication, file uploads, and form submissions
- **File-based Storage**: Submissions saved in data/submissions.json
- **Upload Management**: User uploads stored in uploads/ directory with timestamp naming
- **Environment Config**: Using .env for sensitive configuration (see .gitignore)
- **Static File Serving**: Backend serves frontend files from parent directory

## Key Patterns & Conventions

### Authentication Flow
Two-tier authentication system with owner/admin roles
Example token usage:
fetch(API_URL, {
  headers: { 'Authorization': Bearer authToken }
})

### Frontend Components
1. **Particle Background**: All pages use particles.js for animated background
2. **Consistent Header/Footer**: Standard navigation and admin access
3. **Card Layout Pattern**: Content displayed in hoverable, glowing cards
4. **Responsive Design**: Mobile-first with specific breakpoints at 1024px, 768px, 480px

### Data Persistence
- Form submissions stored in both:
  - LocalStorage (yw_submissions_v1)
  - Server-side JSON (data/submissions.json)
- Community updates in LocalStorage (yw_community_v2)

## Development Workflow

### Local Development
1. Start backend server (required for full functionality):
cd server
npm install
npm run dev  # Uses nodemon for auto-reload

2. Frontend is served directly by Express from parent directory - no separate server needed
3. Required environment variables in server/.env:
PORT=3000
JWT_SECRET=your-secret
OWNER_USERNAME=username
OWNER_PASSWORD=password
ADMIN_USERNAME=username
ADMIN_PASSWORD=password

### Production Deployment
- **PM2**: Use ecosystem.config.js for process management
- **Heroku**: Procfile configured for single-dyno deployment
- **Manual**: npm start in server directory

### Testing & Debugging
- **Jest Tests**: npm test in server directory for API testing
- **Manual Testing**: Follow server/tests/manual_testing.md checklist
- **Secret Generation**: Use server/scripts/gen_secret.js for JWT secrets
- **Frontend Debugging**: Check browser console for localStorage state (yw_* keys)

### File Upload Handling
- Uploads managed through Multer middleware
- Supported formats: Images for team members and service icons
- Files stored in server/uploads/ with timestamp-based naming

## Critical Integration Points

### API Endpoints
- POST /api/login: Authentication with role-based access
- POST /api/submissions: Form submission storage
- POST /api/upload: File upload handling
- POST /api/content: Dynamic content management
- GET /api/content: Retrieve dynamic content

### Cross-Component Communication
- Authentication state shared via LocalStorage
- Content updates trigger real-time UI updates
- Form submissions handled with both local and server persistence

## Project-Specific Conventions

### Style Guidelines
- Gold accent color: #ffd700
- Dark theme background: #111
- Consistent animation timings: 0.3s for transitions
- Card hover effects using hover-glow class

### Asset Management
- Service icons: Standard 60px width
- Admin icons: 25px height in header, 20px in footer
- Logo placement: Left-aligned in header
