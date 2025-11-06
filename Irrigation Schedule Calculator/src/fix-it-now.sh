#!/bin/sh
# Direct fix - removes lines 1052-1066 from SchedulePreview.tsx
FILE="components/SchedulePreview.tsx"
cp "$FILE" "$FILE.backup"
sed '1052,1066d' "$FILE.backup" > "$FILE"
echo "✅ Fixed! Removed lines 1052-1066. Backup: $FILE.backup"
