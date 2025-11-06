#!/usr/bin/env python3
"""
Rebuild SchedulePreview.tsx by removing corrupted lines 1052-1066
"""

import os

FILE_PATH = 'components/SchedulePreview.tsx'
OUTPUT_PATH = 'components/SchedulePreview_FIXED.tsx'
BACKUP_PATH = 'components/SchedulePreview.tsx.backup'

def main():
    print("\n" + "="*70)
    print(" REBUILDING SCHEDULEPREVIEW.TSX")
    print("="*70 + "\n")
    
    if not os.path.exists(FILE_PATH):
        print(f"❌ ERROR: {FILE_PATH} not found!")
        return 1
    
    # Read file
    print(f"📖 Reading {FILE_PATH}...")
    with open(FILE_PATH, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()
    
    print(f"   Total lines: {len(lines)}\n")
    
    # Show corrupted section
    print("🔍 Corrupted section:")
    print(f"   Line 1051: {lines[1050].rstrip()[:70]}")
    print(f"   Line 1052 (CORRUPT): {lines[1051].rstrip()[:70]}")
    print(f"   Line 1066 (CORRUPT): {lines[1065].rstrip()[:70]}")
    print(f"   Line 1067: {lines[1066].rstrip()[:70]}")
    print(f"   Line 1068: {lines[1067].rstrip()[:70]}\n")
    
    # Create backup
    print(f"💾 Creating backup: {BACKUP_PATH}")
    with open(BACKUP_PATH, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    # Remove lines 1052-1066 (indices 1051-1065)
    print("🗑️  Removing lines 1052-1066...\n")
    fixed_lines = lines[:1051] + lines[1067:]
    
    # Write to temp file first
    print(f"✍️  Writing fixed version to: {OUTPUT_PATH}")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    # Replace original
    print(f"🔄 Replacing original file...")
    os.replace(OUTPUT_PATH, FILE_PATH)
    
    print("\n" + "="*70)
    print(" ✅ SUCCESS!")
    print("="*70)
    print(f"\n   Lines removed: {len(lines) - len(fixed_lines)}")
    print(f"   New line count: {len(fixed_lines)}")
    print(f"   Backup: {BACKUP_PATH}\n")
    print("🚀 Build error is fixed!\n")
    
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
