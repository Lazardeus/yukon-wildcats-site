#!/bin/bash
# Yukon Wildcats Website Health Monitoring Script
# Checks website health and restarts services if needed

LOG_FILE="/var/log/yukon-wildcats-health.log"
WEBSITE="https://yukon-wildcats.ca"
MAX_RETRIES=3

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_nginx() {
    if ! systemctl is-active --quiet nginx; then
        log_message "ERROR: Nginx is not running. Attempting restart..."
        systemctl restart nginx
        sleep 2
        if systemctl is-active --quiet nginx; then
            log_message "SUCCESS: Nginx restarted successfully"
            return 0
        else
            log_message "CRITICAL: Failed to restart Nginx"
            return 1
        fi
    fi
    return 0
}

check_pm2() {
    if ! pm2 list | grep -q "online"; then
        log_message "ERROR: PM2 process not online. Attempting restart..."
        pm2 restart yukon-wildcats-server
        sleep 2
        if pm2 list | grep -q "online"; then
            log_message "SUCCESS: PM2 process restarted successfully"
            return 0
        else
            log_message "CRITICAL: Failed to restart PM2 process"
            return 1
        fi
    fi
    return 0
}

check_website() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE" --max-time 10)
    if [ "$response" = "200" ]; then
        return 0
    else
        log_message "WARNING: Website returned HTTP $response"
        return 1
    fi
}

check_ssl() {
    local days_until_expiry=$(echo | openssl s_client -servername yukon-wildcats.ca -connect yukon-wildcats.ca:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2 | xargs -I{} date -d "{}" +%s)
    local current_date=$(date +%s)
    local days_left=$(( ($days_until_expiry - $current_date) / 86400 ))
    
    if [ $days_left -lt 30 ]; then
        log_message "WARNING: SSL certificate expires in $days_left days. Consider renewal."
        return 1
    fi
    return 0
}

check_disk_space() {
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -gt 80 ]; then
        log_message "WARNING: Disk usage is at ${usage}%"
        return 1
    fi
    return 0
}

check_memory() {
    local mem_usage=$(free | awk '/Mem:/ {printf("%.0f", $3/$2 * 100)}')
    if [ $mem_usage -gt 85 ]; then
        log_message "WARNING: Memory usage is at ${mem_usage}%"
        return 1
    fi
    return 0
}

# Main monitoring routine
log_message "=== Starting health check ==="

check_nginx
nginx_status=$?

check_pm2
pm2_status=$?

check_website
website_status=$?

check_ssl
ssl_status=$?

check_disk_space
disk_status=$?

check_memory
memory_status=$?

if [ $nginx_status -eq 0 ] && [ $pm2_status -eq 0 ] && [ $website_status -eq 0 ]; then
    log_message "SUCCESS: All systems operational"
else
    log_message "WARNING: Some checks failed - review logs"
fi

log_message "=== Health check completed ==="
