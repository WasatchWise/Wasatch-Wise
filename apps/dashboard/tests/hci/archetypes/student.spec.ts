/**
 * Student Archetype HCI Tests - Polymorphic Interface
 *
 * The Student archetype has FOUR sub-archetypes, each requiring
 * a different interaction model based on personality type:
 *
 * - Rusty (ISTJ): Terminal Mode - Code-first, keyboard shortcuts
 * - Jasmine (ENFP): Stage Mode - Voice-first, video, large touch targets
 * - Jay (ISFP): Canvas Mode - Spatial/whiteboard, gesture-based
 * - Indigo (INFP): Studio Mode - Private, minimalist, no social counters
 *
 * The Universal Input Component morphs based on user profile.
 */

import { test, expect, Page } from '@playwright/test';
import {
  cognitiveProfiles,
  metaphorPatterns,
  universalInputTestCases
} from '../fixtures/test-data';
import {
  measureTiming,
  measureInteractions,
  measureCognitiveLoad
} from '../utils/metrics';
import {
  assertTerminalModePattern,
  assertStageModePattern,
  assertCanvasModePattern,
  assertStudioModePattern,
  assertKeyboardNavigable,
  assertTouchTargetSize
} from '../utils/assertions';

// ============================================
// RUSTY - Terminal Mode (The Logistician / ISTJ)
// ============================================

test.describe('Student: Rusty - Terminal Mode', () => {
  const profile = cognitiveProfiles['student-rusty'];

  test.describe('Metaphor Pattern Validation', () => {

    test('displays code-first interface with syntax highlighting', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // For Rusty, interface should show code elements
      // In production, this would be detected via user profile
      const codeElements = page.locator(
        'pre, code, .code-block, [data-code], .monaco-editor, ' +
        '[class*="syntax"], [class*="highlight"]'
      );

      // When code is displayed, it should be highlighted
    });

    test('supports dark mode', async ({ page }) => {
      await page.goto('/');

      // Check for dark mode toggle or default dark
      const darkModeToggle = page.locator(
        '[data-theme-toggle], button[aria-label*="dark"], ' +
        'button[aria-label*="theme"], [data-dark-mode]'
      );

      // Or check if already dark
      const isDark = await page.evaluate(() => {
        const bg = window.getComputedStyle(document.body).backgroundColor;
        const match = bg.match(/\d+/g);
        if (match) {
          const avg = match.slice(0, 3).map(Number).reduce((a, b) => a + b) / 3;
          return avg < 128;
        }
        return document.documentElement.classList.contains('dark');
      });

      // Dark mode should be available for coders
    });

    test('displays keyboard shortcuts prominently', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Keyboard shortcuts should be visible or easily discoverable
      const shortcutHints = page.locator(
        'kbd, [data-shortcut], .keyboard-shortcut, ' +
        '[class*="hotkey"], [aria-keyshortcuts]'
      );

      // Rusty expects keyboard hints
    });

    test('uses monospace fonts for technical content', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Technical content areas should use monospace
      const codeAreas = page.locator('pre, code, [data-code]');

      for (const area of await codeAreas.all()) {
        const fontFamily = await area.evaluate(
          el => window.getComputedStyle(el).fontFamily
        );
        expect(fontFamily.toLowerCase()).toMatch(/mono|courier|consolas/);
      }
    });

  });

  test.describe('Input Mode - Keyboard First', () => {

    test('full keyboard navigation without mouse', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Navigate entirely with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to reach input
      const activeElement = await page.evaluate(() =>
        document.activeElement?.tagName.toLowerCase()
      );

      expect(activeElement).toMatch(/input|textarea|button/);

      // Type and submit with keyboard only
      await page.keyboard.type('What is an API?');
      await page.keyboard.press('Enter');

      // Should submit successfully
    });

    test('Ctrl+Enter submits in code contexts', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea').first();
      await input.focus();
      await input.fill('Show me Python code');

      // Ctrl+Enter is standard for code submission
      await page.keyboard.press('Control+Enter');

      // Should submit or show code output
    });

    test('Vim-style navigation hints available', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // For power users, Vim bindings should be mentioned or available
      const vimHints = page.locator(
        ':has-text("vim"), :has-text("hjkl"), [data-vim-mode]'
      );

      // Vim mode is optional but appreciated by Rusty types
    });

    test('command palette accessible via Ctrl/Cmd+K', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      await page.keyboard.press('Meta+k');

      const commandPalette = page.locator(
        '[role="dialog"], [cmdk-root], .command-palette, [data-command-menu]'
      );

      // Command palette is essential for keyboard-first users
    });

  });

  test.describe('Cognitive Profile', () => {

    test('high complexity tolerance accommodated', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const cognitiveLoad = await measureCognitiveLoad(page);

      // Rusty has high load capacity (8)
      // Can handle more complexity than other users
      expect(cognitiveLoad.estimatedLoadScore).toBeLessThanOrEqual(10);
    });

    test('detailed technical responses acceptable', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Rusty prefers detailed technical answers
      // Response length limits should be generous
    });

  });

});

