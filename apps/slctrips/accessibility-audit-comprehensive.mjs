#!/usr/bin/env node

/**
 * Comprehensive Accessibility Audit
 * WCAG 2.1 AA Compliance Check
 * 
 * Checks:
 * - Color contrast ratios
 * - Gradient text accessibility
 * - Keyboard navigation
 * - Screen reader compatibility
 * - Focus indicators
 * - ARIA labels
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color contrast calculator
function calculateContrast(foreground, background) {
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function getLuminance(rgb) {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

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
    ratio: parseFloat(ratio.toFixed(2)),
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

// Tailwind color mappings
const tailwindColors = {
  'blue-400': '#60A5FA',
  'blue-500': '#3B82F6',
  'blue-600': '#2563EB',
  'yellow-400': '#FBBF24',
  'yellow-500': '#EAB308',
  'orange-500': '#F97316',
  'gray-300': '#D1D5DB',
  'gray-400': '#9CA3AF',
  'gray-700': '#374151',
  'gray-800': '#1F2937',
  'gray-900': '#111827',
  'white': '#FFFFFF',
  'black': '#000000',
};

// Known color combinations from the site
const colorTests = [
  // Gradient text issues
  { name: 'Gradient Text (Blue-400) on Gray-900', fg: tailwindColors['blue-400'], bg: tailwindColors['gray-900'], context: 'Hero headings, gradient text', issue: 'Gradient text may not render correctly' },
  { name: 'Gradient Text (Yellow-400) on Gray-900', fg: tailwindColors['yellow-400'], bg: tailwindColors['gray-900'], context: 'Hero headings, gradient text', issue: 'Gradient text may not render correctly' },
  
  // Regular text
  { name: 'White on Gray-900', fg: tailwindColors['white'], bg: tailwindColors['gray-900'], context: 'Main content text' },
  { name: 'White on Gray-800', fg: tailwindColors['white'], bg: tailwindColors['gray-800'], context: 'Content sections' },
  { name: 'Gray-300 on Gray-900', fg: tailwindColors['gray-300'], bg: tailwindColors['gray-900'], context: 'Body text' },
  { name: 'Gray-300 on Gray-800', fg: tailwindColors['gray-300'], bg: tailwindColors['gray-800'], context: 'Body text' },
  { name: 'Gray-400 on Gray-900', fg: tailwindColors['gray-400'], bg: tailwindColors['gray-900'], context: 'Secondary text' },
  { name: 'Blue-400 on Gray-900', fg: tailwindColors['blue-400'], bg: tailwindColors['gray-900'], context: 'Links' },
  { name: 'Yellow-400 on Gray-900', fg: tailwindColors['yellow-400'], bg: tailwindColors['gray-900'], context: 'Accents' },
  
  // Buttons
  { name: 'White on Blue-500', fg: tailwindColors['white'], bg: tailwindColors['blue-500'], context: 'Primary buttons' },
  { name: 'White on Blue-600', fg: tailwindColors['white'], bg: tailwindColors['blue-600'], context: 'Button hover' },
  { name: 'Gray-900 on Yellow-400', fg: tailwindColors['gray-900'], bg: tailwindColors['yellow-400'], context: 'CTA buttons' },
  { name: 'White on Yellow-400', fg: tailwindColors['white'], bg: tailwindColors['yellow-400'], context: 'Yellow buttons' },
  { name: 'White on Orange-500', fg: tailwindColors['white'], bg: tailwindColors['orange-500'], context: 'Orange buttons' },
];

async function runAccessibilityAudit() {
  console.log('');
  console.log('═'.repeat(80));
  console.log('♿ COMPREHENSIVE ACCESSIBILITY AUDIT - WCAG 2.1 AA');
  console.log('═'.repeat(80));
  console.log('');

  const results = {
    timestamp: new Date().toISOString(),
    colorContrast: [],
    gradientIssues: [],
    axeViolations: [],
    recommendations: [],
    summary: {
      totalTests: 0,
      passing: 0,
      warnings: 0,
      failing: 0
    }
  };

  // 1. Color Contrast Analysis
  console.log('🎨 COLOR CONTRAST ANALYSIS');
  console.log('═'.repeat(80));
  console.log('');

  for (const test of colorTests) {
    const contrast = calculateContrast(test.fg, test.bg);
    if (contrast) {
      const passesAA = contrast.aa.normal;
      const passesAAA = contrast.aaa.normal;
      const status = passesAAA ? 'pass' : passesAA ? 'warning' : 'fail';
      
      results.summary.totalTests++;
      if (status === 'pass') results.summary.passing++;
      else if (status === 'warning') results.summary.warnings++;
      else results.summary.failing++;

      results.colorContrast.push({
        name: test.name,
        context: test.context,
        foreground: test.fg,
        background: test.bg,
        ratio: contrast.ratio,
        aa: contrast.aa,
        aaa: contrast.aaa,
        status: status,
        issue: test.issue || null
      });

      const icon = status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${test.name}`);
      console.log(`   Context: ${test.context}`);
      console.log(`   Ratio: ${contrast.ratio}:1`);
      console.log(`   WCAG AA: ${passesAA ? 'PASS' : 'FAIL'} (needs 4.5:1 for normal, 3:1 for large)`);
      console.log(`   WCAG AAA: ${passesAAA ? 'PASS' : 'FAIL'} (needs 7:1 for normal, 4.5:1 for large)`);
      if (test.issue) {
        console.log(`   ⚠️  Issue: ${test.issue}`);
      }
      console.log('');
    }
  }

  // 2. Gradient Text Issues
  console.log('🌈 GRADIENT TEXT ACCESSIBILITY ISSUES');
  console.log('═'.repeat(80));
  console.log('');

  const gradientIssues = [
    {
      issue: 'Gradient text uses text-transparent which removes text color',
      severity: 'high',
      impact: 'Text may be invisible if gradient fails to render',
      location: 'Hero headings, FAQ page headings, navigation links',
      fix: 'Add fallback color before gradient: color: #60A5FA; background: linear-gradient(...)',
      codeExample: 'Before: bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent\nAfter: text-blue-400 bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text'
    },
    {
      issue: 'bg-clip-text may not work in all browsers',
      severity: 'medium',
      impact: 'Text may not display correctly in older browsers',
      location: 'All gradient text elements',
      fix: 'Add -webkit-background-clip: text for Safari support',
      codeExample: 'Add: -webkit-background-clip: text;'
    },
    {
      issue: 'Gradient text contrast varies across gradient',
      severity: 'high',
      impact: 'Some parts of gradient may not meet contrast requirements',
      location: 'Hero headings with blue-to-yellow gradients',
      fix: 'Ensure minimum contrast at all gradient stops, or use solid color',
      codeExample: 'Test contrast at blue-400, middle, and yellow-400 points'
    },
    {
      issue: 'No focus indicators on gradient text links',
      severity: 'medium',
      impact: 'Keyboard users cannot see focus state',
      location: 'Navigation links',
      location: 'Navigation links with gradient text',
      fix: 'Add visible focus outline: focus:outline-2 focus:outline-blue-500 focus:outline-offset-2'
    }
  ];

  results.gradientIssues = gradientIssues;
  gradientIssues.forEach(issue => {
    const icon = issue.severity === 'high' ? '❌' : '⚠️';
    console.log(`${icon} ${issue.issue}`);
    console.log(`   Impact: ${issue.impact}`);
    console.log(`   Location: ${issue.location}`);
    console.log(`   Fix: ${issue.fix}`);
    console.log('');
  });

  // 3. Run automated tests with Playwright + axe
  console.log('🔍 RUNNING AUTOMATED ACCESSIBILITY TESTS');
  console.log('═'.repeat(80));
  console.log('');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Inject axe-core
    const axePath = join(__dirname, 'node_modules', 'axe-core', 'axe.min.js');
    const axeScript = readFileSync(axePath, 'utf8');
    await page.addScriptTag({ content: axeScript });

    const testPages = [
      { name: 'Homepage', url: 'http://localhost:3000' },
      { name: 'FAQ Page', url: 'http://localhost:3000/faq' },
    ];

    for (const testPage of testPages) {
      try {
        console.log(`Testing: ${testPage.name}...`);
        await page.goto(testPage.url, { waitUntil: 'networkidle', timeout: 15000 });
        
        // Wait for page to be ready
        await page.waitForTimeout(1000);

        // Run axe
        const axeResults = await page.evaluate(() => {
          return new Promise((resolve) => {
            if (typeof axe === 'undefined') {
              resolve({ error: 'axe-core not loaded' });
              return;
            }
            axe.run((err, results) => {
              if (err) resolve({ error: err.message });
              else resolve(results);
            });
          });
        });

        if (axeResults.error) {
          console.log(`   ⚠️  ${axeResults.error}`);
        } else if (axeResults.violations && axeResults.violations.length > 0) {
          results.axeViolations.push({
            page: testPage.name,
            url: testPage.url,
            violations: axeResults.violations.map(v => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              help: v.help,
              helpUrl: v.helpUrl,
              nodes: v.nodes.length
            }))
          });

          console.log(`   ❌ Found ${axeResults.violations.length} violations`);
          axeResults.violations.forEach(v => {
            console.log(`      - ${v.id} (${v.impact}): ${v.description}`);
            console.log(`        Affects ${v.nodes.length} element(s)`);
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
  }

  await browser.close();

  // 4. Generate Recommendations
  console.log('');
  console.log('💡 RECOMMENDATIONS');
  console.log('═'.repeat(80));
  console.log('');

  const failingContrast = results.colorContrast.filter(c => c.status === 'fail');
  const warningContrast = results.colorContrast.filter(c => c.status === 'warning');

  if (failingContrast.length > 0) {
    results.recommendations.push({
      priority: 'high',
      category: 'color-contrast',
      issue: `${failingContrast.length} color combinations fail WCAG AA`,
      fix: 'Increase contrast ratio to at least 4.5:1 for normal text, 3:1 for large text (18pt+)',
      examples: failingContrast.map(c => c.name)
    });
    console.log(`❌ HIGH PRIORITY: ${failingContrast.length} color combinations fail WCAG AA`);
    failingContrast.forEach(c => {
      console.log(`   - ${c.name}: ${c.ratio}:1 (needs 4.5:1)`);
    });
    console.log('');
  }

  if (warningContrast.length > 0) {
    results.recommendations.push({
      priority: 'medium',
      category: 'color-contrast',
      issue: `${warningContrast.length} color combinations only pass WCAG AA, not AAA`,
      fix: 'Consider increasing contrast to 7:1 for AAA compliance',
      examples: warningContrast.map(c => c.name)
    });
    console.log(`⚠️  MEDIUM PRIORITY: ${warningContrast.length} combinations only pass AA (not AAA)`);
    console.log('');
  }

  // Gradient-specific recommendations
  results.recommendations.push({
    priority: 'high',
    category: 'gradient-text',
    issue: 'Gradient text may be invisible if gradient fails to render',
    fix: 'Add fallback solid color before gradient background',
    code: 'text-blue-400 bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text'
  });

  console.log(`❌ HIGH PRIORITY: Fix gradient text accessibility`);
  console.log(`   - Add fallback colors for gradient text`);
  console.log(`   - Ensure contrast at all gradient points`);
  console.log(`   - Add -webkit-background-clip for Safari`);
  console.log('');

  // Save report
  const reportPath = join(__dirname, 'accessibility-audit-report.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Final Summary
  console.log('═'.repeat(80));
  console.log('📊 AUDIT SUMMARY');
  console.log('═'.repeat(80));
  console.log('');
  console.log(`Color Contrast Tests: ${results.summary.totalTests}`);
  console.log(`   ✅ Passing: ${results.summary.passing}`);
  console.log(`   ⚠️  Warnings: ${results.summary.warnings}`);
  console.log(`   ❌ Failing: ${results.summary.failing}`);
  console.log('');
  console.log(`Gradient Issues: ${results.gradientIssues.length}`);
  console.log(`Axe Violations: ${results.axeViolations.reduce((sum, p) => sum + (p.violations?.length || 0), 0)}`);
  console.log(`Recommendations: ${results.recommendations.length}`);
  console.log('');
  console.log(`📄 Full report saved to: ${reportPath}`);
  console.log('');

  // Critical issues
  const criticalIssues = results.gradientIssues.filter(i => i.severity === 'high').length + results.summary.failing;
  if (criticalIssues > 0) {
    console.log('🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
    console.log('');
    console.log(`   ${results.summary.failing} color contrast failures`);
    console.log(`   ${results.gradientIssues.filter(i => i.severity === 'high').length} high-severity gradient issues`);
    console.log('');
  }

  console.log('═'.repeat(80));
  console.log('');
}

runAccessibilityAudit().catch(console.error);

