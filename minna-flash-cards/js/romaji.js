// Converts a kana reading to romaji (Hepburn spelling, no macrons):
// せんせい → sensei, きって → kitte, コーヒー → koohii, ほんや → hon'ya.
// Long vowels are spelled as written (ou, ei, a ー repeats the vowel), so the romaji maps back to kana.

const BASE = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', ゐ: 'i', ゑ: 'e', を: 'o', ん: 'n', ゔ: 'vu',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o', ゃ: 'ya', ゅ: 'yu', ょ: 'yo', ゎ: 'wa',
};

// Two-kana syllables: きゃ, しゅ, ちょ… plus the katakana-only sounds used in loanwords (ティ, ファ…)
const PAIRS = {
  てぃ: 'ti', でぃ: 'di', とぅ: 'tu', どぅ: 'du', つぁ: 'tsa',
  ふぁ: 'fa', ふぃ: 'fi', ふぇ: 'fe', ふぉ: 'fo',
  うぃ: 'wi', うぇ: 'we', うぉ: 'wo',
  ゔぁ: 'va', ゔぃ: 'vi', ゔぇ: 've', ゔぉ: 'vo',
  しぇ: 'she', じぇ: 'je', ちぇ: 'che',
};
const Y_ROW = { き: 'ky', ぎ: 'gy', し: 'sh', じ: 'j', ち: 'ch', ぢ: 'j', に: 'ny', ひ: 'hy', び: 'by', ぴ: 'py', み: 'my', り: 'ry' };
Object.entries(Y_ROW).forEach(([k, r]) => {
  PAIRS[k + 'ゃ'] = r + 'a';
  PAIRS[k + 'ゅ'] = r + 'u';
  PAIRS[k + 'ょ'] = r + 'o';
});

const PUNCT = { '、': ', ', '。': '. ', '？': '? ', '！': '! ', '・': ' ', '～': '~', '（': '(', '）': ')', '「': '"', '」': '"' };

// Set phrases where は or へ is a particle, so it is read "wa" / "e"
const PHRASES = {
  こんにちは: 'konnichiwa',
  こんばんは: 'konbanwa',
  では: 'dewa',
  それでは: 'soredewa',
  ごちゅうもんは: 'gochuumon wa',
  おなまえは: 'onamae wa',
};

// Katakana to hiragana, so one table covers both (ー is not in this range and is kept)
function toHiragana(s) {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

function convertWord(w) {
  const h = toHiragana(w);
  let out = '';
  let doubleNext = false;   // after っ
  let afterN = false;       // after ん: add ' before a vowel or y
  for (let i = 0; i < h.length;) {
    const pair = h.slice(i, i + 2), ch = h[i];
    let r;
    if (PAIRS[pair]) { r = PAIRS[pair]; i += 2; }
    else if (ch === 'っ') { doubleNext = true; i++; continue; }
    else if (ch === 'ー') { const v = out.match(/[aeiou]$/); if (v) out += v[0]; i++; continue; }
    else if (BASE[ch] !== undefined) { r = BASE[ch]; i++; }
    else { r = PUNCT[ch] !== undefined ? PUNCT[ch] : ch; i++; }
    if (afterN && /^[aeiouy]/.test(r)) out += "'";
    if (doubleNext && /^[a-z]/.test(r) && !/^[aeiou]/.test(r)) r = (r.startsWith('ch') ? 't' : r[0]) + r;
    doubleNext = false;
    afterN = ch === 'ん';
    out += r;
  }
  return out;
}

// In a spaced phrase (しんごうを みぎへ まがって ください) each chunk ends in its particle,
// which is written as a separate word: shingou o migi e magatte kudasai.
const PARTICLES = { を: 'o', は: 'wa', へ: 'e', が: 'ga', の: 'no', に: 'ni', で: 'de' };

export function romaji(reading) {
  const tokens = reading.split(/\s+/).filter(Boolean);
  return tokens.map((tok) => {
    const [, core, punct] = tok.match(/^(.*?)([、。？！?!]*)$/);
    const phrase = PHRASES[toHiragana(core)];
    if (phrase) return phrase + convertWord(punct);
    const last = core.slice(-1);
    if (tokens.length > 1 && core.length > 1 && PARTICLES[last]) {
      return convertWord(core.slice(0, -1)) + ' ' + PARTICLES[last] + convertWord(punct);
    }
    return convertWord(tok);
  }).join(' ')
    .replace(/([a-z])~([a-z])/g, '$1 ~ $2')   // ちょっと～まで → chotto ~ made
    .replace(/\s+/g, ' ').replace(/\s+([,.?!])/g, '$1').trim();
}