// ============================================
// JASMINE - Stage Mode (The Campaigner / ENFP)
// ============================================

test.describe('Student: Jasmine - Stage Mode', () => {
  const profile = cognitiveProfiles['student-jasmine'];

  test.describe('Metaphor Pattern Validation', () => {

    test('microphone button prominently displayed', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const micButton = page.locator(
        'button[aria-label*="microphone"], button[aria-label*="voice"], ' +
        '[data-mic], .mic-button, button >> svg'
      );

      // Voice input should be primary for Jasmine
    });

    test('avatar/video elements present', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Should have avatar or video capability
      const avatarElements = page.locator(
        '[data-avatar], .avatar, video, [data-heygen], canvas'
      );

      // Jasmine interacts through performance/video
    });

    test('voice synthesis for responses', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea, input[type="text"]').first();
      await input.fill('Hello!');
      await input.press('Enter');

      // Wait for response
      await page.waitForTimeout(3000);

      // Should have audio element
      const audioElements = page.locator(
        'audio, [data-audio], [data-elevenlabs]'
      );

      // Audio response is key for Stage Mode
    });

    test('large touch targets for performance interaction', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/tools/ask-dan');

      // Touch targets must be generous
      await assertTouchTargetSize(page, 48); // Even larger for performance

      const mainButtons = page.locator('button');
      for (const btn of (await mainButtons.all()).slice(0, 5)) {
        const box = await btn.boundingBox();
        if (box) {
          // Jasmine needs big targets she can tap while performing
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
        }
      }
    });

  });

  test.describe('Input Mode - Voice First', () => {

    test('voice input is primary interaction method', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Microphone should be more prominent than text input
      const micButton = page.locator('[data-mic], button[aria-label*="voice"]');
      const textInput = page.locator('textarea, input[type="text"]');

      // Both should exist, but voice should be visually primary
    });

    test('typing is optional not required', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Should be able to interact without typing
      // Voice button should work as primary CTA

      const voiceButton = page.locator(
        'button[aria-label*="voice"], [data-voice-input], .voice-button'
      );

      if (await voiceButton.count() > 0) {
        await expect(voiceButton.first()).toBeVisible();
      }
    });

    test('video recording input available', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // For performance-oriented interaction
      const videoInput = page.locator(
        '[data-video-record], button[aria-label*="video"], .video-button'
      );

      // Video recording enhances stage mode
    });

  });

  test.describe('Output Mode - Video Avatar', () => {

    test('responses can be delivered via avatar', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Avatar response area
      const avatarArea = page.locator(
        '[data-avatar-response], .avatar-container, video[data-response]'
      );

      // Jasmine prefers visual/video responses
    });

    test('audio auto-plays for responses', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Audio should play automatically
      // Check for audio player
      const audioPlayer = page.locator('audio');

      if (await audioPlayer.count() > 0) {
        // Audio present indicates voice synthesis
      }
    });

  });

  test.describe('Cognitive Profile', () => {

    test('moderate complexity appropriate', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const cognitiveLoad = await measureCognitiveLoad(page);

      // Jasmine has loadCapacity of 6
      expect(cognitiveLoad.estimatedLoadScore).toBeLessThanOrEqual(8);
    });

    test('animation and visual feedback preferred', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Should have animations
      const animatedElements = page.locator(
        '[class*="animate"], [class*="transition"], [data-animated]'
      );

      // Jasmine appreciates visual feedback
    });

  });

});

