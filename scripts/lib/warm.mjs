/**
 * SICAK-NÖTR (bej/krem) BANDI — tek doğruluk kaynağı.
 *
 * Hem kaynak taraması (`check-palette.mjs`) hem canlı ölçüm
 * (`measure-surface.mjs`) bu dosyayı kullanır. İki tanım olsaydı gün gelir
 * ayrışır ve kapı yanlış yerde yeşile döner.
 *
 * TANIM: bir renk "sıcak-nötr"dür ⇔
 *   - en yüksek kanal KIRMIZI ve en düşük kanal MAVİ (R ≥ G > B),
 *   - doygunluk düşük: 3 ≤ (max − min) ≤ 46.
 *
 * Neden bu iki koşul:
 *   · R en yüksek + B en düşük  → sarı/turuncu tarafa yatan bir renk. Zümrüt
 *     (#152A21, en yüksek kanal YEŞİL) ve mist yeşilleri bu testin dışında kalır.
 *   · chroma ≤ 46 → BEJ, krem, kum, "kağıt": kirli-nötr tonlar. Marka altını
 *     bilerek dışarıda: #B19565 chroma 76, #C9AE77 chroma 82, #7E6636 chroma 72.
 *     Altın bir VURGU rengidir, zemin değil; kapı onu yasaklamaz.
 *   · chroma ≥ 3 → saf gri / beyaz / siyah (R=G=B) serbest.
 */

export const CHROMA_TABAN = 3;
export const CHROMA_TAVAN = 46;

/** '#f4f1ea' | '#fff' -> {r,g,b} | null */
export function hexten(hex) {
  const t = String(hex).trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]+$/.test(t)) return null;
  if (t.length === 3) {
    return {
      r: parseInt(t[0] + t[0], 16),
      g: parseInt(t[1] + t[1], 16),
      b: parseInt(t[2] + t[2], 16),
    };
  }
  if (t.length === 6 || t.length === 8) {
    return {
      r: parseInt(t.slice(0, 2), 16),
      g: parseInt(t.slice(2, 4), 16),
      b: parseInt(t.slice(4, 6), 16),
    };
  }
  return null;
}

/** 'rgb(244, 241, 234)' | 'rgba(...)' -> {r,g,b} | null (tam saydam ise null) */
export function rgbAyristir(deger) {
  const m = String(deger).match(
    /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.%]+))?\s*\)/i
  );
  if (!m) return null;
  if (m[4] !== undefined) {
    const a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    if (a === 0) return null;
  }
  return { r: Math.round(+m[1]), g: Math.round(+m[2]), b: Math.round(+m[3]) };
}

export function sicakNotrMu({ r, g, b }) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  if (chroma < CHROMA_TABAN || chroma > CHROMA_TAVAN) return false;
  return max === r && min === b; // R ≥ G > B
}

/* --------------------------------------------------------------- kontrast */

function kanal(v) {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x bağıl parlaklık */
export function parlaklik({ r, g, b }) {
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

/** WCAG kontrast oranı — göz kararı değil, sRGB aritmetiği */
export function kontrastOrani(a, b) {
  const la = parlaklik(a);
  const lb = parlaklik(b);
  const [ust, alt] = la > lb ? [la, lb] : [lb, la];
  return (ust + 0.05) / (alt + 0.05);
}
