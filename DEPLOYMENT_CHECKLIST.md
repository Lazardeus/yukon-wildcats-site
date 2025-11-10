# 🚀 Yukon Wildcats VPS Deployment Checklist

## Pre-Deployment Requirements ✅

### VPS Setup
- [ ] VPS server running (Ubuntu 20.04+ recommended)
- [ ] Root or sudo access
- [ ] Git installed: `sudo apt install git`
- [ ] Node.js installed: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs`
- [ ] Domain name purchased (recommend: yukon-wildcats.ca or yukonwildcatscontracting.com)

## Step 1: Upload Code to VPS 📤

### Option A: Via Git (Recommended)
```bash
# On your VPS, run these commands:
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/Lazardeus/yukon-wildcats-site.git yukon-wildcats
sudo chown -R $USER:$USER /var/www/yukon-wildcats
```

### Option B: Via File Transfer (Alternative)
```bash
# From your local machine:
scp -r "c:\Users\lazar\websites\yukon-wildcats-site" user@your-vps-ip:/var/www/yukon-wildcats
```

## Step 2: Run Deployment Script 🔧
```bash
# On your VPS:
cd /var/www/yukon-wildcats
chmod +x deploy-vps.sh
sudo ./deploy-vps.sh
```

## Step 3: Configure Domain & DNS 🌐

### Domain Options (Choose one):
1. **yukon-wildcats.ca** (Perfect match!)
2. **yukonwildcatscontracting.com** 
3. **ywcontracting.ca**
4. **yukoncontracting.ca**

### DNS Configuration:
```
A Record: @ -> Your VPS IP Address
A Record: www -> Your VPS IP Address
```

## Step 4: SSL Certificate Setup 🔒
```bash
# On your VPS:
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 5: Verification Tests ✅

### Test Local Access:
- [ ] http://your-vps-ip (should show website)
- [ ] http://your-vps-ip/admin.html (admin panel)
- [ ] http://your-vps-ip/api/health (should return server status)

### Test Domain Access:
- [ ] http://yourdomain.com
- [ ] https://yourdomain.com (after SSL)
- [ ] https://www.yourdomain.com

### Test Functionality:
- [ ] Homepage loads with all sections
- [ ] Whitney AI chatbot works
- [ ] Quote system functions
- [ ] Admin login works
- [ ] Contact forms submit
- [ ] Mobile responsive design

## Step 6: Production Optimizations 🏆

### Security:
- [ ] Change default admin passwords
- [ ] Enable firewall: `sudo ufw enable`
- [ ] Update security headers in Nginx
- [ ] Set up fail2ban: `sudo apt install fail2ban`

### Performance:
- [ ] Enable Nginx compression
- [ ] Set up static file caching
- [ ] Configure PM2 clustering
- [ ] Monitor with `pm2 monit`

### Monitoring:
- [ ] Set up log rotation
- [ ] Configure automated backups
- [ ] Monitor disk space usage
- [ ] Set up uptime monitoring

## Emergency Contacts & Support 📞
- **Lazarus Vanbibber**: (867) 332-0223
- **Micah Wolfe**: (867) 332-4551
- **Emergency Service Line**: (867) 332-4695

## Domain Registration Recommendations 💰

### Canadian Providers:
1. **Namecheap.ca** - $15-20/year, excellent support
2. **GoDaddy.ca** - $20-25/year, popular choice  
3. **Domain.ca** - $18-22/year, Canadian owned
4. **Hover.com** - $20-25/year, clean interface

### Domain Suggestions (in order of preference):
1. **yukon-wildcats.ca** ⭐ BEST CHOICE
2. **yukonwildcatscontracting.com**
3. **ywcontracting.ca** 
4. **yukoncontracting.ca**

## Post-Deployment Checklist ✅

### Immediate (Day 1):
- [ ] Domain purchased and DNS configured
- [ ] SSL certificate installed
- [ ] All admin passwords changed
- [ ] Contact information verified
- [ ] Basic functionality tested

### Week 1:
- [ ] Google Analytics/Search Console setup
- [ ] Social media links updated
- [ ] Business listings updated with new domain
- [ ] Email signatures updated

### Month 1:
- [ ] SEO optimization review
- [ ] Performance monitoring baseline
- [ ] Backup strategy verified
- [ ] User feedback collected

## Success Metrics 📊
- [ ] Website loads in <3 seconds
- [ ] 99%+ uptime achieved
- [ ] Mobile-friendly (Google test)
- [ ] SSL A+ rating (SSL Labs)
- [ ] All contact forms working
- [ ] Admin panel accessible

## Estimated Timeline ⏱️
- **Setup**: 2-3 hours
- **Domain/DNS**: 24-48 hours (propagation)
- **SSL**: 15 minutes
- **Testing**: 1-2 hours
- **Total**: 1-3 days for full deployment

## Budget Estimate 💵
- **Domain**: $15-25/year
- **VPS**: $5-20/month (if not existing)
- **SSL**: Free (Let's Encrypt)
- **Total First Year**: $75-265 (mostly domain + hosting)

---

## 🎯 **THE GOAL**: 
Get **yukon-wildcats.ca** pointing to your optimized website with HTTPS, full functionality, and professional presentation for clients across Yukon Territory!

**Your 15-page optimized website is ready for the world! 🌟**