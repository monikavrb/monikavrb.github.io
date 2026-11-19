// Parses the word lists in /data into card objects.
// To add a lesson: add its data file and one entry to SOURCES. Everything else derives from it.
import lesson26 from '../data/lesson26.js';
import lesson27 from '../data/lesson27.js';
import lesson28 from '../data/lesson28.js';
import lesson29 from '../data/lesson29.js';
import lesson30 from '../data/lesson30.js';
import lesson31 from '../data/lesson31.js';
import lesson32 from '../data/lesson32.js';
import lesson33 from '../data/lesson33.js';
import lesson34 from '../data/lesson34.js';
import lesson35 from '../data/lesson35.js';
import lesson36 from '../data/lesson36.js';
import lesson37 from '../data/lesson37.js';
import lesson38 from '../data/lesson38.js';
import lesson39 from '../data/lesson39.js';
import lesson40 from '../data/lesson40.js';
import lesson41 from '../data/lesson41.js';
import lesson42 from '../data/lesson42.js';
import lesson43 from '../data/lesson43.js';
import lesson44 from '../data/lesson44.js';
import lesson45 from '../data/lesson45.js';
import lesson46 from '../data/lesson46.js';
import lesson47 from '../data/lesson47.js';
import lesson48 from '../data/lesson48.js';
import lesson49 from '../data/lesson49.js';
import lesson50 from '../data/lesson50.js';

const SOURCES = {
  26: lesson26, 27: lesson27, 28: lesson28, 29: lesson29, 30: lesson30,
  31: lesson31, 32: lesson32, 33: lesson33, 34: lesson34, 35: lesson35,
  36: lesson36, 37: lesson37, 38: lesson38, 39: lesson39, 40: lesson40,
  41: lesson41, 42: lesson42, 43: lesson43, 44: lesson44, 45: lesson45,
  46: lesson46, 47: lesson47, 48: lesson48, 49: lesson49, 50: lesson50,
};

export const LESSONS = Object.keys(SOURCES).map(Number).sort((a, b) => a - b);

export const CARDS = [];
export const TOTAL = Object.fromEntries(LESSONS.map((n) => [n, 0]));

LESSONS.forEach((lesson) => {
  SOURCES[lesson].split('\n').forEach((line) => {
    const p = line.split('|').map((s) => s.trim());
    if (p.length < 3) return;
    const [word, reading, en, ja = '', jread = '', sen = ''] = p;
    CARDS.push({
      id: word + '|' + reading,   // saved progress is keyed on this
      word, reading, en, ja, jread, sen, lesson,
    });
    TOTAL[lesson]++;
  });
});
