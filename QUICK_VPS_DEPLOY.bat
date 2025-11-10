@echo off
echo =================================
echo   YUKON WILDCATS VPS DEPLOY
echo      (IP ADDRESS ONLY)
echo =================================
echo.

echo 🚀 Quick VPS deployment without domain setup
echo.

set /p VPS_IP="Enter your VPS IP address: "
set /p VPS_USER="Enter your VPS username (root/ubuntu/etc): "

echo.
echo ✅ Configuration:
echo    VPS IP: %VPS_IP%
echo    VPS User: %VPS_USER%
echo    Access URL: http://%VPS_IP%
echo.

pause

echo.
echo 📤 STEP 1: Upload files to VPS
echo.
echo Copy and paste this command to upload your files:
echo.
echo scp -r "c:\Users\lazar\websites\yukon-wildcats-site" %VPS_USER%@%VPS_IP%:/tmp/
echo.

pause

echo.
echo 🔧 STEP 2: SSH into your VPS and run these commands:
echo.
echo ssh %VPS_USER%@%VPS_IP%
echo.
echo # Move files to web directory
echo sudo mkdir -p /var/www
echo sudo mv /tmp/yukon-wildcats-site /var/www/yukon-wildcats
echo sudo chown -R %VPS_USER%:%VPS_USER% /var/www/yukon-wildcats
echo.
echo # Install Node.js (if not installed)
echo curl -fsSL https://deb.nodesource.com/setup_18.x ^| sudo -E bash -
echo sudo apt install -y nodejs
echo.
echo # Navigate to project
echo cd /var/www/yukon-wildcats
echo.
echo # Make script executable
echo chmod +x deploy-vps.sh
echo.
echo # Run deployment (this installs everything)
echo sudo ./deploy-vps.sh
echo.

echo ✅ STEP 3: After deployment completes, your website will be live at:
echo.
echo    🌐 Main Site: http://%VPS_IP%
echo    🔐 Admin Panel: http://%VPS_IP%/admin.html  
echo    📝 Login Page: http://%VPS_IP%/login.html
echo    💰 Quote System: http://%VPS_IP%/quote.html
echo    📞 Contact Form: http://%VPS_IP%/contact.html
echo.

echo 📋 Default Admin Credentials (CHANGE THESE!):
echo    Username: admin
echo    Password: YukonWildcats2025!
echo.
echo    Manager Username: manager  
echo    Manager Password: Manager2025!
echo.

echo ⚡ QUICK TEST CHECKLIST:
echo    □ Website loads at http://%VPS_IP%
echo    □ Admin panel accessible  
echo    □ Quote system works
echo    □ Contact forms function
echo    □ Mobile responsive design
echo    □ Whitney AI chatbot active
echo.

echo 🔒 SECURITY REMINDERS:
echo    1. Change admin passwords in /var/www/yukon-wildcats/server/.env
echo    2. Consider adding a domain later for professional appearance
echo    3. Set up SSL when you get a domain
echo.

echo 📞 Emergency Contact Numbers (already in website):
echo    Lazarus Vanbibber: (867) 332-0223
echo    Micah Wolfe: (867) 332-4551  
echo    24/7 Emergency Line: (867) 332-4695
echo.

echo 🎯 YOUR WEBSITE WILL BE LIVE IN ~30 MINUTES!
echo.

> deployment_commands.txt (
echo # VPS Deployment Commands for %VPS_IP%
echo.
echo # 1. Upload files
echo scp -r "c:\Users\lazar\websites\yukon-wildcats-site" %VPS_USER%@%VPS_IP%:/tmp/
echo.
echo # 2. SSH and setup
echo ssh %VPS_USER%@%VPS_IP%
echo sudo mkdir -p /var/www
echo sudo mv /tmp/yukon-wildcats-site /var/www/yukon-wildcats
echo sudo chown -R %VPS_USER%:%VPS_USER% /var/www/yukon-wildcats
echo cd /var/www/yukon-wildcats
echo chmod +x deploy-vps.sh
echo sudo ./deploy-vps.sh
echo.
echo # 3. Test access
echo # Open browser to: http://%VPS_IP%
)

echo ✅ Commands saved to deployment_commands.txt for easy copy/paste!
echo.

notepad deployment_commands.txt

pause