import { scoreForGroup } from '../config';

/**
 * Thin wrapper around config.ts's scoring formula. Kept as a separate
 * module so systems depend on "Scoring" rather than "config" directly —
 * makes it trivial to swap the formula without changing code.
 */
export const computeGroupScore = scoreForGroup;
