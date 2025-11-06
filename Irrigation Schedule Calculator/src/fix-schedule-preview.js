// Temporary script to fix SchedulePreview.tsx
// This script removes the corrupted lines 1051-1067

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'SchedulePreview.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Remove lines 1051-1067 (0-indexed, so 1050-1066)
const fixedLines = [
  ...lines.slice(0, 1050),  // Lines 1-1050
  ...lines.slice(1067)      // Lines 1068+
];

fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8');
console.log('Fixed SchedulePreview.tsx - removed corrupted lines 1051-1067');
