/**
 * DAROS Testing Engine
 *
 * The "brain" of the HCI archetype testing system.
 * Takes a Persona and creates a cognitively-throttled Playwright test environment.
 *
 * Key capabilities:
 * - Network/device simulation based on persona tech comfort
 * - Load time enforcement based on attention budget
 * - Click counting against complexity tolerance
 * - Interruption simulation for high-interruption personas
 * - Session timeout based on typical session length
 */

import { test as base, Page, BrowserContext, expect } from '@playwright/test';
import {
  Persona,
  getCognitiveConstraints,
  allPersonas,
  superintendentPersona,
  itDirectorPersona,
  teacherPersona,
  boardMemberPersona,
  parentPersona,
  consultantPersona
} from './fixtures/personas';
import { cognitiveProfiles, CognitiveProfile } from './fixtures/test-data';

// Extend Window interface for DAROS tracking
declare global {
  interface Window {
    darosTrackClick: () => void;
    darosTrackScroll: () => void;
    darosMetrics: {
      clicks: number;
      scrollEvents: number;
      idleTime: number;
      startTime: number;
    };
  }
}

/**
 * DAROS Test Environment Options
 */
interface DarosOptions {
  persona: Persona;
  strictMode: boolean; // Fail tests on constraint violations vs. warn
  cognitiveProfile?: CognitiveProfile;
}

/**
 * DAROS Metrics collected during test execution
 */
export interface DarosSessionMetrics {
  personaName: string;
  archetype: string;
  totalClicks: number;
  maxClicksAllowed: number;
  loadTimeMs: number;
  maxLoadTimeMs: number;
  sessionDurationMs: number;
  maxSessionMs: number;
  violations: string[];
  warnings: string[];
}

/**
 * Custom Playwright Fixture for DAROS
 * Extends base test to inject persona-specific constraints.
 */
export const darosTest = base.extend<
  DarosOptions & {
    darosPage: Page;
    darosMetrics: DarosSessionMetrics;
  }
