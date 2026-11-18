// Everything that writes to the DOM. Functions receive the session and actions they need,
// so this module does not import session.js (no circular dependency).
import { $, esc } from './utils.js';
import { romaji } from './romaji.js';
import { CARDS, TOTAL, LESSONS } from './cards.js';
import { known, review, prefs, allSelected } from './storage.js';

// ---------- card content ----------
const SAYBTN = '<button type="button" class="say" aria-label="Play sentence"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg></button>';

// Where the study word appears in the sentence, as a list of [start, end] marks, or null.
// Entries such as ちょっと～まで or ～や～など highlight each part in order.
// Verbs and i-adjectives are often conjugated (待ちます → 待って, 若い → 若くて),
// so if the whole word is missing it tries the stem: drop ます (then one more kana), or drop the final い.
const HAS_KANJI = /[一-鿿々]/;
export function findWord(ja, word) {
  const parts = word.replace(/\s+/g, '').split(/[～~]/).filter(Boolean);
  if (parts.length > 1) {
    const marks = [];
    let from = 0;
    for (const p of parts) {
      const i = ja.indexOf(p, from);
      if (i < 0) return null;
      marks.push([i, i + p.length]);
      from = i + p.length;
    }
    return marks;
  }
  const t = parts[0] || '';
  if (!t) return null;
  const tries = [t];
  if (t.endsWith('ます')) { const stem = t.slice(0, -2); tries.push(stem, stem.slice(0, -1)); }
  else if (t.endsWith('い')) tries.push(t.slice(0, -1));
  for (let k = 0; k < tries.length; k++) {
    const x = tries[k];
    if (k > 0 && x.length < 2 && !HAS_KANJI.test(x)) continue;   // a one-kana stem would match anywhere
    const i = ja.indexOf(x);
    if (i > -1) return [[i, i + x.length]];
  }
  return null;
}

// example sentence with the study word highlighted
function hiSentence(ja, word) {
  const marks = findWord(ja, word);
  if (!marks) return esc(ja);
  let out = '', last = 0;
  marks.forEach(([a, b]) => {
    // a short highlighted word is kept on one line (イギ / リス looked broken)
    out += esc(ja.slice(last, a)) + '<mark' + (b - a <= 8 ? ' class="nw"' : '') + '>' + esc(ja.slice(a, b)) + '</mark>';
    last = b;
  });
  return out + esc(ja.slice(last));
}

function exFront(c) {
  return c.ja ? '<div class="ex" lang="ja">' + hiSentence(c.ja, c.word) + SAYBTN + '</div>' : '';
}

function exBack(c) {
  if (!c.ja) return '';
  return '<div class="exbox"><div class="ex" lang="ja">' + hiSentence(c.ja, c.word) + SAYBTN + '</div>' +
    (c.jread ? '<div class="exkana" lang="ja">' + esc(c.jread) + '</div>' : '') +
    (c.sen ? '<div class="exen">' + esc(c.sen) + '</div>' : '') + '</div>';
}

// The word in large type, sized by its length so long phrases still fit on a phone
function bigWord(word) {
  const n = Array.from(word.replace(/\s+/g, '')).length;
  const px = n <= 2 ? 96 : n <= 3 ? 80 : n <= 4 ? 68 : n <= 6 ? 54 : n <= 8 ? 44 : n <= 12 ? 34 : 28;
  return '<div class="word" lang="ja" style="--size:' + px + 'px;--n:' + Math.min(n, 12) + '">' + esc(word) + '</div>';
}

// Kana reading (left out when the word is already written in kana) and romaji
function readingHTML(c) {
  return (c.reading !== c.word ? '<div class="reading" lang="ja">' + esc(c.reading) + '</div>' : '') +
    '<div class="romaji">' + esc(romaji(c.reading)) + '</div>';
}

function renderCard(c) {
  const tag = '<div class="tag">Lesson ' + c.lesson + '</div>';
  const hint = '<div class="hint">Tap to reveal</div>';
  if (prefs.dir === 'ja') {
    $('front').innerHTML = tag + bigWord(c.word) + exFront(c) + hint;
    $('back').innerHTML = tag + '<div class="word-sm" lang="ja">' + esc(c.word) + '</div>' + readingHTML(c) +
      '<div class="mean">' + esc(c.en) + '</div>' + exBack(c);
  } else {
    $('front').innerHTML = tag + '<div class="mean big">' + esc(c.en) + '</div>' + hint;
    $('back').innerHTML = tag + bigWord(c.word) + readingHTML(c) + exBack(c);
  }
}

// snap: switch sides instantly, without the flip animation
export function showSide(flipped, snap) {
  const card = $('card');
  if (snap) card.classList.add('snap');
  card.classList.toggle('flipped', flipped);
  $('front').setAttribute('aria-hidden', flipped ? 'true' : 'false');
  $('back').setAttribute('aria-hidden', flipped ? 'false' : 'true');
  if (snap) { void card.offsetWidth; card.classList.remove('snap'); }
}