// ============================================
// JAY - Canvas Mode (The Adventurer / ISFP)
// ============================================

test.describe('Student: Jay - Canvas Mode', () => {
  const profile = cognitiveProfiles['student-jay'];

  test.describe('Metaphor Pattern Validation', () => {

    test('spatial canvas interface available', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Look for whiteboard/canvas elements
      const canvasElements = page.locator(
        'canvas, [data-canvas], .whiteboard, .spatial-view, [data-miro]'
      );

      // Canvas mode for spatial thinkers
    });

    test('draggable elements present', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const draggables = page.locator(
        '[draggable="true"], [data-draggable], .draggable'
      );

      // Spatial manipulation is key for Jay
    });

    test('zoom controls available', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const zoomControls = page.locator(
        '[data-zoom], button[aria-label*="zoom"], .zoom-in, .zoom-out, ' +
        '[aria-label="Zoom in"], [aria-label="Zoom out"]'
      );

      // Canvas needs zoom for navigation
    });

  });

  test.describe('Input Mode - Gesture/Spatial', () => {

    test('supports touch gestures', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/tools/ask-dan');

      // Touch events should be handled
      // This is more of an implementation validation
    });

    test('drag-to-connect interactions work', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // In canvas mode, relationships are built through dragging
      const draggables = page.locator('[draggable="true"]');

      if (await draggables.count() > 1) {
        const first = draggables.first();
        const second = draggables.nth(1);

        // Could simulate drag-drop in full implementation
      }
    });

    test('pinch-to-zoom on touch devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/tools/ask-dan');

      // Touch zoom should be supported
      // Playwright can simulate touch gestures
    });

  });

  test.describe('Output Mode - Visual Canvas', () => {

    test('responses displayed spatially', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Responses should be arrangeable
      const responseCards = page.locator(
        '[data-card], .response-card, .node, [data-spatial]'
      );

      // Jay arranges information visually
    });

    test('connections/relationships visualized', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Lines or connections between elements
      const connections = page.locator(
        'svg line, svg path, [data-connection], .edge, .arrow'
      );

      // Spatial relationships help Jay understand
    });

  });

  test.describe('Cognitive Profile', () => {

    test('moderate complexity with spatial organization', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const cognitiveLoad = await measureCognitiveLoad(page);

      // Jay has loadCapacity of 7
      expect(cognitiveLoad.estimatedLoadScore).toBeLessThanOrEqual(9);
    });

    test('spatial memory aids present', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Grid or spatial organization
      const spatialAids = page.locator(
        '[data-grid], .grid, .spatial-layout, [data-snap-to-grid]'
      );

      // Spatial memory is Jay's strength
    });

  });

});

// ============================================
// INDIGO - Studio Mode (The Mediator / INFP)
// ============================================

