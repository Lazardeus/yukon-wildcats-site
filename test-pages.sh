#!/bin/bash
# Quick page accessibility test

echo "Testing all pages..."
pages=("index.html" "services.html" "snow.html" "tow.html" "web-services.html" "contact.html" "quote.html" "legal.html")

for page in "${pages[@]}"; do
    status=$(curl -s -o /dev/null -w '%{http_code}' "https://yukon-wildcats.ca/$page")
    if [ "$status" = "200" ]; then
        echo "✓ $page - OK"
    else
        echo "✗ $page - HTTP $status"
    fi
done

echo ""
echo "Testing SEO files..."
curl -s -o /dev/null -w "robots.txt: HTTP %{http_code}\n" https://yukon-wildcats.ca/robots.txt
curl -s -o /dev/null -w "sitemap.xml: HTTP %{http_code}\n" https://yukon-wildcats.ca/sitemap.xml

echo ""
echo "All tests complete!"
