// Parses the word lists in /data into card objects.
// To add a lesson: add its data file and one entry to SOURCES. Everything else derives from it.
import lesson01 from '../data/lesson01.js';
import lesson02 from '../data/lesson02.js';
import lesson03 from '../data/lesson03.js';
import lesson04 from '../data/lesson04.js';
import lesson05 from '../data/lesson05.js';
import lesson06 from '../data/lesson06.js';
import lesson07 from '../data/lesson07.js';
import lesson08 from '../data/lesson08.js';
import lesson09 from '../data/lesson09.js';
import lesson10 from '../data/lesson10.js';
import lesson11 from '../data/lesson11.js';
import lesson12 from '../data/lesson12.js';
import lesson13 from '../data/lesson13.js';
import lesson14 from '../data/lesson14.js';
import lesson15 from '../data/lesson15.js';
import lesson16 from '../data/lesson16.js';
import lesson17 from '../data/lesson17.js';
import lesson18 from '../data/lesson18.js';
import lesson19 from '../data/lesson19.js';
import lesson20 from '../data/lesson20.js';
import lesson21 from '../data/lesson21.js';
import lesson22 from '../data/lesson22.js';
import lesson23 from '../data/lesson23.js';
import lesson24 from '../data/lesson24.js';
import lesson25 from '../data/lesson25.js';

const SOURCES = {
  1: lesson01, 2: lesson02, 3: lesson03, 4: lesson04, 5: lesson05,
  6: lesson06, 7: lesson07, 8: lesson08, 9: lesson09, 10: lesson10,
  11: lesson11, 12: lesson12, 13: lesson13, 14: lesson14, 15: lesson15,
  16: lesson16, 17: lesson17, 18: lesson18, 19: lesson19, 20: lesson20,
  21: lesson21, 22: lesson22, 23: lesson23, 24: lesson24, 25: lesson25,
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
