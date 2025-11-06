const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'SchedulePreview.tsx');

console.log('Reading file...');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines: ${lines.length}`);
console.log('Removing corrupted lines 1052-1066...');

// Remove lines 1052-1066 (0-indexed: lines 1051-1065)
const fixedLines = [
  ...lines.slice(0, 1051),  // Keep lines 0-1050 (lines 1-1051 in 1-indexed)
  ...lines.slice(1067)       // Keep lines 1067+ (lines 1068+ in 1-indexed)
];

const fixedContent = fixedLines.join('\n');

console.log('Writing fixed file...');
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log(`✅ Success! Removed ${lines.length - fixedLines.length} corrupted lines.`);
console.log(`✅ New line count: ${fixedLines.length}`);
