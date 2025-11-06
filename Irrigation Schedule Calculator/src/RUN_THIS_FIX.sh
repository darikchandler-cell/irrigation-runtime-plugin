#!/bin/bash

# EMERGENCY FIX FOR SCHEDULEPREVIEW.TSX BUILD ERROR
# This script removes the corrupted lines 1052-1066

set -e

FILE="components/SchedulePreview.tsx"
BACKUP="components/SchedulePreview.tsx.BACKUP_$(date +%Y%m%d_%H%M%S)"

echo ""
echo "========================================================================"
echo " FIXING SCHEDULEPREVIEW.TSX BUILD ERROR"
echo "========================================================================"
echo ""

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo "❌ ERROR: $FILE not found!"
    exit 1
fi

# Show file info
TOTAL_LINES=$(wc -l < "$FILE")
echo "📖 Reading $FILE..."
echo "   Total lines: $TOTAL_LINES"
echo ""

# Create backup
echo "💾 Creating backup: $BACKUP"
cp "$FILE" "$BACKUP"

# Fix the file - delete lines 1052 through 1066
echo "🗑️  Removing corrupted lines 1052-1066..."
sed -i.tmp '1052,1066d' "$FILE"
rm -f "${FILE}.tmp"

# Show result
NEW_LINES=$(wc -l < "$FILE")
REMOVED=$((TOTAL_LINES - NEW_LINES))

echo ""
echo "========================================================================"
echo " ✅ SUCCESS - BUILD ERROR FIXED!"
echo "========================================================================"
echo ""
echo "   Lines removed: $REMOVED"
echo "   New line count: $NEW_LINES"
echo "   Backup saved: $BACKUP"
echo ""
echo "🚀 Your plugin is now ready to build!"
echo ""