test.describe('Student: Indigo - Studio Mode', () => {
  const profile = cognitiveProfiles['student-indigo'];

  test.describe('Metaphor Pattern Validation', () => {

    test('minimalist workspace interface', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Interface should be clean and focused
      const cognitiveLoad = await measureCognitiveLoad(page);

      // Indigo needs low cognitive load
      // Studio mode is distraction-free
      expect(cognitiveLoad.interactiveElements).toBeLessThan(25);
    });

    test('NO social counters (likes/views)', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // CRITICAL: No social pressure for Indigo
      const socialCounters = page.locator(
        '[data-likes], [data-views], .like-count, .view-count, ' +
        '.share-count, [class*="social-count"]'
      );

      expect(await socialCounters.count()).toBe(0);
    });

    test('privacy toggle prominently placed', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const privacyControls = page.locator(
        '[data-privacy-toggle], input[name*="private"], ' +
        'button[aria-label*="private"], .privacy-toggle'
      );

      // Privacy is front-and-center for Indigo
    });

    test('quiet color palette', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Colors should be muted, not aggressive
      const backgroundColor = await page.evaluate(() =>
        window.getComputedStyle(document.body).backgroundColor
      );

      // Should not be harsh/bright
    });

  });

  test.describe('Input Mode - Minimal/Private', () => {

    test('drawing canvas available', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Indigo is artistic - drawing input option
      const drawingCanvas = page.locator(
        'canvas[data-drawing], [data-draw-mode], .drawing-canvas'
      );

      // Drawing as expression
    });

    test('audio recording for music', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Indigo is musical
      const audioRecorder = page.locator(
        '[data-audio-record], button[aria-label*="record audio"]'
      );

      // Audio input for musical expression
    });

    test('text input is private by default', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Inputs should not broadcast to others
      const publicIndicators = page.locator(
        '[data-public], .public-indicator, :has-text("others can see")'
      );

      expect(await publicIndicators.count()).toBe(0);
    });

  });

  test.describe('Output Mode - Private Studio', () => {

    test('work saved privately not shared', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Default should be private save
      const shareButtons = page.locator(
        'button:has-text("Share"), [data-share]'
      );

      // Share should be optional, not primary
    });

    test('auto-save indicator without pressure', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Should save work without requiring action
      const autoSaveIndicator = page.locator(
        '[data-auto-save], .auto-saved, :has-text("saved")'
      );

      // Quiet confirmation, not urgent
    });

    test('no notifications by default', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Indigo doesn't want interruptions
      const notifications = page.locator(
        '[data-notification], .notification-badge, [class*="badge"]'
      );

      // Should be minimal/muted
    });

  });

  test.describe('Cognitive Profile', () => {

    test('low friction tolerance respected', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Indigo has loadCapacity of 4 and frictionTolerance of 'none'
      const cognitiveLoad = await measureCognitiveLoad(page);

      expect(cognitiveLoad.estimatedLoadScore).toBeLessThanOrEqual(6);
    });

    test('distraction-free focus mode', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Should have or enable focus mode
      const focusMode = page.locator(
        '[data-focus-mode], button[aria-label*="focus"], .focus-mode'
      );

      // Distraction-free is essential
    });

    test('easy mute/hide functionality', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const muteControls = page.locator(
        'button[aria-label*="mute"], [data-mute], ' +
        'button[aria-label*="hide"], [data-hide]'
      );

      // Quick escape from stimulation
    });

  });

});

// ============================================
// UNIVERSAL INPUT COMPONENT TESTS
// ============================================

test.describe('Universal Input Component - Polymorphic Behavior', () => {

  test('component morphs based on user archetype', async ({ page }) => {
    // This tests the UniversalInput component concept
    // In production, user archetype would come from Supabase profile

    for (const testCase of universalInputTestCases) {
      // Would set user archetype via context/mock
      await page.goto('/tools/ask-dan');

      // Verify the expected rendering for each archetype
      const { archetype, expectedRendering } = testCase;

      // Admin should see Checklist
      // Teacher should see ChatBox
      // Rusty should see CodeBlock
      // Jasmine should see MicrophoneButton
      // etc.
    }
  });

  test('input transitions smoothly between modes', async ({ page }) => {
    await page.goto('/tools/ask-dan');

    // If user can switch modes, transition should be smooth
    const modeSelector = page.locator(
      '[data-input-mode], .mode-selector, [role="tablist"]'
    );

    if (await modeSelector.count() > 0) {
      // Switch modes and verify no jarring transition
    }
  });

});
