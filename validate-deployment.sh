#!/bin/bash

# Yukon Wildcats Website Validation Script
# Run this on your VPS after deployment to verify everything works

echo "🔍 Validating Yukon Wildcats Website Deployment..."
echo "=================================================="

# Configuration
PROJECT_DIR="/var/www/yukon-wildcats"
SERVER_URL="http://localhost:3000"
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "Unable to detect")

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

# Basic system tests
echo "🖥️  System Tests:"
run_test "Node.js installed" "command -v node"
run_test "PM2 installed" "command -v pm2"
run_test "Nginx installed" "command -v nginx"
run_test "Project directory exists" "[ -d $PROJECT_DIR ]"
run_test "Server files exist" "[ -f $PROJECT_DIR/server/server.js ]"

echo ""
echo "🚀 Application Tests:"
run_test "PM2 process running" "pm2 describe yukon-wildcats-server | grep -q 'online'"
run_test "Node.js server responding" "curl -f $SERVER_URL > /dev/null 2>&1"
run_test "Nginx running" "systemctl is-active nginx | grep -q 'active'"
run_test "Port 80 listening" "netstat -ln | grep -q ':80 '"

echo ""
echo "🌐 Website Content Tests:"
run_test "Homepage loads" "curl -f http://localhost/ | grep -q 'Yukon Wildcats'"
run_test "Admin panel exists" "curl -f http://localhost/admin.html | grep -q 'admin'"
run_test "Quote system exists" "curl -f http://localhost/quote.html | grep -q 'quote'"
run_test "Contact page exists" "curl -f http://localhost/contact.html | grep -q 'contact'"
run_test "CSS files accessible" "curl -f http://localhost/css/style.css > /dev/null 2>&1"
run_test "JavaScript files accessible" "curl -f http://localhost/js/script.js > /dev/null 2>&1"

echo ""
echo "🔐 Security Tests:"
run_test "Firewall enabled" "ufw status | grep -q 'active'"
run_test "Environment file exists" "[ -f $PROJECT_DIR/server/.env ]"
run_test "Proper file permissions" "[ $(stat -c '%a' $PROJECT_DIR/server/.env) = '644' ]"

echo ""
echo "📊 VALIDATION RESULTS:"
echo "======================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Your website is ready!${NC}"
    echo ""
    echo "🌐 Access Your Website:"
    echo "   Main Site: http://$VPS_IP"
    echo "   Admin Panel: http://$VPS_IP/admin.html"
    echo "   Quote System: http://$VPS_IP/quote.html"
    echo ""
    echo "📞 Emergency Contacts (available 24/7):"
    echo "   Lazarus Vanbibber: (867) 332-0223"
    echo "   Micah Wolfe: (867) 332-4551"
    echo "   Emergency Line: (867) 332-4695"
    echo ""
    echo -e "${YELLOW}🔒 Security Reminder: Change default passwords in $PROJECT_DIR/server/.env${NC}"
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Check the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Restart services: sudo systemctl restart nginx && pm2 restart yukon-wildcats-server"
    echo "2. Check logs: pm2 logs yukon-wildcats-server"
    echo "3. Verify ports: netstat -tlnp | grep -E ':80|:3000'"
fi

echo ""
echo "📋 Quick Commands:"
echo "   View PM2 status: pm2 status"
echo "   View PM2 logs: pm2 logs"
echo "   Restart website: pm2 restart yukon-wildcats-server"
echo "   Check Nginx: sudo nginx -t"
echo "   Reload Nginx: sudo systemctl reload nginx"