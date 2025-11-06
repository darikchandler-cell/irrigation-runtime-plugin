#!/usr/bin/env node

/**
 * AUTOMATED FIX FOR SCHEDULEPREV IEW.TSX BUILD ERROR
 * 
 * This script removes corrupted lines 1052-1066 which contain
 * invalid escaped backslashes in className attributes.
 * 
 * Error: Expected "{" but found "\\" at line 1052:25
 * 
 * Run this script to fix the build error:
 *   node APPLY_FIX.js
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'components', 'SchedulePreview.tsx');

console.log('='.repeat(60));
console.log('FIXING SCHEDULEPRE VIEW.TSX BUILD ERROR');
console.log('='.repeat(60));
console.log('');

try {
  // Check if file exists
  if (!fs.existsSync(FILE_PATH)) {
    console.error('❌ ERROR: SchedulePreview.tsx not found!');
    console.error(`   Expected at: ${FILE_PATH}`);
    process.exit(1);
  }

  console.log('📖 Reading file...');
  const content = fs.readFileSync(FILE_PATH, 'utf8');
  const lines = content.split('\n');
  
  console.log(`   Total lines: ${lines.length}`);
  console.log('');
  
  // Show what we're removing
  console.log('🗑️  Removing corrupted lines 1052-1066:');
  console.log('   Line 1051:', lines[1050].substring(0, 60) + '...');
  console.log('   Line 1052 (CORRUPT):', lines[1051].substring(0, 60) + '...');
  console.log('   Line 1066 (CORRUPT):', lines[1065].substring(0, 60) + '...');
  console.log('   Line 1067:', lines[1066].substring(0, 60) + '...');
  console.log('   Line 1068:', lines[1067].substring(0, 60) + '...');
  console.log('');
  
  // Create fixed version: keep lines 0-1050, skip 1051-1065, keep 1066+
  const fixedLines = [
    ...lines.slice(0, 1051),  // Lines 1-1051 (0-indexed: 0-1050)
    ...lines.slice(1067)       // Lines 1068+ (0-indexed: 1067+)
  ];
  
  const fixedContent = fixedLines.join('\n');
  
  // Backup original file
  const backupPath = FILE_PATH + '.backup';
  console.log(`💾 Creating backup at: ${backupPath}`);
  fs.writeFileSync(backupPath, content, 'utf8');
  
  // Write fixed file
  console.log('✍️  Writing fixed file...');
  fs.writeFileSync(FILE_PATH, fixedContent, 'utf8');
  
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ SUCCESS!');
  console.log('='.repeat(60));
  console.log('');
  console.log(`   Lines removed: ${lines.length - fixedLines.length}`);
  console.log(`   New line count: ${fixedLines.length}`);
  console.log(`   Backup saved: ${backupPath}`);
  console.log('');
  console.log('🚀 Build error is now fixed!');
  console.log('   You can now run: npm run build');
  console.log('');
  
  process.exit(0);
  
} catch (error) {
  console.error('');
  console.error('❌ ERROR:', error.message);
  console.error('');
  console.error('Stack trace:');
  console.error(error.stack);
  console.error('');
  process.exit(1);
}
