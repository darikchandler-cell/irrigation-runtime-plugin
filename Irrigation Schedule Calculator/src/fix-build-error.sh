#!/bin/bash

# Fix SchedulePreview.tsx build error by removing corrupted lines 1052-1066

echo "Fixing SchedulePreview.tsx..."

# Use sed to delete lines 1052-1066 (inclusive)
sed -i.backup '1052,1066d' components/SchedulePreview.tsx

echo "✅ Fixed! Corrupted lines removed."
echo "📄 Backup saved as components/SchedulePreview.tsx.backup"
echo ""
echo "Now run: npm run package:plugin"
