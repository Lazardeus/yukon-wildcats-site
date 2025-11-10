@echo off
echo =================================
echo    YUKON WILDCATS VPS DEPLOY
echo =================================
echo.

echo 🚀 This script will help you deploy to your VPS
echo.

set /p VPS_IP="Enter your VPS IP address: "
set /p VPS_USER="Enter your VPS username (e.g., root, ubuntu): "
set /p DOMAIN_NAME="Enter your desired domain name (e.g., yukon-wildcats.ca): "

echo.
echo ✅ Configuration:
echo    VPS IP: %VPS_IP%
echo    VPS User: %VPS_USER%
echo    Domain: %DOMAIN_NAME%
echo.

pause

echo.
echo 📤 Step 1: Uploading website files to VPS...
echo    This will use SCP to transfer files
echo.

REM Create a temporary batch file for SCP
echo scp -r "c:\Users\lazar\websites\yukon-wildcats-site" %VPS_USER%@%VPS_IP%:/tmp/yukon-wildcats-upload > temp_upload.bat
echo ssh %VPS_USER%@%VPS_IP% "sudo mkdir -p /var/www && sudo mv /tmp/yukon-wildcats-upload /var/www/yukon-wildcats && sudo chown -R %VPS_USER%:%VPS_USER% /var/www/yukon-wildcats" >> temp_upload.bat

echo.
echo 🔧 Commands to run on your VPS after upload:
echo.
echo 1. SSH into your VPS:
echo    ssh %VPS_USER%@%VPS_IP%
echo.
echo 2. Navigate to website directory:
echo    cd /var/www/yukon-wildcats
echo.
echo 3. Make deployment script executable:
echo    chmod +x deploy-vps.sh
echo.
echo 4. Run deployment script:
echo    sudo ./deploy-vps.sh
echo.
echo 5. Update domain in Nginx config:
echo    sudo nano /etc/nginx/sites-available/yukon-wildcats
echo    (Replace server_name with: %DOMAIN_NAME% www.%DOMAIN_NAME%)
echo.
echo 6. Reload Nginx:
echo    sudo nginx -t && sudo systemctl reload nginx
echo.
echo 7. Set up SSL certificate:
echo    sudo apt install certbot python3-certbot-nginx
echo    sudo certbot --nginx -d %DOMAIN_NAME% -d www.%DOMAIN_NAME%
echo.

echo ✅ After deployment, your website will be available at:
echo    http://%DOMAIN_NAME%
echo    https://%DOMAIN_NAME% (after SSL setup)
echo.

echo 📋 DNS Configuration Needed:
echo    Create these DNS records with your domain provider:
echo    A Record: @ (or blank) → %VPS_IP%
echo    A Record: www → %VPS_IP%
echo.

echo 🎯 Admin Access:
echo    Admin Panel: https://%DOMAIN_NAME%/admin.html
echo    Login Page: https://%DOMAIN_NAME%/login.html
echo.

echo Press any key to open the upload command file...
pause > nul

notepad temp_upload.bat

echo.
echo 📞 Emergency Contacts (already in website):
echo    Lazarus Vanbibber: (867) 332-0223
echo    Micah Wolfe: (867) 332-4551
echo    24/7 Emergency: (867) 332-4695
echo.

echo ✅ Deployment preparation complete!
echo    Copy the commands from temp_upload.bat and run them to start deployment.
echo.
pause

del temp_upload.bat