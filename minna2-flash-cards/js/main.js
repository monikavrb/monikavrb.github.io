// Entry point: wires the page controls to the session, then starts the first session.
import { $, stripTilde } from './utils.js';
import { known, review, prefs, save, toggleLesson, toggleAll } from './storage.js';
import { canSpeak, say } from './speech.js';
import { createChips } from './render.js';
import { start, setMode, flip, grade, currentCard, updatePrefs } from './session.js';

// ---------- lesson chips ----------
createChips((n) => updatePrefs({ lessons: toggleLesson(prefs.lessons, n) }));
$('allLessons').addEventListener('click', () => updatePrefs({ lessons: toggleAll(prefs.lessons) }));

// ---------- speech ----------
if (canSpeak) $('speak').hidden = false; else document.body.classList.add('nospeech');

// The word is spoken from its kana reading, so the voice cannot misread the kanji
$('speak').addEventListener('click', () => {
  const c = currentCard();
  if (c) say(stripTilde(c.reading), 0.85);
});
// sentence audio: capture so tapping it doesn't flip the card
$('card').addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('.say');
  if (!b) return;
  e.stopPropagation();
  const c = currentCard();
  if (c && c.ja) say(c.ja, 0.8);
}, true);

// ---------- card and options ----------
$('card').addEventListener('click', flip);
$('again').addEventListener('click', () => grade(false));
$('got').addEventListener('click', () => grade(true));
$('dirJa').addEventListener('click', () => updatePrefs({ dir: 'ja' }));
$('dirEn').addEventListener('click', () => updatePrefs({ dir: 'en' }));
$('skip').addEventListener('change', (e) => updatePrefs({ skip: e.target.checked }));
$('shuf').addEventListener('change', (e) => updatePrefs({ shuffle: e.target.checked }));

$('tabStudy').addEventListener('click', () => setMode('study'));
$('tabReview').addEventListener('click', () => setMode('review'));

// ---------- reset (asks for a second tap) ----------
let resetTimer = null;
$('reset').addEventListener('click', () => {
  const b = $('reset');
  if (!resetTimer) {
    b.textContent = 'Tap again to clear all progress';
    resetTimer = setTimeout(() => { resetTimer = null; b.textContent = 'Reset progress'; }, 4000);
    return;
  }
  clearTimeout(resetTimer);
  resetTimer = null;
  b.textContent = 'Reset progress';
  known.clear();
  review.clear();
  save();
  start();
});

// ---------- keyboard ----------
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  const onCard = t && t.id === 'card';
  if (t && t !== document.body && !onCard && t.closest && t.closest('button, input, select, textarea')) return;
  if (e.key === ' ' || (e.key === 'Enter' && onCard)) { e.preventDefault(); flip(); }
  else if (e.key === '1') grade(false);
  else if (e.key === '2') grade(true);
});

start();
