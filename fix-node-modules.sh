#!/bin/bash
rm -rf node_modules/date-fns node_modules/.date-fns-* 2>/dev/null
find node_modules -maxdepth 2 -name ".*" -type d -exec rm -rf {} + 2>/dev/null
echo "cleaned"
