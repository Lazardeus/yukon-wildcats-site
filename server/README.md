# Yukon Wildcats API Server

Backend server for the Yukon Wildcats Contracting website.

## Environment Variables

```
PORT=3000
JWT_SECRET=your-secret-key
OWNER_USERNAME=owner
OWNER_PASSWORD=your-owner-password
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
```

## API Endpoints

- POST `/api/login` - Authentication
- GET/POST `/api/submissions` - Form submissions
- GET/POST `/api/content` - Content management
- POST `/api/upload` - File uploads

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm install
npm start
```