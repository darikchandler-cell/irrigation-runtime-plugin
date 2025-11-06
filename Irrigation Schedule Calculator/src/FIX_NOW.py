#!/usr/bin/env python3
"""
IMMEDIATE FIX for SchedulePreview.tsx Build Error
Removes corrupted lines 1052-1066 that contain invalid escaped backslashes
"""

def main():
    FILE_PATH = 'components/SchedulePreview.tsx'
    
    print("\n" + "="*70)
    print(" FIXING SCHEDULEPREVIEW.TSX BUILD ERROR")
    print("="*70 + "\n")
    
    # Read the file
    print(f"📖 Reading {FILE_PATH}...")
    try:
        with open(FILE_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ ERROR: {FILE_PATH} not found!")
        return 1
    
    lines = content.split('\n')
    total_lines = len(lines)
    print(f"   Original line count: {total_lines}\n")
    
    # Show what we're removing
    print("🔍 Corrupted section (lines 1052-1066):")
    print(f"   Line 1051: {lines[1050][:70]}...")
    print(f"   Line 1052 (BAD): {lines[1051][:70]}...")
    print(f"   Line 1066 (BAD): {lines[1065][:70]}...")
    print(f"   Line 1067: {lines[1066][:70]}...")
    print(f"   Line 1068: {lines[1067][:70]}...\n")
    
    # Create backup
    BACKUP_PATH = FILE_PATH + '.bak'
    print(f"💾 Creating backup: {BACKUP_PATH}")
    with open(BACKUP_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Fix: Remove lines 1052-1066 (indices 1051-1065 in 0-based array)
    print("🗑️  Removing lines 1052-1066 (16 corrupted lines)...\n")
    
    fixed_lines = lines[:1051] + ['\n'] + lines[1067:]
    
    # Write fixed file
    fixed_content = '\n'.join(fixed_lines)
    print(f"✍️  Writing fixed file...")
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    new_line_count = len(fixed_lines)
    lines_removed = total_lines - new_line_count
    
    print("\n" + "="*70)
    print(" ✅ SUCCESS - BUILD ERROR FIXED!")
    print("="*70)
    print(f"\n   Lines removed: {lines_removed}")
    print(f"   New line count: {new_line_count}")
    print(f"   Backup saved: {BACKUP_PATH}\n")
    print("🚀 Your plugin is now ready to build!\n")
    
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
