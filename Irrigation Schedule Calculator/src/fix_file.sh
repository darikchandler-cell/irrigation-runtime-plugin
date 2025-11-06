#!/bin/bash

# This script fixes the corrupted SchedulePreview.tsx by removing lines 1052-1066

echo "Creating backup..."
cp components/SchedulePreview.tsx components/SchedulePreview.tsx.backup

echo "Fixing file..."
# Use sed to delete lines 1052 through 1066
sed -i '1052,1066d' components/SchedulePreview.tsx

echo "✅ Done! Corrupted lines removed."
echo "Backup saved as: components/SchedulePreview.tsx.backup"
