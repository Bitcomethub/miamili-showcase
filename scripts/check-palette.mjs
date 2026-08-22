#!/usr/bin/env node
/**
 * PALET KAPISI — `npm run check:palette`
 *
 * Üç kapı. Hepsi geçerse çıkış 0, aksi halde 1.
 *
 *  1. SICAK-NÖTR YASAĞI   src/ içinde bej / krem / kum / "kağıt" bandında bir
 *                         renk var mı? Hem adı konmuş suçlular hem GENEL bant
 *                         (R ≥ G > B, chroma ≤ 46) taranır — yani yasak listeye
 *                         yazmayı unuttuğumuz yeni bir bej de yakalanır.
 *  2. TOKEN BÜTÜNLÜĞÜ     src/ içinde `var(--color-x)` ile çağrılan her token
 *                         globals.css'te TANIMLI mı? (Yeniden adlandırma
 *                         sonrası kalan ölü referansı yakalar; CSS'te tanımsız
 *                         değişken sessizce hiçbir şey yapmaz, ekranda
 *                         "renksiz" metin bırakır.)
 *  3. KONTRAST            Beyan edilen her renk çifti eşiğini geçiyor mu?
 *                         Değerler globals.css'ten OKUNUR — tablo koddan
 *                         ayrışamaz. Metin çiftleri ≥4.5:1 (WCAG 1.4.3 AA),
 *                         kontrol kenarı ve odak halkası ≥3:1 (1.4.11 / 2.4.11).
 *
 * NEDEN VAR: bu sitenin body'si bir zamanlar `--color-cream` (#F4F1EA) idi.
 * "Bir daha yapmayız" bir kapı değildir; bu dosya kapıdır.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  hexten,
  kontrastOrani,
  sicakNotrMu,
  rgbAyristir,
  CHROMA_TABAN,
  CHROMA_TAVAN,
} from './lib/warm.mjs';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KAYNAK = path.join(KOK, 'src');
const TOKEN_DOSYASI = path.join(KOK, 'src', 'app', 'globals.css');

/** Adı konmuş suçlular — bu sitede gerçekten kullanılmış olanlar. */
const YASAK_HEX = {
  '#f4f1ea': 'krem — eski body zemini',
  '#efebe0': 'kum — eski alternatif bölüm zemini',
  '#e5e0d2': 'koyu kum — eski pasif çip',
  '#fbfaf5': '"kağıt" — eski açık zemin kartı',
  '#ded8c9': 'sıcak saç teli — eski açık zemin çizgisi',
  '#5a564b': 'bej-kahve — eski açık zemin gövde metni',
};

const hatalar = [];
const notlar = [];

/* ═════════════════════════════════════ dosyaları topla ═════════════════════ */

function dosyalar(dizin, liste = []) {
  for (const g of fs.readdirSync(dizin, { withFileTypes: true })) {
    const tam = path.join(dizin, g.name);
    if (g.isDirectory()) dosyalar(tam, liste);
    else if (/\.(css|tsx?|jsx?|mjs)$/.test(g.name)) liste.push(tam);
  }
  return liste;
}

const kaynaklar = dosyalar(KAYNAK);

/* ═══════════════════════════ 1. SICAK-NÖTR YASAĞI ══════════════════════════ */

const HEX_DESENI = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b/g;
const RGB_DESENI = /rgba?\([^)]*\)/gi;

let taranan = 0;

for (const dosya of kaynaklar) {
  const satirlar = fs.readFileSync(dosya, 'utf8').split('\n');
  const bagil = path.relative(KOK, dosya);

  satirlar.forEach((satir, i) => {
    const yer = `${bagil}:${i + 1}`;

    for (const ham of satir.match(HEX_DESENI) ?? []) {
      taranan++;
      const kucuk = ham.toLowerCase();
      const rgb = hexten(ham);
      if (!rgb) continue;

      if (YASAK_HEX[kucuk]) {
        hatalar.push(`${yer}  ${ham} — YASAK: ${YASAK_HEX[kucuk]}`);
      } else if (sicakNotrMu(rgb)) {
        const c = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
        hatalar.push(
          `${yer}  ${ham} — sıcak-nötr bandında (R≥G>B, chroma ${c}). ` +
            `Bej/krem YASAK; soğuk nötr kullan (--color-frost / --color-frost-deep).`
        );
      }
    }

    for (const ham of satir.match(RGB_DESENI) ?? []) {
      const rgb = rgbAyristir(ham);
      if (rgb && sicakNotrMu(rgb)) {
        hatalar.push(`${yer}  ${ham} — sıcak-nötr bandında (R≥G>B).`);
      }
    }
  });
}
notlar.push(`sıcak-nötr taraması: ${kaynaklar.length} dosya, ${taranan} hex değeri`);

