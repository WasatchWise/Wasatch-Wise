/**
 * Psychology Module Index
 * Behavioral Science-Driven Lead Scoring and Conversion Optimization
 *
 * Based on:
 * - Dual-Process Theory (System 1 / System 2)
 * - Prospect Theory & Loss Aversion
 * - Self-Congruity Theory
 * - Self-Monitoring Theory
 * - Neuroselling (Dopamine, Oxytocin, Cortisol, Serotonin)
 * - Cognitive Load Theory
 * - NEPQ Framework Integration
 */

export * from './behavioral-scoring'
export * from './consequence-questions'

// Re-export main functions for convenience
export {
  calculatePsychologyScore,
  calculateIdentityThreatScore,
  calculateLossFrameScore,
  assessSelfMonitorProfile,
  assessNeurochemicalProfile,
  assessCognitiveLoad,
} from './behavioral-scoring'

export {
  getConsequenceQuestionsForLead,
  getOptimalSequence,
  formatConsequenceQuestion,
  CONSEQUENCE_QUESTIONS,
  CONSEQUENCE_SEQUENCES,
} from './consequence-questions'
