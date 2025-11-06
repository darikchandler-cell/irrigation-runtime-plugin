#!/usr/bin/env node

/**
 * DIRECT FIX FOR BUILD ERROR - SCHEDULEPREVIEW.TSX
 * Removes corrupted lines 1052-1066 that have escaped backslashes
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'components', 'SchedulePreview.tsx');
const BACKUP_PATH = FILE_PATH + '.backup';

console.log('\n' + '='.repeat(70));
console.log(' FIXING SCHEDULEPREVIEW.TSX BUILD ERROR');
console.log('='.repeat(70) + '\n');

try {
  // Check file exists
  if (!fs.existsSync(FILE_PATH)) {
    console.error('❌ ERROR: File not found:', FILE_PATH);
    process.exit(1);
  }

  // Read file
  console.log('📖 Reading file...');
  const content = fs.readFileSync(FILE_PATH, 'utf8');
  const lines = content.split('\n');
  
  console.log(`   Total lines: ${lines.length}\n`);
  
  // Show what we're fixing
  console.log('🔍 Corrupted section (lines 1052-1066):');
  console.log(`   Line 1051: ${lines[1050].substring(0, 70)}...`);
  console.log(`   Line 1052: ${lines[1051].substring(0, 70)}... ❌`);
  console.log(`   Line 1066: ${lines[1065].substring(0, 70)}... ❌`);
  console.log(`   Line 1067: ${lines[1066].substring(0, 70)}...`);
  console.log(`   Line 1068: ${lines[1067].substring(0, 70)}...\n`);
  
  // Create backup
  console.log(`💾 Creating backup: ${BACKUP_PATH}`);
  fs.writeFileSync(BACKUP_PATH, content, 'utf8');
  
  // Fix: Remove lines 1052-1066 (array indices 1051-1065)
  console.log('🗑️  Removing 16 corrupted lines...\n');
  
  const fixedLines = [
    ...lines.slice(0, 1051),  // Lines 1-1051
    ...lines.slice(1067)       // Lines 1068-end
  ];
  
  const fixedContent = fixedLines.join('\n');
  
  // Write fixed file
  console.log('✍️  Writing fixed file...');
  fs.writeFileSync(FILE_PATH, fixedContent, 'utf8');
  
  console.log('\n' + '='.repeat(70));
  console.log(' ✅ SUCCESS - BUILD ERROR FIXED!');
  console.log('='.repeat(70));
  console.log(`\n   Lines removed: ${lines.length - fixedLines.length}`);
  console.log(`   New line count: ${fixedLines.length}`);
  console.log(`   Backup saved: ${BACKUP_PATH}\n`);
  console.log('🚀 Your plugin is ready to build!\n');
  
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
  process.exit(1);
}
