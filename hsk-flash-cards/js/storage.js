// Progress and preferences, saved in localStorage.
import { LEVELS, TOTAL } from './cards.js';

// Do not rename: existing users' progress is stored under this key.
const KEY = 'hsk13-flashcards-v1';
const VERSION = 4;

export const known = new Set();
export const review = new Set();   // words marked "Again" in Study; practised in the Review tab
export const prefs = { levels: [...LEVELS], dir: 'zh', skip: true, shuffle: true, mode: 'study' };

const byNumber = (a, b) => a - b;

try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  const v = saved.v || 0;
  if (Array.isArray(saved.known)) saved.known.forEach((k) => known.add(k));
  if (Array.isArray(saved.review)) saved.review.forEach((k) => review.add(k));
  if (saved.mode === 'review' || saved.mode === 'study') prefs.mode = saved.mode;
  if (Array.isArray(saved.levels)) {
    const levels = saved.levels.filter((l) => TOTAL[l]);
    if (levels.length) prefs.levels = levels;
  }
  // v2 added HSK 4 and v3 added HSK 5: switch the new level on for returning users
  if (v < 2 && !prefs.levels.includes(4)) prefs.levels.push(4);
  if (v < 3 && !prefs.levels.includes(5)) prefs.levels.push(5);
  prefs.levels.sort(byNumber);
  if (saved.dir === 'en' || saved.dir === 'zh') prefs.dir = saved.dir;
  if (typeof saved.skip === 'boolean') prefs.skip = saved.skip;
  if (typeof saved.shuffle === 'boolean') prefs.shuffle = saved.shuffle;
} catch (e) { /* storage unavailable: start fresh */ }

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      v: VERSION,
      known: Array.from(known),
      review: Array.from(review),
      mode: prefs.mode,
      levels: prefs.levels,
      dir: prefs.dir,
      skip: prefs.skip,
      shuffle: prefs.shuffle,
    }));
  } catch (e) { /* ignore */ }
}

// Returns the level selection with `lv` turned on or off, keeping at least one selected.
export function toggleLevel(levels, lv) {
  if (!levels.includes(lv)) return [...levels, lv].sort(byNumber);
  return levels.length > 1 ? levels.filter((l) => l !== lv) : levels;
}
