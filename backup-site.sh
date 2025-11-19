#!/bin/bash
# Yukon Wildcats Website - Automated Backup Script
# Creates compressed backups of website files and database

BACKUP_DIR="/root/backups"
WEBSITE_DIR="/var/www/yukon-wildcats"
SERVER_DIR="/var/www/yukon-wildcats/server"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="yukon-wildcats-backup-${DATE}.tar.gz"
LOG_FILE="/var/log/yukon-wildcats-backup.log"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_message "=== Starting backup process ==="

# Create backup
cd /var/www || exit 1
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" \
    --exclude='node_modules' \
    --exclude='yukon-wildcats/server/uploads' \
    --exclude='*.log' \
    yukon-wildcats/

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    log_message "SUCCESS: Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})"
    
    # Keep only last 7 backups
    cd "$BACKUP_DIR" || exit 1
    ls -t yukon-wildcats-backup-*.tar.gz | tail -n +8 | xargs -r rm --
    log_message "INFO: Cleaned up old backups (keeping last 7)"
else
    log_message "ERROR: Backup failed"
    exit 1
fi

log_message "=== Backup process completed ==="
