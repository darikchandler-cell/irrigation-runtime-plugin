#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Fixing corrupted lines in SchedulePreview.tsx...');

try {
  // Read the entire file
  const content = readFileSync('./components/SchedulePreview.tsx', 'utf8');
  const lines = content.split('\n');
  
  console.log(`📄 Total lines in file: ${lines.length}`);
  console.log(`🗑️  Removing corrupted lines 1052-1066 (16 lines)...`);
  
  // Remove lines 1052-1066 (0-indexed: 1051-1065)
  // Keep lines 0-1050 and 1067+
  const fixedLines = [
    ...lines.slice(0, 1051),  // Lines 1-1051
    ...lines.slice(1067)       // Lines 1068+
  ];
  
  // Join back together
  const fixedContent = fixedLines.join('\n');
  
  // Write the fixed content
  writeFileSync('./components/SchedulePreview.tsx', fixedContent, 'utf8');
  
  console.log(`✅ Fixed! New line count: ${fixedLines.length}`);
  console.log(`✅ Removed ${lines.length - fixedLines.length} corrupted lines`);
  console.log('✅ Build error should now be resolved!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
