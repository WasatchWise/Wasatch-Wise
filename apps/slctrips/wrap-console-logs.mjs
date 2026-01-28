#!/usr/bin/env node

/**
 * Script to wrap console.log statements in development checks
 * This prevents console logs from running in production
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('slctrips-v2/src/app/api/**/*.ts', { ignore: '**/node_modules/**' });

let totalReplaced = 0;
let filesModified = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  const originalContent = content;

  // Pattern to match console.log statements that aren't already wrapped in dev checks
  // This regex looks for console.log that isn't preceded by if (process.env.NODE_ENV
  const pattern = /^(\s*)(console\.log\([^;]+\);?)$/gm;

  let replacedInFile = 0;
  content = content.replace(pattern, (match, indent, logStatement) => {
    // Check if this line is already inside a dev check
    const lines = originalContent.substring(0, originalContent.indexOf(match)).split('\n');
    const recentLines = lines.slice(-10).join('\n');

    if (recentLines.includes("process.env.NODE_ENV === 'development'")) {
      return match; // Already wrapped, skip
    }

    replacedInFile++;
    return `${indent}if (process.env.NODE_ENV === 'development') {\n${indent}  ${logStatement}\n${indent}}`;
  });

  if (content !== originalContent) {
    writeFileSync(file, content, 'utf-8');
    filesModified++;
    totalReplaced += replacedInFile;
    console.log(`✅ ${file}: wrapped ${replacedInFile} console.log statements`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Console.log statements wrapped: ${totalReplaced}`);
