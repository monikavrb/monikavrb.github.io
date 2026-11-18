// Parses the word lists in /data into card objects.
// To add a level: add its data file and one entry to SOURCES. Everything else derives from it.
import hsk1 from '../data/hsk1.js';
import hsk2 from '../data/hsk2.js';
import hsk3 from '../data/hsk3.js';
import hsk4 from '../data/hsk4.js';
import hsk5 from '../data/hsk5.js';

const SOURCES = { 1: hsk1, 2: hsk2, 3: hsk3, 4: hsk4, 5: hsk5 };

export const LEVELS = Object.keys(SOURCES).map(Number).sort((a, b) => a - b);

export const CARDS = [];
export const TOTAL = Object.fromEntries(LEVELS.map((lv) => [lv, 0]));

LEVELS.forEach((lv) => {
  SOURCES[lv].split('\n').forEach((line) => {
    const p = line.split('|').map((s) => s.trim());
    if (p.length < 3) return;
    const [hz, py, en, zh = '', spy = '', sen = ''] = p;
    CARDS.push({
      id: hz + '|' + py,   // saved progress is keyed on this
      hz, py, en, zh, spy, sen, lv,
    });
    TOTAL[lv]++;
  });
});
