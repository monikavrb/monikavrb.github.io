// Small DOM and string helpers shared by the other modules.

export const $ = (id) => document.getElementById(id);

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ESCAPES[c]);
}

// Removes the "～" placeholder used in entries such as ～さん, so it is not spoken or matched
export function stripTilde(s) {
  return s.replace(/[～~]/g, '').trim();
}

// Fisher-Yates, in place
export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
