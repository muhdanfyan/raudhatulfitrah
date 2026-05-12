#!/bin/bash
# Deploy Frontend Script

LOG_FILE="/var/www/deploy.log"
DEPLOY_DIR="/var/www/pisantri"

echo "======================================" >> $LOG_FILE
echo "Frontend Deploy: $(date)" >> $LOG_FILE

cd $DEPLOY_DIR

# Backup current dist
if [ -d "dist" ]; then
    cp -r dist dist_backup_$(date +%Y%m%d_%H%M%S)
fi

# Pull latest code
git pull origin main >> $LOG_FILE 2>&1

# Build
npm run build >> $LOG_FILE 2>&1

if [ $? -eq 0 ]; then
    echo "SUCCESS: Frontend deployed" >> $LOG_FILE
    echo "Frontend deployed successfully"
else
    echo "FAILED: Frontend build failed" >> $LOG_FILE
    echo "Frontend build failed"
    exit 1
fi
