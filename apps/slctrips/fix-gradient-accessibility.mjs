#!/usr/bin/env node

/**
 * Find and Fix Gradient Text Accessibility Issues
 * 
 * Scans codebase for gradient text patterns and suggests fixes
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let results = [];
  const list = readdirSync(dir);
  
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .next
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else if (extensions.includes(extname(file))) {
      results.push(filePath);
    }
  }
  
  return results;
}

function findGradientIssues(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Pattern 1: bg-clip-text text-transparent (no fallback)
    if (line.includes('bg-clip-text') && line.includes('text-transparent') && !line.includes('text-blue-400') && !line.includes('text-yellow-400')) {
      issues.push({
        line: index + 1,
        type: 'gradient-no-fallback',
        severity: 'high',
        pattern: line.trim(),
        fix: line.replace(
          /(bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent)/g,
          'text-blue-400 bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text [-webkit-background-clip:text] [background-clip:text]'
        )
      });
    }
    
    // Pattern 2: Button contrast issues
    if (line.includes('bg-blue-500') && line.includes('text-white')) {
      issues.push({
        line: index + 1,
        type: 'button-contrast',
        severity: 'high',
        pattern: line.trim(),
        fix: line.replace(/bg-gradient-to-r from-blue-500 to-blue-600/g, 'bg-blue-600').replace(/hover:from-blue-600 hover:to-blue-700/g, 'hover:bg-blue-700')
      });
    }
    
    if (line.includes('bg-yellow-400') && line.includes('text-white')) {
      issues.push({
        line: index + 1,
        type: 'button-contrast',
        severity: 'high',
        pattern: line.trim(),
        fix: line.replace(/text-white/g, 'text-gray-900')
      });
    }
    
    if (line.includes('bg-orange-500') && line.includes('text-white')) {
      issues.push({
        line: index + 1,
        type: 'button-contrast',
        severity: 'high',
        pattern: line.trim(),
        fix: line.replace(/text-white/g, 'text-gray-900').replace(/bg-orange-500/g, 'bg-orange-600')
      });
    }
    
    // Pattern 3: Missing focus indicators on buttons/links
    if ((line.includes('className=') && (line.includes('bg-') || line.includes('Link') || line.includes('button'))) && !line.includes('focus:outline')) {
      issues.push({
        line: index + 1,
        type: 'missing-focus',
        severity: 'medium',
        pattern: line.trim(),
        fix: line.replace(/className="([^"]+)"/g, 'className="$1 focus:outline-2 focus:outline-blue-400 focus:outline-offset-2"')
      });
    }
  });
  
  return issues;
}

async function scanCodebase() {
  console.log('');
  console.log('═'.repeat(80));
  console.log('🔍 SCANNING CODEBASE FOR ACCESSIBILITY ISSUES');
  console.log('═'.repeat(80));
  console.log('');
  
  const srcDir = join(__dirname, 'src');
  const files = findFiles(srcDir);
  
  console.log(`Found ${files.length} files to scan...\n`);
  
  const allIssues = [];
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      const issues = findGradientIssues(content, file);
      
      if (issues.length > 0) {
        allIssues.push({
          file: file.replace(__dirname + '/', ''),
          issues: issues
        });
        
        console.log(`📄 ${file.replace(__dirname + '/', '')}`);
        issues.forEach(issue => {
          const icon = issue.severity === 'high' ? '❌' : '⚠️';
          console.log(`   ${icon} Line ${issue.line}: ${issue.type}`);
        });
        console.log('');
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  // Summary
  const highPriority = allIssues.reduce((sum, f) => sum + f.issues.filter(i => i.severity === 'high').length, 0);
  const mediumPriority = allIssues.reduce((sum, f) => sum + f.issues.filter(i => i.severity === 'medium').length, 0);
  
  console.log('═'.repeat(80));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(80));
  console.log('');
  console.log(`Files with issues: ${allIssues.length}`);
  console.log(`   ❌ High priority: ${highPriority}`);
  console.log(`   ⚠️  Medium priority: ${mediumPriority}`);
  console.log('');
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    filesScanned: files.length,
    filesWithIssues: allIssues.length,
    totalIssues: allIssues.reduce((sum, f) => sum + f.issues.length, 0),
    issues: allIssues
  };
  
  const reportPath = join(__dirname, 'gradient-accessibility-scan.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Detailed report saved to: ${reportPath}`);
  console.log('');
  console.log('💡 To fix issues, review each file and apply the suggested fixes.');
  console.log('');
  
  return report;
}

scanCodebase().catch(console.error);

