#!/bin/bash
# Yukon Wildcats Website - Comprehensive Status Dashboard
# Real-time monitoring and health checks

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║     YUKON WILDCATS WEBSITE - STATUS DASHBOARD            ║${NC}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')${NC}"
echo ""

# ============= WEBSITE AVAILABILITY =============
echo -e "${BOLD}${BLUE}━━━ WEBSITE AVAILABILITY ━━━${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}|%{size_download}" https://yukon-wildcats.ca/)
IFS='|' read -r http_code load_time size <<< "$response"

if [ "$http_code" = "200" ]; then
    echo -e "  Status:       ${GREEN}✓ ONLINE${NC} (HTTP $http_code)"
else
    echo -e "  Status:       ${RED}✗ ISSUE${NC} (HTTP $http_code)"
fi
echo -e "  Load Time:    ${load_time}s"
echo -e "  Page Size:    $((size / 1024)) KB"
echo ""

# ============= PAGE CHECKS =============
echo -e "${BOLD}${BLUE}━━━ PAGE AVAILABILITY ━━━${NC}"
pages=("index.html" "services.html" "snow.html" "tow.html" "web-services.html" "contact.html" "quote.html" "legal.html")
for page in "${pages[@]}"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "https://yukon-wildcats.ca/$page")
    if [ "$code" = "200" ]; then
        echo -e "  ${page}: ${GREEN}✓${NC}"
    else
        echo -e "  ${page}: ${RED}✗ ($code)${NC}"
    fi
done
echo ""

# ============= SSL CERTIFICATE =============
echo -e "${BOLD}${BLUE}━━━ SSL CERTIFICATE ━━━${NC}"
ssl_info=$(echo | openssl s_client -servername yukon-wildcats.ca -connect yukon-wildcats.ca:443 2>/dev/null | openssl x509 -noout -dates)
expiry=$(echo "$ssl_info" | grep notAfter | cut -d= -f2)
days_left=$(( ($(date -d "$expiry" +%s) - $(date +%s)) / 86400 ))

if [ $days_left -gt 30 ]; then
    echo -e "  Status:       ${GREEN}✓ VALID${NC}"
elif [ $days_left -gt 7 ]; then
    echo -e "  Status:       ${YELLOW}⚠ RENEW SOON${NC}"
else
    echo -e "  Status:       ${RED}✗ EXPIRING${NC}"
fi
echo -e "  Expires:      $expiry"
echo -e "  Days Left:    $days_left days"
echo ""

# ============= SERVER SERVICES =============
echo -e "${BOLD}${BLUE}━━━ SERVER SERVICES ━━━${NC}"

# Nginx
if systemctl is-active --quiet nginx; then
    echo -e "  Nginx:        ${GREEN}✓ RUNNING${NC}"
    uptime=$(systemctl status nginx | grep "Active:" | sed 's/.*ago)//' | xargs)
else
    echo -e "  Nginx:        ${RED}✗ STOPPED${NC}"
fi

# PM2
pm2_status=$(pm2 list | grep "yukon-wildcats-server" | awk '{print $12}')
if [ "$pm2_status" = "online" ]; then
    echo -e "  PM2:          ${GREEN}✓ ONLINE${NC}"
    restarts=$(pm2 list | grep "yukon-wildcats-server" | awk '{print $10}')
    echo -e "  Restarts:     $restarts"
else
    echo -e "  PM2:          ${RED}✗ OFFLINE${NC}"
fi
echo ""

# ============= SYSTEM RESOURCES =============
echo -e "${BOLD}${BLUE}━━━ SYSTEM RESOURCES ━━━${NC}"

# CPU
cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
echo -e "  CPU Usage:    ${cpu_usage}%"

# Memory
mem_info=$(free -m | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$mem_info" -lt 75 ]; then
    echo -e "  Memory:       ${GREEN}${mem_info}%${NC}"
elif [ "$mem_info" -lt 85 ]; then
    echo -e "  Memory:       ${YELLOW}${mem_info}%${NC}"
else
    echo -e "  Memory:       ${RED}${mem_info}%${NC}"
fi

# Disk
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 75 ]; then
    echo -e "  Disk Usage:   ${GREEN}${disk_usage}%${NC}"
