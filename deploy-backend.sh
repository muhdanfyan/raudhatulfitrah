#!/bin/bash
# Deploy Backend Script

LOG_FILE="/var/www/deploy.log"
DEPLOY_DIR="/var/www/pisantri-api"

echo "======================================" >> $LOG_FILE
echo "Backend Deploy: $(date)" >> $LOG_FILE

cd $DEPLOY_DIR

# Pull latest code
git pull origin main >> $LOG_FILE 2>&1

# Clear Laravel cache
php artisan config:clear >> $LOG_FILE 2>&1
php artisan cache:clear >> $LOG_FILE 2>&1
php artisan route:clear >> $LOG_FILE 2>&1

if [ $? -eq 0 ]; then
    echo "SUCCESS: Backend deployed" >> $LOG_FILE
    echo "Backend deployed successfully"
else
    echo "FAILED: Backend deploy failed" >> $LOG_FILE
    echo "Backend deploy failed"
    exit 1
fi
