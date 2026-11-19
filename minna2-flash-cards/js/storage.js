// Progress and preferences, saved in localStorage.
import { LESSONS, TOTAL } from './cards.js';

// Do not rename: users' progress is stored under this key.
const KEY = 'minna2-flashcards-v1';
const VERSION = 1;

export const known = new Set();
export const review = new Set();   // words marked "Again" in Study; practised in the Review tab
// New users start on the first lesson, since the book is studied lesson by lesson.
export const prefs = { lessons: [LESSONS[0]], dir: 'ja', skip: true, shuffle: true, mode: 'study' };

const byNumber = (a, b) => a - b;

try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  if (Array.isArray(saved.known)) saved.known.forEach((k) => known.add(k));
  if (Array.isArray(saved.review)) saved.review.forEach((k) => review.add(k));
  if (saved.mode === 'review' || saved.mode === 'study') prefs.mode = saved.mode;
  if (Array.isArray(saved.lessons)) {
    const lessons = saved.lessons.filter((n) => TOTAL[n]);
    if (lessons.length) prefs.lessons = lessons.sort(byNumber);
  }
  if (saved.dir === 'en' || saved.dir === 'ja') prefs.dir = saved.dir;
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
      lessons: prefs.lessons,
      dir: prefs.dir,
      skip: prefs.skip,
      shuffle: prefs.shuffle,
    }));
  } catch (e) { /* ignore */ }
}

// Returns the lesson selection with `n` turned on or off, keeping at least one selected.
export function toggleLesson(lessons, n) {
  if (!lessons.includes(n)) return [...lessons, n].sort(byNumber);
  return lessons.length > 1 ? lessons.filter((l) => l !== n) : lessons;
}

export function allSelected(lessons) {
  return lessons.length === LESSONS.length;
}

// "Select all" when some lessons are off; otherwise "Clear", which goes back to the first lesson
export function toggleAll(lessons) {
  return allSelected(lessons) ? [LESSONS[0]] : [...LESSONS];
}