elif [ "$disk_usage" -lt 85 ]; then
    echo -e "  Disk Usage:   ${YELLOW}${disk_usage}%${NC}"
else
    echo -e "  Disk Usage:   ${RED}${disk_usage}%${NC}"
fi
echo ""

# ============= DOMAIN & DNS =============
echo -e "${BOLD}${BLUE}━━━ DOMAIN & DNS ━━━${NC}"
echo -e "  Domain:       yukon-wildcats.ca"
a_record=$(dig +short yukon-wildcats.ca A | head -n1)
if [ "$a_record" = "159.203.15.71" ]; then
    echo -e "  DNS (A):      ${GREEN}✓ $a_record${NC}"
else
    echo -e "  DNS (A):      ${YELLOW}⚠ $a_record${NC}"
fi
echo ""

# ============= SEO STATUS =============
echo -e "${BOLD}${BLUE}━━━ SEO STATUS ━━━${NC}"

# Check robots.txt
robots_check=$(curl -s -o /dev/null -w "%{http_code}" https://yukon-wildcats.ca/robots.txt)
if [ "$robots_check" = "200" ]; then
    echo -e "  robots.txt:   ${GREEN}✓ PRESENT${NC}"
else
    echo -e "  robots.txt:   ${RED}✗ MISSING${NC}"
fi

# Check sitemap.xml
sitemap_check=$(curl -s -o /dev/null -w "%{http_code}" https://yukon-wildcats.ca/sitemap.xml)
if [ "$sitemap_check" = "200" ]; then
    echo -e "  sitemap.xml:  ${GREEN}✓ PRESENT${NC}"
else
    echo -e "  sitemap.xml:  ${RED}✗ MISSING${NC}"
fi

# Check meta tags on homepage
meta_check=$(curl -s https://yukon-wildcats.ca/ | grep -c "og:description")
if [ "$meta_check" -gt 0 ]; then
    echo -e "  Meta Tags:    ${GREEN}✓ CONFIGURED${NC}"
else
    echo -e "  Meta Tags:    ${YELLOW}⚠ CHECK NEEDED${NC}"
fi
echo ""

# ============= RECENT LOGS =============
echo -e "${BOLD}${BLUE}━━━ RECENT ACTIVITY ━━━${NC}"
if [ -f "/var/log/yukon-wildcats-health.log" ]; then
    echo -e "  Last Health Check:"
    tail -n 3 /var/log/yukon-wildcats-health.log | sed 's/^/    /'
else
    echo -e "  ${YELLOW}No health check logs yet${NC}"
fi
echo ""

# ============= BACKUP STATUS =============
echo -e "${BOLD}${BLUE}━━━ BACKUP STATUS ━━━${NC}"
if [ -d "/root/backups" ]; then
    latest_backup=$(ls -t /root/backups/*.tar.gz 2>/dev/null | head -n1)
    if [ -n "$latest_backup" ]; then
        backup_date=$(stat -c %y "$latest_backup" | cut -d' ' -f1)
        backup_size=$(du -h "$latest_backup" | cut -f1)
        echo -e "  Latest:       $backup_date ($backup_size)"
    else
        echo -e "  ${YELLOW}No backups found${NC}"
    fi
else
    echo -e "  ${YELLOW}Backup directory not configured${NC}"
fi
echo ""

# ============= QUICK ACTIONS =============
echo -e "${BOLD}${BLUE}━━━ QUICK ACTIONS ━━━${NC}"
echo -e "  Restart Nginx:    ${CYAN}systemctl restart nginx${NC}"
echo -e "  Restart PM2:      ${CYAN}pm2 restart yukon-wildcats-server${NC}"
echo -e "  View Logs:        ${CYAN}pm2 logs yukon-wildcats-server${NC}"
echo -e "  Check Health:     ${CYAN}/root/health-check.sh${NC}"
echo ""

echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║                  END OF REPORT                            ║${NC}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
