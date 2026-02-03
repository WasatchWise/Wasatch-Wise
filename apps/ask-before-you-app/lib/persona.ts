/**
 * ABYA persona (audience) — who the user said they are in the Who Are You modal.
 * Stored in sessionStorage so Certification, Ecosystem, and other pages can use it.
 */

export const ABYA_PERSONA_KEY = 'abya_persona';

export const PERSONA_LABELS: Record<string, string> = {
  parent: 'parent',
  educator: 'educator',
  administrator: 'administrator',
  student: 'student',
  just_learning: 'just learning',
};

export type PersonaId = keyof typeof PERSONA_LABELS;

/** Get persona from sessionStorage (client-only). */
export function getStoredPersona(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(ABYA_PERSONA_KEY);
    return stored && PERSONA_LABELS[stored] ? stored : null;
  } catch {
    return null;
  }
}

/** Set persona in sessionStorage (client-only). */
export function setStoredPersona(persona: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ABYA_PERSONA_KEY, persona);
  } catch {
    // ignore
  }
}

/** Get human-readable label for a persona id. */
export function getPersonaLabel(personaId: string | null): string | null {
  return personaId && PERSONA_LABELS[personaId] ? PERSONA_LABELS[personaId] : null;
}
