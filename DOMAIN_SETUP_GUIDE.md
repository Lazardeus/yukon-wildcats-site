# Domain Connection Guide for yukon-wildcats.ca

## Current Status
- ✅ VPS IP: `159.203.15.71`
- ✅ SSH Access: Working with key authentication
- ✅ Website Running: PM2 process online (2 days uptime)
- ✅ Nginx Configured: Already set for yukon-wildcats.ca
- ✅ Certbot Installed: Ready for SSL setup
- ⚠️ DNS: Currently pointing to `84.32.84.32` (needs update)

## Step 1: Update DNS Records (DO THIS FIRST!)

Go to your domain registrar where you purchased `yukon-wildcats.ca` and update these DNS records:

### Required DNS Records:
```
Type: A Record
Name: @
Value: 159.203.15.71
TTL: 300 (or default)

Type: A Record  
Name: www
Value: 159.203.15.71
TTL: 300 (or default)
```

### How to Update DNS:
1. Log into your domain registrar (e.g., GoDaddy, Namecheap, Google Domains, etc.)
2. Find DNS settings/DNS management
3. Look for existing A records for `@` and `www`
4. Change the IP from `84.32.84.32` to `159.203.15.71`
5. Save changes

**DNS propagation can take 5 minutes to 48 hours.** Usually it's done within 1-2 hours.

### Check DNS Propagation:
Run this command on your PC to check if DNS has updated:
```powershell
nslookup yukon-wildcats.ca 8.8.8.8
```

Wait until it shows `159.203.15.71` instead of `84.32.84.32`.

---

## Step 2: Get Free SSL Certificate (After DNS Points to VPS)

Once DNS is updated and pointing to your VPS, run these commands:

### SSH into VPS:
```powershell
ssh -i "c:\Users\lazar\keys" root@159.203.15.71
```

### Get SSL Certificate:
```bash
certbot --nginx -d yukon-wildcats.ca -d www.yukon-wildcats.ca
```

### During Certbot Setup:
1. Enter your email address (for renewal notifications)
2. Agree to Terms of Service: `Y`
3. Share email with EFF (optional): `N` or `Y` (your choice)
4. Choose redirect option: `2` (Redirect HTTP to HTTPS - recommended)

Certbot will:
- Automatically verify domain ownership
- Install SSL certificate
- Configure Nginx for HTTPS
- Set up automatic renewal

---

## Step 3: Verify Everything Works

### Test Your Website:
- **Main site:** https://yukon-wildcats.ca
- **With www:** https://www.yukon-wildcats.ca  
- **Admin panel:** https://yukon-wildcats.ca/admin.html
- **Quote system:** https://yukon-wildcats.ca/quote.html

### Test HTTP to HTTPS Redirect:
Try visiting http://yukon-wildcats.ca (without the 's') - it should automatically redirect to HTTPS.

### Check SSL Certificate:
```bash
certbot certificates
```

---

## Troubleshooting

### If Certbot Fails with "Domain doesn't resolve to this server":
DNS hasn't propagated yet. Wait longer and check with:
```powershell
nslookup yukon-wildcats.ca 8.8.8.8
```

### If You Get Nginx Errors:
Test Nginx configuration:
```bash
nginx -t
systemctl reload nginx
```

### Check Logs:
```bash
# PM2 logs
pm2 logs yukon-wildcats-server

# Nginx error logs
tail -f /var/log/nginx/error.log

# Certbot logs
tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## Optional: Test Site Before DNS Propagates

You can test the site using your VPS IP while waiting for DNS:
- http://159.203.15.71

But SSL won't work until DNS is properly configured because certificates require valid domain names.

---

## Automatic SSL Renewal

Certbot automatically sets up a cron job/timer to renew certificates before they expire (every 90 days).

Test automatic renewal:
```bash
certbot renew --dry-run
```

---

## Quick Command Reference

### SSH into VPS:
```powershell
ssh -i "c:\Users\lazar\keys" root@159.203.15.71
```

### Check PM2 Status:
```bash
pm2 status
pm2 logs yukon-wildcats-server
```

### Restart Website:
```bash
pm2 restart yukon-wildcats-server
```

### Check Nginx:
```bash
systemctl status nginx
nginx -t
systemctl reload nginx
```

### View SSL Certificates:
```bash
certbot certificates
```

---

## Current Admin Credentials

⚠️ **IMPORTANT:** Change these after setup!

Located in: `/var/www/yukon-wildcats/server/.env`

```
OWNER_USERNAME=admin
OWNER_PASSWORD=YukonWildcats2025!
ADMIN_USERNAME=manager
ADMIN_PASSWORD=Manager2025!
```

To change passwords:
```bash
nano /var/www/yukon-wildcats/server/.env
# Edit passwords, save, then restart:
pm2 restart yukon-wildcats-server
```

---

## Contact Information on Website

Already configured with:
- Lazarus Vanbibber: (867) 332-0223 | lazarus.vanbibber@icloud.com
- Micah Wolfe: (867) 332-4551 | Micahsage4444@gmail.com
- 24/7 Emergency: (867) 332-4695

---

## Next Steps After Domain Is Live

1. ✅ Update DNS records (Step 1)
2. ⏳ Wait for DNS propagation (check with nslookup)
3. 🔒 Install SSL certificate (Step 2)
4. 🧪 Test all functionality (Step 3)
5. 🔑 Change admin passwords
6. 📧 Test contact forms
7. 💰 Test quote system
8. 📱 Test on mobile devices

---

## Support

If you encounter issues:
1. Check logs: `pm2 logs` and `/var/log/nginx/error.log`
2. Verify DNS: `nslookup yukon-wildcats.ca`
3. Test Nginx: `nginx -t`
4. Restart services: `pm2 restart all` and `systemctl reload nginx`
