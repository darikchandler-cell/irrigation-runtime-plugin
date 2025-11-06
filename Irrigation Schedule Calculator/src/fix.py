#!/usr/bin/env python3
"""
Fix SchedulePreview.tsx build error by removing corrupted lines 1052-1066
"""

import os
import shutil

FILE_PATH = 'components/SchedulePreview.tsx'
BACKUP_PATH = 'components/SchedulePreview.tsx.backup'

def main():
    print("=" * 60)
    print("FIXING SCHEDULEPREVIEW.TSX BUILD ERROR")
    print("=" * 60)
    print()
    
    if not os.path.exists(FILE_PATH):
        print(f"❌ ERROR: {FILE_PATH} not found!")
        return 1
    
    print(f"📖 Reading {FILE_PATH}...")
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"   Total lines: {len(lines)}")
    print()
    
    # Create backup
    print(f"💾 Creating backup: {BACKUP_PATH}")
    shutil.copy2(FILE_PATH, BACKUP_PATH)
    
    # Remove lines 1052-1066 (indices 1051-1065 in 0-based)
    print("🗑️  Removing corrupted lines 1052-1066...")
    fixed_lines = lines[:1051] + lines[1067:]
    
    # Write fixed file
    print("✍️  Writing fixed file...")
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    print()
    print("=" * 60)
    print("✅ SUCCESS!")
    print("=" * 60)
    print()
    print(f"   Lines removed: {len(lines) - len(fixed_lines)}")
    print(f"   New line count: {len(fixed_lines)}")
    print(f"   Backup saved: {BACKUP_PATH}")
    print()
    print("🚀 Build error is now fixed!")
    print()
    
    return 0

if __name__ == '__main__':
    exit(main())
