#!/usr/bin/env node

/**
 * Comprehensive Code Health Check
 * Finds common issues: missing colors, accessibility, type safety, etc.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const issues = [];
const warnings = [];

// Check for headings without explicit text colors
function checkHeadingColors(content, filePath) {
  const lines = content.split('\n');
  const headingRegex = /<h[1-6][^>]*className="([^"]*)"/g;
  
  lines.forEach((line, lineNum) => {
    const matches = [...line.matchAll(headingRegex)];
    matches.forEach(match => {
      const className = match[1];
      const hasTextColor = /text-(white|gray-|black|blue-|green-|yellow-|red-|purple-|indigo-|pink-|orange-)/.test(className);
      const hasGradient = /bg-clip-text|text-transparent/.test(className);
      
      // Check if on dark or light background
      const isDarkBg = /bg-(gray-900|gray-800|black|blue-900|purple-900)/.test(content);
      const isLightBg = /bg-(white|gray-50|gray-100|blue-50|purple-50)/.test(content);
      
      if (!hasTextColor && !hasGradient) {
        issues.push({
          file: filePath,
          line: lineNum + 1,
          severity: 'error',
          message: `Heading may be invisible: missing explicit text color class`,
          code: line.trim().substring(0, 100)
        });
      }
    });
  });
}

// Check for images without alt text
function checkImageAlt(content, filePath) {
  const imageRegex = /<img[^>]+>/g;
  const lines = content.split('\n');
  
  lines.forEach((line, lineNum) => {
    const matches = [...line.matchAll(imageRegex)];
    matches.forEach(match => {
      if (!match[0].includes('alt=')) {
        issues.push({
          file: filePath,
          line: lineNum + 1,
          severity: 'error',
          message: `Image missing alt attribute`,
          code: line.trim().substring(0, 100)
        });
      }
    });
  });
}

// Check for links without href
function checkLinks(content, filePath) {
  // Avoid matching tags like <audio>, <abbr>, etc.
  const linkRegex = /<a(\s|>)[^>]*>/g;
  const lines = content.split('\n');
  
  lines.forEach((line, lineNum) => {
    const matches = [...line.matchAll(linkRegex)];
    matches.forEach(match => {
      if (!match[0].includes('href=')) {
        warnings.push({
          file: filePath,
          line: lineNum + 1,
          severity: 'warning',
          message: `Link missing href attribute`,
          code: line.trim().substring(0, 100)
        });
      }
    });
  });
}

// Check for console.log in production code
function checkConsoleLogs(content, filePath) {
  if (filePath.includes('test') || filePath.includes('script')) return;
  
  const lines = content.split('\n');
  lines.forEach((line, lineNum) => {
    // Only flag actual console.log calls, not references like `console.log` passed as a value
    if (!/\bconsole\.log\s*\(/.test(line)) return;

    // Ignore commented-out console.log examples (common in docs/comments)
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

    // Consider it "gated" if:
    // - the same line references NODE_ENV, OR
    // - one of the previous few lines references NODE_ENV (typical pattern: if (...) { then console.log on next line)
    const hasEnvOnLine = line.includes('process.env.NODE_ENV');
    const hasEnvVeryNear = lines
      .slice(Math.max(0, lineNum - 4), lineNum)
      .some((prev) => prev.includes('process.env.NODE_ENV'));

    // Common pattern: define a boolean derived from NODE_ENV (e.g. `const isVerbose = process.env...`)
    // then guard logs with `if (isVerbose) { console.log(...) }`.
    // We treat this as gated if there's an `if (` very close to the log AND NODE_ENV is referenced somewhere above.
    const hasIfJustAbove = lines
      .slice(Math.max(0, lineNum - 5), lineNum)
      .some((prev) => /\bif\s*\(/.test(prev));
    const hasEnvEarlierInFunction = lines
      .slice(Math.max(0, lineNum - 80), lineNum)
      .some((prev) => prev.includes('process.env.NODE_ENV'));

    // Another common pattern: early-return dev guard at top of function:
    // `if (process.env.NODE_ENV !== 'development') return;`
    // then later `console.log(...)` without an `if` nearby.
    const recent30 = lines.slice(Math.max(0, lineNum - 30), lineNum);
    const hasEnvGuardRecent = recent30.some((prev) => prev.includes('process.env.NODE_ENV'));
    const hasEarlyReturnRecent = recent30.some((prev) => prev.trim() === 'return;' || prev.trim().startsWith('return '));

    const gatedNearby =
      hasEnvOnLine ||
      hasEnvVeryNear ||
      (hasIfJustAbove && hasEnvEarlierInFunction) ||
      (hasEnvGuardRecent && hasEarlyReturnRecent);

    if (!gatedNearby) {
      warnings.push({
        file: filePath,
        line: lineNum + 1,
        severity: 'warning',
        message: `console.log found - should be removed or gated with NODE_ENV check`,
        code: line.trim().substring(0, 100)
      });
    }
  });
}

// Check for TODO/FIXME comments
function checkTODOs(content, filePath) {
  const lines = content.split('\n');
  lines.forEach((line, lineNum) => {
    if (/TODO|FIXME|XXX|HACK/.test(line)) {
      warnings.push({
        file: filePath,
        line: lineNum + 1,
        severity: 'info',
        message: `TODO/FIXME comment found`,
        code: line.trim().substring(0, 100)
      });
    }
  });
}

// Recursively scan directory
function scanDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];
  
  function walk(currentPath) {
    const entries = readdirSync(currentPath);
    
    for (const entry of entries) {
      // Skip node_modules, .next, etc.
      if (entry.startsWith('.') || entry === 'node_modules' || entry === '.next') {
        continue;
      }
      
      const fullPath = join(currentPath, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extensions.includes(extname(entry))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Main function
function main() {
  console.log('🔍 Running Code Health Check...\n');
  
  const srcDir = join(process.cwd(), 'src');
  const files = scanDirectory(srcDir);
  
  console.log(`Scanning ${files.length} files...\n`);
  
  files.forEach(file => {
    try {
      const content = readFileSync(file, 'utf-8');
      const relativePath = file.replace(process.cwd() + '/', '');
      
      checkHeadingColors(content, relativePath);
      checkImageAlt(content, relativePath);
      checkLinks(content, relativePath);
      checkConsoleLogs(content, relativePath);
      checkTODOs(content, relativePath);
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  });
  
  // Report results
  console.log('\n📊 RESULTS\n');
  console.log(`❌ Errors: ${issues.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}\n`);
  
  if (issues.length > 0) {
    console.log('❌ ERRORS (Must Fix):\n');
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.file}:${issue.line}`);
      console.log(`   ${issue.message}`);
      console.log(`   ${issue.code}\n`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (Should Fix):\n');
    warnings.slice(0, 20).forEach((warning, i) => {
      console.log(`${i + 1}. ${warning.file}:${warning.line}`);
      console.log(`   ${warning.message}`);
      console.log(`   ${warning.code}\n`);
    });
    
    if (warnings.length > 20) {
      console.log(`   ... and ${warnings.length - 20} more warnings\n`);
    }
  }
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ No issues found! Code looks healthy.\n');
  }
  
  // Exit with error code if issues found
  process.exit(issues.length > 0 ? 1 : 0);
}

main();

