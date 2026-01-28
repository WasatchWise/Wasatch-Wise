#!/usr/bin/env node

/**
 * Color Rendering Test
 * 
 * Tests actual color rendering in browser to verify:
 * - Gradient text is visible
 * - Button contrast is sufficient
 * - Colors render correctly
 * - Focus indicators are visible
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testColorRendering() {
  console.log('');
  console.log('═'.repeat(80));
  console.log('🎨 COLOR RENDERING TEST');
  console.log('═'.repeat(80));
  console.log('');
  console.log('⚠️  Make sure dev server is running: npm run dev');
  console.log('');

  const browser = await chromium.launch({ headless: false }); // Show browser for visual inspection
  const page = await browser.newPage();

  const testPages = [
    { name: 'Homepage', url: 'http://localhost:3000' },
    { name: 'FAQ Page', url: 'http://localhost:3000/faq' },
    { name: 'TripKit 000', url: 'http://localhost:3000/tripkits/meet-the-mt-olympians' },
  ];

  const results = [];

  for (const testPage of testPages) {
    try {
      console.log(`Testing: ${testPage.name}...`);
      await page.goto(testPage.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000); // Wait for page to fully render

      // Check gradient text visibility
      const gradientTexts = await page.$$eval(
        '[class*="bg-clip-text"]',
        (elements) => elements.map(el => ({
          text: el.textContent?.trim().substring(0, 50),
          hasFallback: window.getComputedStyle(el).color !== 'rgba(0, 0, 0, 0)',
          computedColor: window.getComputedStyle(el).color,
          hasWebkitClip: window.getComputedStyle(el).webkitBackgroundClip === 'text'
        }))
      );

      // Check button contrast
      const buttons = await page.$$eval(
        'button, a[class*="bg-"]',
        (elements) => elements.map(el => {
          const styles = window.getComputedStyle(el);
          return {
            text: el.textContent?.trim().substring(0, 30),
            bgColor: styles.backgroundColor,
            textColor: styles.color,
            hasFocus: el.matches(':focus-visible') || false
          };
        })
      );

      // Check focus indicators
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active) return null;
        const styles = window.getComputedStyle(active);
        return {
          tag: active.tagName,
          text: active.textContent?.trim().substring(0, 30),
          hasOutline: styles.outlineWidth !== '0px',
          outlineColor: styles.outlineColor
        };
      });

      results.push({
        page: testPage.name,
        url: testPage.url,
        gradientTexts: gradientTexts.length,
        gradientTextsWithFallback: gradientTexts.filter(t => t.hasFallback).length,
        buttons: buttons.length,
        focusIndicator: focusedElement?.hasOutline || false
      });

      console.log(`   ✅ Loaded successfully`);
      console.log(`   📊 Gradient texts: ${gradientTexts.length} (${gradientTexts.filter(t => t.hasFallback).length} with fallback)`);
      console.log(`   📊 Buttons: ${buttons.length}`);
      console.log(`   📊 Focus indicator: ${focusedElement?.hasOutline ? '✅ Visible' : '❌ Missing'}`);
      console.log('');

      // Take screenshot for visual inspection
      const screenshotPath = `${__dirname}/color-test-${testPage.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`   📸 Screenshot saved: ${screenshotPath}`);

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.log(`   💡 Start dev server: npm run dev`);
      }
      console.log('');
    }
  }

  await browser.close();

  // Summary
  console.log('═'.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(80));
  console.log('');
  
  results.forEach(result => {
    console.log(`${result.page}:`);
    console.log(`   Gradient texts: ${result.gradientTexts} (${result.gradientTextsWithFallback} with fallback)`);
    console.log(`   Buttons: ${result.buttons}`);
    console.log(`   Focus indicator: ${result.focusIndicator ? '✅' : '❌'}`);
    console.log('');
  });

  console.log('💡 Visual Inspection:');
  console.log('   1. Check screenshots for color rendering');
  console.log('   2. Verify gradient text is visible');
  console.log('   3. Verify button text is readable');
  console.log('   4. Test keyboard navigation (Tab key)');
  console.log('   5. Verify focus indicators are visible');
  console.log('');
}

testColorRendering().catch(console.error);