// ---------- lesson chips ----------
const chipEls = {};

export function createChips(onToggle) {
  const levelsEl = $('levels');
  LESSONS.forEach((n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.innerHTML = '<b>' + n + '</b><small></small><span class="bar"><i></i></span>';
    b.addEventListener('click', () => onToggle(n));
    levelsEl.appendChild(b);
    chipEls[n] = b;
  });
}

function renderChips() {
  const counts = Object.fromEntries(LESSONS.map((n) => [n, 0]));
  CARDS.forEach((c) => { if (known.has(c.id)) counts[c.lesson]++; });
  LESSONS.forEach((n) => {
    const b = chipEls[n];
    b.setAttribute('aria-pressed', prefs.lessons.includes(n) ? 'true' : 'false');
    b.setAttribute('aria-label', 'Lesson ' + n + ', ' + counts[n] + ' of ' + TOTAL[n] + ' known');
    b.querySelector('small').textContent = counts[n] + '/' + TOTAL[n];
    b.querySelector('i').style.width = (TOTAL[n] ? counts[n] / TOTAL[n] * 100 : 0) + '%';
  });
  $('allLessons').textContent = allSelected(prefs.lessons) ? 'Clear' : 'Select all';
}

// ---------- finished panel ----------
function doneButton(label, cls, fn) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'btn ' + cls;
  b.textContent = label;
  b.addEventListener('click', fn);
  return b;
}

// actions: { start, setMode, includeKnown } from session.js
function renderDone(sess, actions) {
  const d = $('done');
  d.innerHTML = '';
  const h = document.createElement('h2');
  const p = document.createElement('p');
  const row = document.createElement('div');
  row.className = 'row';
  if (prefs.mode === 'review') {
    if (sess.total === 0) {
      h.textContent = 'Nothing to review';
      p.textContent = 'Words you mark "Again" in Study are collected here. Right now the list is empty.';
    } else {
      h.textContent = 'Review complete';
      p.textContent = 'All ' + sess.total + (sess.total === 1 ? ' word' : ' words') + ' from your Review list are cleared.';
    }
    row.appendChild(doneButton('Back to Study', 'solid', () => actions.setMode('study')));
  } else if (sess.total === 0) {
    h.textContent = 'Nothing left to practice here';
    p.textContent = 'Every word in the selected lessons is marked as known' + (review.size ? ' or waiting in your Review tab.' : '.');
    if (review.size) row.appendChild(doneButton('Go to Review (' + review.size + ')', 'solid', () => actions.setMode('review')));
    row.appendChild(doneButton('Include known words', review.size ? '' : 'solid', () => actions.includeKnown()));
  } else {
    const missed = Object.keys(sess.missed).length;
    h.textContent = 'Session complete';
    p.textContent = sess.total + (sess.total === 1 ? ' word' : ' words') + ' studied, ' + (missed ? missed + ' moved to your Review tab.' : 'none needed another look.');
    if (missed) row.appendChild(doneButton('Go to Review (' + review.size + ')', 'solid', () => actions.setMode('review')));
    row.appendChild(doneButton('Study again', missed ? '' : 'solid', () => actions.start()));
  }
  d.appendChild(h); d.appendChild(p); d.appendChild(row);
}

// ---------- whole page ----------
export function renderAll(sess, actions) {
  renderChips();
  const inReview = prefs.mode === 'review';
  $('tabStudy').setAttribute('aria-selected', inReview ? 'false' : 'true');
  $('tabReview').setAttribute('aria-selected', inReview ? 'true' : 'false');
  $('revCount').textContent = review.size;
  $('revCount').hidden = review.size === 0;
  $('lessons').hidden = inReview;
  $('skipWrap').hidden = inReview;
  $('sub').textContent = inReview
    ? 'Review: only the words you marked "Again". Get one right to clear it from this list.'
    : CARDS.length + ' words from Minna no Nihongo I, lessons 1–' + LESSONS[LESSONS.length - 1] + '. Progress is saved in this browser.';
  $('dirJa').setAttribute('aria-pressed', prefs.dir === 'ja' ? 'true' : 'false');
  $('dirEn').setAttribute('aria-pressed', prefs.dir === 'en' ? 'true' : 'false');
  $('skip').checked = prefs.skip;
  $('shuf').checked = prefs.shuffle;
  $('nLeft').textContent = sess.queue.length;
  $('nGot').textContent = sess.got;
  $('nAgain').textContent = sess.again;
  $('prog').style.width = (sess.total ? sess.got / sess.total * 100 : 0) + '%';
  const live = sess.queue.length > 0;
  $('stage').hidden = !live;
  $('actions').hidden = !live;
  $('done').hidden = live;
  if (live) renderCard(sess.queue[0]); else renderDone(sess, actions);
}
