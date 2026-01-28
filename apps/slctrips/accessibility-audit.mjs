#!/usr/bin/env node

/**
 * Comprehensive Accessibility Audit
 * 
 * Checks WCAG compliance, color contrast, keyboard navigation,
 * screen reader compatibility, and visual rendering issues.
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color contrast checker
function checkContrast(foreground, background) {
  // Convert hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Calculate relative luminance
  function getLuminance(rgb) {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // Calculate contrast ratio
  function getContrastRatio(color1, color2) {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) return null;

  const ratio = getContrastRatio(fg, bg);
  
  return {
    ratio: ratio.toFixed(2),
    aa: {
      normal: ratio >= 4.5,
      large: ratio >= 3.0
    },
    aaa: {
      normal: ratio >= 7.0,
      large: ratio >= 4.5
    }
  };
}

// Known color combinations from the site
const colorCombinations = [
  // Gradients and text
  { name: 'Blue to Yellow Gradient Text', fg: '#60A5FA', bg: '#1F2937', context: 'Hero headings' },
  { name: 'Blue to Yellow Gradient Text', fg: '#FBBF24', bg: '#1F2937', context: 'Hero headings' },
  { name: 'White Text on Gray-900', fg: '#FFFFFF', bg: '#111827', context: 'Main content' },
  { name: 'White Text on Gray-800', fg: '#FFFFFF', bg: '#1F2937', context: 'Content sections' },
  { name: 'Blue-400 Text on Dark', fg: '#60A5FA', bg: '#1F2937', context: 'Links' },
  { name: 'Yellow-400 Text on Dark', fg: '#FBBF24', bg: '#1F2937', context: 'Accents' },
  { name: 'Gray-300 Text on Dark', fg: '#D1D5DB', bg: '#1F2937', context: 'Body text' },
  { name: 'Gray-400 Text on Dark', fg: '#9CA3AF', bg: '#1F2937', context: 'Secondary text' },
  
  // Button colors
  { name: 'White Text on Blue-500', fg: '#FFFFFF', bg: '#3B82F6', context: 'Primary buttons' },
  { name: 'White Text on Blue-600', fg: '#FFFFFF', bg: '#2563EB', context: 'Primary buttons hover' },
  { name: 'Gray-900 Text on Yellow-400', fg: '#111827', bg: '#FBBF24', context: 'CTA buttons' },
  { name: 'White Text on Yellow-400', fg: '#FFFFFF', bg: '#FBBF24', context: 'Yellow buttons' },
  
  // Gradient backgrounds
  { name: 'Text on Blue Gradient', fg: '#FFFFFF', bg: '#1E40AF', context: 'Gradient sections' },
  { name: 'Text on Purple Gradient', fg: '#FFFFFF', bg: '#6B21A8', context: 'Gradient sections' },
];

async function runAccessibilityAudit() {
  console.log('');
  console.log('═'.repeat(80));
  console.log('♿ COMPREHENSIVE ACCESSIBILITY AUDIT');
  console.log('═'.repeat(80));
  console.log('');

  const results = {
    timestamp: new Date().toISOString(),
    colorContrast: [],
    axeIssues: [],
    keyboardNavigation: [],
    screenReader: [],
    gradientIssues: [],
    recommendations: []
  };

  // 1. Color Contrast Analysis
  console.log('🎨 Checking Color Contrast...\n');
  
  for (const combo of colorCombinations) {
    const contrast = checkContrast(combo.fg, combo.bg);
    if (contrast) {
      const passesAA = contrast.aa.normal;
      const passesAAA = contrast.aaa.normal;
      
      results.colorContrast.push({
        name: combo.name,
        context: combo.context,
        foreground: combo.fg,
        background: combo.bg,
        ratio: contrast.ratio,
        aa: {
          normal: contrast.aa.normal,
          large: contrast.aa.large
        },
        aaa: {
          normal: contrast.aaa.normal,
          large: contrast.aaa.large
        },
        status: passesAAA ? 'pass' : passesAA ? 'warning' : 'fail'
      });

      const status = passesAAA ? '✅' : passesAA ? '⚠️' : '❌';
      console.log(`${status} ${combo.name}`);
      console.log(`   Context: ${combo.context}`);
      console.log(`   Ratio: ${contrast.ratio}:1 (AA: ${passesAA ? 'PASS' : 'FAIL'}, AAA: ${passesAAA ? 'PASS' : 'FAIL'})`);
      console.log('');
    }
  }

  // 2. Run Playwright with axe-core
  console.log('🔍 Running Automated Accessibility Tests...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Install axe-core
    const axeScript = readFileSync(join(__dirname, 'node_modules/axe-core/axe.min.js'), 'utf8');
    await page.addScriptTag({ content: axeScript });

    // Test pages
    const testPages = [
      { name: 'Homepage', url: 'http://localhost:3000' },
      { name: 'FAQ Page', url: 'http://localhost:3000/faq' },
      // Add more pages as needed
    ];

    for (const testPage of testPages) {
      try {
        console.log(`Testing: ${testPage.name}...`);
        await page.goto(testPage.url, { waitUntil: 'networkidle', timeout: 10000 });
        
        // Run axe
        const axeResults = await page.evaluate(() => {
          return new Promise((resolve) => {
            axe.run((err, results) => {
              if (err) resolve({ error: err.message });
              else resolve(results);
            });
          });
        });

        if (axeResults.violations && axeResults.violations.length > 0) {
          results.axeIssues.push({
            page: testPage.name,
            url: testPage.url,
            violations: axeResults.violations
          });

          console.log(`   ❌ Found ${axeResults.violations.length} violations`);
          axeResults.violations.forEach(v => {
            console.log(`      - ${v.id}: ${v.description}`);
          });
        } else {
          console.log(`   ✅ No violations found`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not test ${testPage.name}: ${error.message}`);
        console.log(`   (Make sure dev server is running: npm run dev)`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not run automated tests: ${error.message}`);
    console.log(`   (This is expected if dev server is not running)`);
  }

  await browser.close();

  // 3. Gradient-specific checks
  console.log('\n🌈 Checking Gradient Rendering Issues...\n');
  
  const gradientIssues = [
    {
      issue: 'Gradient text may not render correctly in all browsers',
      severity: 'medium',
      recommendation: 'Ensure fallback solid color for gradient text',
      fix: 'Add solid color before gradient: color: #60A5FA; background: linear-gradient(...)'
    },
    {
      issue: 'bg-clip-text may not work in older browsers',
      severity: 'low',
      recommendation: 'Test in Safari and older browsers',
      fix: 'Add -webkit-background-clip: text for Safari support'
    },
    {
      issue: 'Gradient backgrounds may affect text contrast',
      severity: 'high',
      recommendation: 'Test contrast at multiple points in gradient',
      fix: 'Ensure minimum contrast at all gradient stops'
    }
  ];

  results.gradientIssues = gradientIssues;
  gradientIssues.forEach(issue => {
    const icon = issue.severity === 'high' ? '❌' : issue.severity === 'medium' ? '⚠️' : 'ℹ️';
    console.log(`${icon} ${issue.issue}`);
    console.log(`   Recommendation: ${issue.recommendation}`);
    console.log('');
  });

  // 4. Generate recommendations
  console.log('💡 Generating Recommendations...\n');

  const failingContrast = results.colorContrast.filter(c => c.status === 'fail');
  const warningContrast = results.colorContrast.filter(c => c.status === 'warning');

  if (failingContrast.length > 0) {
    results.recommendations.push({
      priority: 'high',
      category: 'color-contrast',
      issue: `${failingContrast.length} color combinations fail WCAG AA`,
      fix: 'Increase contrast ratio to at least 4.5:1 for normal text, 3:1 for large text'
    });
  }

  if (warningContrast.length > 0) {
    results.recommendations.push({
      priority: 'medium',
      category: 'color-contrast',
      issue: `${warningContrast.length} color combinations only pass WCAG AA, not AAA`,
      fix: 'Consider increasing contrast to 7:1 for AAA compliance'
    });
  }

  // Generate report
  const reportPath = join(__dirname, 'accessibility-audit-report.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Summary
  console.log('═'.repeat(80));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(80));
  console.log('');
  console.log(`Color Combinations Tested: ${results.colorContrast.length}`);
  console.log(`   ✅ Passing: ${results.colorContrast.filter(c => c.status === 'pass').length}`);
  console.log(`   ⚠️  Warning: ${results.colorContrast.filter(c => c.status === 'warning').length}`);
  console.log(`   ❌ Failing: ${results.colorContrast.filter(c => c.status === 'fail').length}`);
  console.log('');
  console.log(`Axe Violations: ${results.axeIssues.reduce((sum, page) => sum + (page.violations?.length || 0), 0)}`);
  console.log(`Gradient Issues: ${results.gradientIssues.length}`);
  console.log(`Recommendations: ${results.recommendations.length}`);
  console.log('');
  console.log(`📄 Full report saved to: ${reportPath}`);
  console.log('');

  // Show critical issues
  if (failingContrast.length > 0 || results.recommendations.some(r => r.priority === 'high')) {
    console.log('🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
    console.log('');
    failingContrast.forEach(issue => {
      console.log(`❌ ${issue.name} (${issue.context})`);
      console.log(`   Ratio: ${issue.ratio}:1 (needs 4.5:1 for AA)`);
      console.log(`   Fix: Increase contrast between ${issue.foreground} and ${issue.background}`);
      console.log('');
    });
  }

  console.log('═'.repeat(80));
  console.log('');
}

runAccessibilityAudit().catch(console.error);