>({
  // Default persona (can be overridden in specific tests)
  persona: [superintendentPersona, { option: true }],

  // Strict mode fails tests on violations; permissive mode warns
  strictMode: [false, { option: true }],

  // Optional cognitive profile override
  cognitiveProfile: [undefined, { option: true }],

  // Session metrics collector
  darosMetrics: [
    async ({}, use) => {
      const metrics: DarosSessionMetrics = {
        personaName: '',
        archetype: '',
        totalClicks: 0,
        maxClicksAllowed: 0,
        loadTimeMs: 0,
        maxLoadTimeMs: 0,
        sessionDurationMs: 0,
        maxSessionMs: 0,
        violations: [],
        warnings: [],
      };
      await use(metrics);
    },
    { scope: 'test' },
  ],

  darosPage: async (
    { page, context, persona, strictMode, cognitiveProfile, darosMetrics },
    use
  ) => {
    const constraints = getCognitiveConstraints(persona);
    const profile = cognitiveProfile || cognitiveProfiles[persona.archetype] || cognitiveProfiles.parent;

    // Initialize metrics
    darosMetrics.personaName = persona.name;
    darosMetrics.archetype = persona.archetype;
    darosMetrics.maxClicksAllowed = constraints.maxClicksToGoal;
    darosMetrics.maxLoadTimeMs = constraints.maxLoadTime;
    darosMetrics.maxSessionMs = constraints.sessionTimeout;

    console.log(`\n[DAROS] ═══════════════════════════════════════════════════════════`);
    console.log(`[DAROS] Persona: ${persona.name} (${persona.archetype})`);
    console.log(`[DAROS] Metaphor: ${profile?.metaphor || 'Default'}`);
    console.log(`[DAROS] Constraints:`);
    console.log(`[DAROS]   • Max Load Time: ${constraints.maxLoadTime}ms`);
    console.log(`[DAROS]   • Max Clicks: ${constraints.maxClicksToGoal}`);
    console.log(`[DAROS]   • Session Timeout: ${Math.round(constraints.sessionTimeout / 1000)}s`);
    console.log(`[DAROS]   • Interruption Simulation: ${constraints.interruptionSimulation}`);
    console.log(`[DAROS]   • Mobile Test Required: ${constraints.requiresMobileTest}`);
    console.log(`[DAROS] ═══════════════════════════════════════════════════════════\n`);

    // ─────────────────────────────────────────────────────────────────────────
    // 1. VIEWPORT & NETWORK SIMULATION
    // ─────────────────────────────────────────────────────────────────────────
    if (constraints.requiresMobileTest || persona.mobileUsagePercent > 50) {
      // Mobile simulation for high mobile usage personas
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      console.log(`[DAROS] 📱 Mobile viewport enabled (${persona.mobileUsagePercent}% mobile usage)`);
    } else if (persona.techComfort === 'low') {
      // Tablet for low tech comfort (larger touch targets)
      await page.setViewportSize({ width: 768, height: 1024 });
      console.log(`[DAROS] 📱 Tablet viewport enabled (low tech comfort)`);
    } else {
      // Desktop for high tech comfort
      await page.setViewportSize({ width: 1440, height: 900 });
      console.log(`[DAROS] 🖥️  Desktop viewport enabled`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. LOAD TIME ENFORCEMENT
    // ─────────────────────────────────────────────────────────────────────────
    const originalGoto = page.goto.bind(page);
    page.goto = async (url: string, options?: Parameters<Page['goto']>[1]) => {
      const start = Date.now();
      let response;

      try {
        response = await originalGoto(url, {
          ...options,
          timeout: constraints.maxLoadTime + 2000, // Small buffer
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
          const violation = `Page load exceeded ${constraints.maxLoadTime}ms patience budget for ${persona.name}`;
          darosMetrics.violations.push(violation);

          if (strictMode) {
            throw new Error(`[DAROS VIOLATION] ${violation}`);
          } else {
            console.warn(`[DAROS ⚠️  VIOLATION] ${violation}`);
          }
        }
        throw error;
      }

      const duration = Date.now() - start;
      darosMetrics.loadTimeMs = duration;

      if (duration > constraints.maxLoadTime) {
        const warning = `Load time ${duration}ms exceeded ${constraints.maxLoadTime}ms budget`;
        darosMetrics.warnings.push(warning);
        console.warn(`[DAROS ⚠️  WARNING] ${warning}`);
      } else {
        console.log(`[DAROS ✓] Page loaded in ${duration}ms (budget: ${constraints.maxLoadTime}ms)`);
      }

      return response;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 3. CLICK COUNTING & COMPLEXITY TOLERANCE
    // ─────────────────────────────────────────────────────────────────────────
    let clickCount = 0;

    await context.exposeFunction('darosTrackClick', () => {
      clickCount++;
      darosMetrics.totalClicks = clickCount;

      if (clickCount > constraints.maxClicksToGoal) {
        const warning = `Click count (${clickCount}) exceeds tolerance (${constraints.maxClicksToGoal}) for ${persona.name}`;

        if (!darosMetrics.violations.includes(warning)) {
          darosMetrics.violations.push(warning);
        }

        if (strictMode) {
          throw new Error(`[DAROS VIOLATION] Too complex! ${persona.name} gave up after ${clickCount} clicks.`);
        } else {
          console.warn(`[DAROS ⚠️  VIOLATION] ${warning}`);
        }
      }
    });

    await page.addInitScript(() => {
      window.darosMetrics = {
        clicks: 0,
        scrollEvents: 0,
        idleTime: 0,
        startTime: Date.now(),
      };

      document.addEventListener('click', () => {
        window.darosMetrics.clicks++;
        window.darosTrackClick();
      });

      document.addEventListener('scroll', () => {
        window.darosMetrics.scrollEvents++;
      });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 4. INTERRUPTION SIMULATION (The "Fire Drill")
    // ─────────────────────────────────────────────────────────────────────────
    let interruptionTimer: NodeJS.Timeout | undefined;

    if (constraints.interruptionSimulation) {
      // Random interruption within first half of session
      const interruptTime = Math.random() * (persona.typicalSessionLength * 60 * 1000 * 0.5);

      interruptionTimer = setTimeout(async () => {
        console.log(`\n[DAROS 🔔] Simulating interruption for ${persona.name}...`);
        console.log(`[DAROS 🔔] (${persona.archetype} has ${Math.round(persona.interruptionProbability * 100)}% interruption probability)`);

        try {
          await page.evaluate(() => window.dispatchEvent(new Event('blur')));

          // Simulate distraction period (shortened for test speed)
          await new Promise((r) => setTimeout(r, 2000));

          await page.evaluate(() => window.dispatchEvent(new Event('focus')));
          console.log(`[DAROS ✓] ${persona.name} has returned to task.\n`);
        } catch {
          // Page may have navigated; ignore
        }
      }, Math.min(interruptTime, 5000)); // Cap for test speed
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. SESSION TIMEOUT ENFORCEMENT
    // ─────────────────────────────────────────────────────────────────────────
    const sessionStart = Date.now();
    const sessionTimer = setTimeout(() => {
      const elapsed = Date.now() - sessionStart;
      darosMetrics.sessionDurationMs = elapsed;

      const warning = `Session exceeded ${persona.typicalSessionLength} minute budget for ${persona.name}`;
      darosMetrics.warnings.push(warning);
      console.warn(`\n[DAROS ⏱️  WARNING] ${warning}`);
    }, constraints.sessionTimeout);

    // ─────────────────────────────────────────────────────────────────────────
    // USE THE PAGE
    // ─────────────────────────────────────────────────────────────────────────
    await use(page);

    // ─────────────────────────────────────────────────────────────────────────
    // CLEANUP & FINAL REPORT
    // ─────────────────────────────────────────────────────────────────────────
    clearTimeout(sessionTimer);
    if (interruptionTimer) clearTimeout(interruptionTimer);

    darosMetrics.sessionDurationMs = Date.now() - sessionStart;

    console.log(`\n[DAROS] ═══════════════════════════════════════════════════════════`);
    console.log(`[DAROS] Session Summary: ${persona.name}`);
    console.log(`[DAROS] ───────────────────────────────────────────────────────────`);
    console.log(`[DAROS]   Clicks: ${darosMetrics.totalClicks}/${darosMetrics.maxClicksAllowed}`);
    console.log(`[DAROS]   Load Time: ${darosMetrics.loadTimeMs}ms/${darosMetrics.maxLoadTimeMs}ms`);
    console.log(`[DAROS]   Session: ${Math.round(darosMetrics.sessionDurationMs / 1000)}s/${Math.round(darosMetrics.maxSessionMs / 1000)}s`);
    console.log(`[DAROS]   Violations: ${darosMetrics.violations.length}`);
    console.log(`[DAROS]   Warnings: ${darosMetrics.warnings.length}`);

    if (darosMetrics.violations.length > 0) {
      console.log(`[DAROS] ⚠️  VIOLATIONS:`);
      darosMetrics.violations.forEach((v) => console.log(`[DAROS]     • ${v}`));
    }

    console.log(`[DAROS] ═══════════════════════════════════════════════════════════\n`);
  },
});

// Re-export expect for convenience
export { expect };

// Export persona references for easy test configuration
export {
  superintendentPersona,
  itDirectorPersona,
  teacherPersona,
  boardMemberPersona,
  parentPersona,
  consultantPersona,
  allPersonas,
};
