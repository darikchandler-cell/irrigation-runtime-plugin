#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE_PATH = join(__dirname, 'components', 'SchedulePreview.tsx');

console.log('\n🔧 INSTANT FIX - Removing corrupted lines...\n');

// Read, fix, write
const lines = readFileSync(FILE_PATH, 'utf8').split('\n');
writeFileSync(FILE_PATH + '.bak', lines.join('\n')); // Backup
const fixed = [...lines.slice(0, 1051), ...lines.slice(1067)].join('\n');
writeFileSync(FILE_PATH, fixed);

console.log(`✅ FIXED! Removed ${lines.length - fixed.split('\n').length} corrupted lines`);
console.log(`💾 Backup: ${FILE_PATH}.bak\n`);
