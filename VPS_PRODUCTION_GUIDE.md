# VPS Production Configuration for Yukon Wildcats Website

## Server Configuration
- **Environment**: Production VPS
- **Node.js**: v16+ recommended
- **PM2**: Process manager for production
- **Nginx**: Reverse proxy (recommended)
- **SSL**: Let's Encrypt or Cloudflare

## Performance Optimizations

### 1. PM2 Configuration (Already configured in ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'yukon-wildcats',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 2. Nginx Configuration (Recommended)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Environment Variables for Production
Create a `.env.production` file:
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-jwt-secret-here
OWNER_USERNAME=admin
OWNER_PASSWORD=secure-owner-password
ADMIN_USERNAME=manager
ADMIN_PASSWORD=secure-admin-password

# Additional admin users (optional)
ADDITIONAL_ADMINS=friend1:password123:admin,friend2:password456:admin

# Email configuration (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Domain configuration
DOMAIN=yukon-wildcats.ca
```

### 4. Security Enhancements
- Keep Node.js and dependencies updated
- Use strong passwords for admin accounts
- Enable fail2ban for SSH protection
- Regular security updates on VPS
- Backup database and files regularly

### 5. Monitoring & Logging
```bash
# Install PM2 monitoring
npm install pm2 -g

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor logs
pm2 logs
pm2 monit
```

### 6. Backup Strategy
```bash
#!/bin/bash
# backup-script.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/yukon-wildcats"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup website files
tar -czf $BACKUP_DIR/website_$DATE.tar.gz /path/to/website

# Backup data files
cp -r /path/to/website/server/data $BACKUP_DIR/data_$DATE

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

## Domain & DNS Configuration

### A Records
```
@ -> Your VPS IP Address
www -> Your VPS IP Address
```

### Email Setup (if using custom domain)
```
MX -> mail.yukon-wildcats.ca (priority 10)
```

## SSL Certificate Installation
```bash
# Using Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Firewall Configuration
```bash
# UFW Configuration
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Regular Maintenance Tasks
1. **Weekly**: Check server logs and performance
2. **Monthly**: Update Node.js dependencies
3. **Quarterly**: Security audit and backup verification
4. **Yearly**: SSL certificate renewal (auto with certbot)

## Performance Monitoring
- Use `htop` for system monitoring
- `pm2 monit` for application monitoring
- Consider New Relic or similar for advanced monitoring

## Contact Information Updates Applied
✅ Lazarus Vanbibber: lazarus.vanbibber@icloud.com | lazarusvanbibber@yukon-wildcats.ca | 1-867-332-0223
✅ Micah Wolfe: Micahsage4444@gmail.com | 1-867-332-4551