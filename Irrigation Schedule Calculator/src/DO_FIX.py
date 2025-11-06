#!/usr/bin/env python3

# Read file
with open('components/SchedulePreview.tsx', 'r') as f:
    lines = f.readlines()

# Backup
with open('components/SchedulePreview.tsx.bak', 'w') as f:
    f.writelines(lines)

# Fix: remove lines 1052-1066 (indices 1051-1065)
fixed = lines[:1051] + lines[1067:]

# Write
with open('components/SchedulePreview.tsx', 'w') as f:
    f.writelines(fixed)

print(f"✅ FIXED! Removed {len(lines) - len(fixed)} lines")
print(f"Original: {len(lines)} lines → Fixed: {len(fixed)} lines")