/* ═══════════════════════════ token tablosunu oku ═══════════════════════════ */

const tokenCss = fs.readFileSync(TOKEN_DOSYASI, 'utf8');
const TOKENLAR = Object.fromEntries(
  [...tokenCss.matchAll(/(--color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)].map(
    (m) => [m[1], m[2].toLowerCase()]
  )
);

/* ═══════════════════════════ 2. TOKEN BÜTÜNLÜĞÜ ════════════════════════════ */

const kullanilan = new Map();
for (const dosya of kaynaklar) {
  const metin = fs.readFileSync(dosya, 'utf8');
  for (const m of metin.matchAll(/var\((--color-[a-z0-9-]+)/g)) {
    if (!kullanilan.has(m[1])) kullanilan.set(m[1], path.relative(KOK, dosya));
  }
}
for (const [token, dosya] of kullanilan) {
  if (!TOKENLAR[token]) {
    hatalar.push(`${dosya}  var(${token}) — globals.css'te TANIMLI DEĞİL (ölü referans)`);
  }
}
const olu = [...Object.keys(TOKENLAR)].filter((t) => !kullanilan.has(t));
notlar.push(
  `token bütünlüğü: ${Object.keys(TOKENLAR).length} tanımlı, ${kullanilan.size} kullanılıyor` +
    (olu.length ? `, kullanılmayan: ${olu.join(', ')}` : '')
);

/* ══════════════════════════════ 3. KONTRAST ════════════════════════════════ */

const METIN = 4.5; // WCAG 1.4.3 AA — normal punto metin
const NESNE = 3.0; // WCAG 1.4.11 / 2.4.11 — kontrol kenarı, odak halkası

/** [ön, arka, eşik, rol] — değerler globals.css'ten çözülür */
const CIFTLER = [
  // ---- KOYU YÜZEY: --color-ink ----
  ['--color-blanc', '--color-ink', METIN, 'başlık / değer'],
  ['--color-mist', '--color-ink', METIN, 'gövde metni'],
  ['--color-mist-dim', '--color-ink', METIN, 'üçüncül metin / dipnot'],
  ['--color-gold-lift', '--color-ink', METIN, 'altın metin (yalnız koyu zemin)'],
  ['--color-ink-edge-strong', '--color-ink', NESNE, 'kontrol kenarı'],
  ['--color-gold-focus', '--color-ink', NESNE, 'odak halkası'],

  // ---- KOYU YÜZEY: --color-ink-lift (yükseltilmiş kart) ----
  ['--color-blanc', '--color-ink-lift', METIN, 'başlık / değer'],
  ['--color-mist', '--color-ink-lift', METIN, 'gövde metni'],
  ['--color-mist-dim', '--color-ink-lift', METIN, 'üçüncül metin'],
  ['--color-gold-lift', '--color-ink-lift', METIN, 'altın metin'],
  ['--color-gold-focus', '--color-ink-lift', NESNE, 'odak halkası'],

  // ---- AÇIK YÜZEY: --color-blanc (saf beyaz okuma bandı) ----
  ['--color-ink', '--color-blanc', METIN, 'başlık / değer'],
  ['--color-moss', '--color-blanc', METIN, 'gövde metni / etiket'],
  ['--color-moss-dim', '--color-blanc', METIN, 'üçüncül metin'],
  ['--color-edge-strong', '--color-blanc', NESNE, 'kontrol kenarı'],
  ['--color-gold-focus', '--color-blanc', NESNE, 'odak halkası'],

  // ---- AÇIK YÜZEY: --color-frost (ikincil soğuk nötr) ----
  ['--color-ink', '--color-frost', METIN, 'başlık / değer'],
  ['--color-moss', '--color-frost', METIN, 'gövde metni'],
  ['--color-moss-dim', '--color-frost', METIN, 'üçüncül metin'],
  ['--color-edge-strong', '--color-frost', NESNE, 'kontrol kenarı'],
  ['--color-gold-focus', '--color-frost', NESNE, 'odak halkası'],

  // ---- ALTIN DOLGU: her iki yüzeyde de aynı buton ----
  ['--color-ink', '--color-gold', METIN, 'buton metni (altın dolgu)'],
  ['--color-ink', '--color-frost-deep', METIN, 'pasif çip metni'],
];

/**
 * Bunların GEÇMEMESİ gerekiyor — "açık zeminde altın metin YASAK" kuralının
 * gerekçesi. Bir gün geçerlerse kural gereksizleşmiş demektir; kapı haber verir.
 */
const YASAK_CIFTLER = [
  ['--color-gold', '--color-blanc', 'altın metin, beyaz zemin'],
  ['--color-gold-lift', '--color-blanc', 'açık altın metin, beyaz zemin'],
  ['--color-gold', '--color-frost', 'altın metin, soğuk nötr zemin'],
];

const tablo = [];
for (const [onToken, arkaToken, esik, rol] of CIFTLER) {
  const on = TOKENLAR[onToken];
  const arka = TOKENLAR[arkaToken];
  if (!on || !arka) {
    hatalar.push(`kontrast: ${onToken} veya ${arkaToken} globals.css'te yok`);
    continue;
  }
  const oran = kontrastOrani(hexten(on), hexten(arka));
  const gecti = oran >= esik;
  if (!gecti) {
    hatalar.push(
      `kontrast: ${onToken} (${on}) üzerinde ${arkaToken} (${arka}) = ` +
        `${oran.toFixed(2)}:1 — ${esik}:1 gerekiyordu (${rol})`
    );
  }
  tablo.push({ onToken, on, arkaToken, arka, oran, esik, rol, gecti });
}

const yasakTablo = YASAK_CIFTLER.map(([onToken, arkaToken, rol]) => {
  const on = TOKENLAR[onToken];
  const arka = TOKENLAR[arkaToken];
  const oran = kontrastOrani(hexten(on), hexten(arka));
  if (oran >= METIN) {
    hatalar.push(
      `kontrast: ${rol} artık ${oran.toFixed(2)}:1 ile GEÇİYOR — ` +
        `"açık zeminde altın metin yasak" kuralının gerekçesi düştü, kuralı gözden geçir.`
    );
  }
  return { onToken, on, arkaToken, arka, oran, rol };
});

/* ═══════════════════════════════════ rapor ═════════════════════════════════ */

console.log('\nPALET KAPISI');
console.log('════════════════════════════════════════════════════════════════════════');
notlar.forEach((n) => console.log(`  · ${n}`));
console.log(
  `  · sıcak-nötr tanımı: R ≥ G > B ve ${CHROMA_TABAN} ≤ chroma ≤ ${CHROMA_TAVAN}`
);

console.log('\nKONTRAST TABLOSU (sRGB/WCAG aritmetiği — göz kararı değil)');
console.log('────────────────────────────────────────────────────────────────────────');
console.log(
  `  ${'ön plan'.padEnd(24)} ${'zemin'.padEnd(22)} ${'oran'.padStart(8)}  ${'eşik'.padStart(5)}   rol`
);
let oncekiArka = null;
for (const s of tablo) {
  if (oncekiArka && oncekiArka !== s.arkaToken) console.log('  ' + '─'.repeat(68));
  oncekiArka = s.arkaToken;
  console.log(
    `  ${(s.onToken.replace('--color-', '') + ' ' + s.on).padEnd(24)}` +
      `${(s.arkaToken.replace('--color-', '') + ' ' + s.arka).padEnd(22)}` +
      `${(s.oran.toFixed(2) + ':1').padStart(8)}  ${(s.esik + ':1').padStart(5)}  ` +
      `${s.gecti ? '✓' : '✗'} ${s.rol}`
  );
}

console.log('\nBİLEREK KULLANILMAYAN ÇİFTLER (açık zeminde altın metin yasağının gerekçesi)');
console.log('────────────────────────────────────────────────────────────────────────');
for (const s of yasakTablo) {
  console.log(
    `  ${(s.onToken.replace('--color-', '') + ' ' + s.on).padEnd(24)}` +
      `${(s.arkaToken.replace('--color-', '') + ' ' + s.arka).padEnd(22)}` +
      `${(s.oran.toFixed(2) + ':1').padStart(8)}  ${'—'.padStart(5)}  ✗ ${s.rol}`
  );
}

if (hatalar.length) {
  console.log('\n❌ KAPI KAPALI');
  console.log('────────────────────────────────────────────────────────────────────────');
  hatalar.forEach((h) => console.log(`  ${h}`));
  console.log(`\n  ${hatalar.length} hata.\n`);
  process.exit(1);
}

console.log(`\n✓ KAPI AÇIK — ${tablo.length} renk çifti eşiğini geçti, sıcak-nötr yok.\n`);
process.exit(0);
