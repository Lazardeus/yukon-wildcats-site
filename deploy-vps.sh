#!/bin/bash

# Yukon Wildcats VPS Deployment Script
# Run this script on your VPS to deploy/update the website

echo "🚀 Starting Yukon Wildcats Website Deployment..."

# Configuration
PROJECT_DIR="/var/www/yukon-wildcats"
BACKUP_DIR="/var/backups/yukon-wildcats"
REPO_URL="https://github.com/Lazardeus/yukon-wildcats-site.git"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root. Consider using a non-root user with sudo privileges."
fi

# Create backup
print_status "Creating backup..."
mkdir -p $BACKUP_DIR
if [ -d "$PROJECT_DIR" ]; then
    DATE=$(date +%Y%m%d_%H%M%S)
    tar -czf $BACKUP_DIR/website_backup_$DATE.tar.gz $PROJECT_DIR
    print_status "Backup created: website_backup_$DATE.tar.gz"
fi

# Create project directory if it doesn't exist
mkdir -p $PROJECT_DIR

# Clone or update repository
if [ ! -d "$PROJECT_DIR/.git" ]; then
    print_status "Cloning repository..."
    git clone $REPO_URL $PROJECT_DIR
else
    print_status "Updating repository..."
    cd $PROJECT_DIR
    git fetch origin
    git reset --hard origin/main
fi

cd $PROJECT_DIR

# Install/Update Node.js dependencies
print_status "Installing Node.js dependencies..."
cd server
npm install --production

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_warning "Creating .env file from template..."
    cat > .env << EOL
NODE_ENV=production
PORT=3000
JWT_SECRET=yukon-wildcats-$(openssl rand -hex 32)
OWNER_USERNAME=admin
OWNER_PASSWORD=YukonWildcats2025!
ADMIN_USERNAME=manager
ADMIN_PASSWORD=Manager2025!
ADDITIONAL_ADMINS=guest:GuestPass2025:admin
EOL
    print_warning "Please update the passwords in .env file!"
fi

# Set proper permissions
print_status "Setting file permissions..."
chown -R www-data:www-data $PROJECT_DIR
find $PROJECT_DIR -type f -exec chmod 644 {} \;
find $PROJECT_DIR -type d -exec chmod 755 {} \;

# Create logs directory
mkdir -p $PROJECT_DIR/server/logs
chown -R www-data:www-data $PROJECT_DIR/server/logs

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
fi

# Start/Restart the application
print_status "Starting application with PM2..."
cd $PROJECT_DIR
pm2 stop yukon-wildcats-server 2>/dev/null || true
pm2 delete yukon-wildcats-server 2>/dev/null || true
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup 2>/dev/null || print_warning "PM2 startup already configured or requires manual setup"

# Configure firewall (if UFW is installed)
if command -v ufw &> /dev/null; then
    print_status "Configuring firewall..."
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable
fi

# Install and configure Nginx if not present
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    apt update
    apt install -y nginx
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/yukon-wildcats << EOL
server {
    listen 80;
    server_name yukon-wildcats.ca www.yukon-wildcats.ca _;

    root $PROJECT_DIR;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # API routes to Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Admin routes to Node.js
    location /admin {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static HTML files
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOL

    # Enable the site
    ln -sf /etc/nginx/sites-available/yukon-wildcats /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    systemctl enable nginx
fi

# Set up SSL with Certbot (commented out - run manually)
print_warning "To set up SSL certificate, run:"
print_warning "sudo apt install certbot python3-certbot-nginx"
print_warning "sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"

# Clean up old backups (keep last 10)
print_status "Cleaning up old backups..."
cd $BACKUP_DIR
ls -t *.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm

print_status "✅ Deployment completed successfully!"
print_status "🌐 Your website should be accessible at http://your-server-ip"
print_status "📊 Monitor with: pm2 status, pm2 logs, pm2 monit"

# Display important information
echo
print_warning "🔐 IMPORTANT SECURITY NOTES:"
print_warning "1. Change default passwords in $PROJECT_DIR/server/.env"
print_warning "2. Set up SSL certificate for HTTPS"
print_warning "3. Configure your domain DNS to point to this server"
print_warning "4. Update contact information in the website if needed"

echo
print_status "🚀 Deployment Summary:"
print_status "- Website files: $PROJECT_DIR"
print_status "- Backups: $BACKUP_DIR"
print_status "- Logs: $PROJECT_DIR/server/logs/"
print_status "- PM2 process: yukon-wildcats-server"
print_status "- Nginx config: /etc/nginx/sites-available/yukon-wildcats"