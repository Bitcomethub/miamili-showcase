#!/usr/bin/env node
/**
 * VERİ DOĞRULAMA — `npm run verify` (önce `npm run build` gerekir)
 *
 * Bu script "gözle kontrol ettim" demenin yerine geçer. Yedi kapıdan geçer:
 *
 *  1. REFERANS SADAKATİ   data/<slug>.json'daki olgu alanları, dokunulmamış
 *                         reference/palm-tree-residences-data.json ile birebir
 *                         aynı mı? (derin eşitlik)
 *  2. ŞABLON DİSİPLİNİ    Editoryal metinlerde çıplak rakam var mı? Olgu
 *                         sayıları {{token}} ile gelmek ZORUNDA.
 *  3. İZLENEBİLİRLİK      Render edilmiş sayfadaki GÖRÜNÜR her sayı, veriden
 *                         (veya açıkça beyan edilmiş türetmelerden) geliyor mu?
 *                         Uydurulmuş tek bir rakam bu kapıdan geçemez.
 *  4. EKSİKSİZLİK         Verideki her olgu (19 ünite, fiyatlar, ameniteler,
 *                         broker künyesi, yasal metin) sayfada var mı?
 *  5. KAYNAK SAFLIĞI      Olgu değerleri JSX'e elle yazılmış mı?
 *  6. GÖRSEL DÜRÜSTLÜĞÜ   Sayfada marka logosu dışında raster görsel var mı?
 *                         (uydurma render / stok görsel koruması)
 *  7. TOKEN BÜTÜNLÜĞÜ     Çözülmemiş {{...}} sayfaya sızmış mı?
 *
 * Çıkış kodu 0 = hepsi geçti. Aksi halde 1.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REFERANS = path.join(KOK, 'reference', 'palm-tree-residences-data.json');
const VERI_DIZINI = path.join(KOK, 'data');
const KAYNAK_DIZINI = path.join(KOK, 'src');
const CIKTI_DIZINI = path.join(KOK, '.next', 'server', 'app');

const hatalar = [];
const gecenler = [];

function kontrol(ad, kosul, detay = '') {
  if (kosul) gecenler.push(ad);
  else hatalar.push(`${ad}${detay ? ` — ${detay}` : ''}`);
}

function derinEsit(a, b, yol = '') {
  if (a === b) return null;
  if (typeof a !== typeof b) return `${yol}: tip farkı (${typeof a} / ${typeof b})`;
  if (a === null || b === null) return `${yol}: biri null`;
  if (Array.isArray(a) !== Array.isArray(b)) return `${yol}: dizi/nesne farkı`;
  if (typeof a !== 'object') return `${yol}: "${a}" ≠ "${b}"`;

  if (Array.isArray(a)) {
    if (a.length !== b.length) {
      return `${yol}: uzunluk ${a.length} ≠ ${b.length}`;
    }
    for (let i = 0; i < a.length; i++) {
      const h = derinEsit(a[i], b[i], `${yol}[${i}]`);
      if (h) return h;
    }
    return null;
  }

  for (const anahtar of Object.keys(a)) {
    if (!(anahtar in b)) return `${yol}.${anahtar}: hedefte yok`;
    const h = derinEsit(a[anahtar], b[anahtar], `${yol}.${anahtar}`);
    if (h) return h;
  }
  return null;
}

/** Bir değerin içindeki tüm sayı belirteçlerini normalize ederek toplar. */
function sayilariTopla(deger, kume = new Set()) {
  if (deger === null || deger === undefined) return kume;
  if (typeof deger === 'number') {
    kume.add(normalizeSayi(String(deger)));
    return kume;
  }
  if (typeof deger === 'string') {
    for (const eslesme of deger.matchAll(/\d[\d.,]*/g)) {
      kume.add(normalizeSayi(eslesme[0]));
    }
    return kume;
  }
  if (Array.isArray(deger)) {
    deger.forEach((d) => sayilariTopla(d, kume));
    return kume;
  }
  if (typeof deger === 'object') {
    Object.values(deger).forEach((d) => sayilariTopla(d, kume));
    return kume;
  }
  return kume;
}

/** "560,000" ve "1.79" gibi biçimleri karşılaştırılabilir tek bir forma indirir. */
function normalizeSayi(ham) {
  return ham.replace(/[.,](?=$)/, '').replace(/[.,]/g, '');
}

const VARLIKLAR = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
};

/**
 * Entity'ler ÇÖZÜLÜR, silinmez. Silinseydi "Chef's Kitchen" ve
 * "Wellness & Spor" gibi metinler eksik sanılırdı (gerçek bir yanlış alarm).
 */
function varliklariCoz(metin) {
  return metin
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (tam, ad) => VARLIKLAR[ad.toLowerCase()] ?? tam);
}

function gorunurMetin(html) {
  const govde = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return varliklariCoz(govde).replace(/\s+/g, ' ');
}

function kaynakDosyalari(dizin, liste = []) {
  for (const giris of fs.readdirSync(dizin, { withFileTypes: true })) {
    const tam = path.join(dizin, giris.name);
    if (giris.isDirectory()) kaynakDosyalari(tam, liste);
    else if (/\.(tsx?|css)$/.test(giris.name)) liste.push(tam);
  }
  return liste;
}

/* ========================================================================== */

const referans = JSON.parse(fs.readFileSync(REFERANS, 'utf8'));
const veriDosyalari = fs
  .readdirSync(VERI_DIZINI)
  .filter((d) => d.endsWith('.json'));

kontrol('data/ dizininde en az bir proje var', veriDosyalari.length > 0);

for (const dosya of veriDosyalari) {
  const veri = JSON.parse(fs.readFileSync(path.join(VERI_DIZINI, dosya), 'utf8'));
  const slug = veri.slug;
  const etiket = `[${slug}]`;

  /* --- 1. REFERANS SADAKATİ ------------------------------------------------ */
  if (referans.slug === slug) {
    const olguAnahtarlari = Object.keys(referans);
    let sapma = null;
    for (const anahtar of olguAnahtarlari) {
      const h = derinEsit(referans[anahtar], veri[anahtar], anahtar);
      if (h) {
        sapma = h;
        break;
      }
    }
    kontrol(
      `${etiket} 1. Referans sadakati: ${olguAnahtarlari.length} olgu alanının tamamı birebir aynı`,
      sapma === null,
      sapma ?? ''
    );
  }

  /* --- 2. ŞABLON DİSİPLİNİ ------------------------------------------------- */
  const editoryal = Object.entries(veri.sunum ?? {});
  const cipliakRakamli = editoryal.filter(([, metin]) => {
    const tokensiz = String(metin).replace(/\{\{\w+\}\}/g, '');
    return /\d/.test(tokensiz);
  });
  kontrol(
    `${etiket} 2. Şablon disiplini: editoryal metinlerde çıplak rakam yok`,
    cipliakRakamli.length === 0,
    cipliakRakamli.map(([k]) => `sunum.${k}`).join(', ')
  );

  const illustratifTokensiz = String(veri.yasal.illustratif_uyari).replace(
    /\{\{\w+\}\}/g,
    ''
  );
  kontrol(
    `${etiket} 2b. Yasal uyarıdaki HOA değeri token ile geliyor`,
    !/\d/.test(illustratifTokensiz) &&
      veri.yasal.illustratif_uyari.includes('{{hoa_tr}}'),
    illustratifTokensiz.match(/\d[\d.,]*/g)?.join(', ') ?? ''
  );

  kontrol(
    `${etiket} 2c. kisa_ad + alt_ad tam proje adını veriyor`,
    `${veri.sunum.kisa_ad} ${veri.sunum.alt_ad}` === veri.ad,
    `"${veri.sunum.kisa_ad} ${veri.sunum.alt_ad}" ≠ "${veri.ad}"`
  );

  /* --- Ünite tipi -> fiyat eşleşmesi (uydurma/yaklaşık eşleştirme yok) ----- */
  const fiyatTipleri = new Set(veri.unite_tipleri_fiyat.map((f) => f.tip));
  const eslesmeyen = veri.ornek_unite_listesi
    .map((u) => u.tip)
    .filter((t) => !fiyatTipleri.has(t));
  kontrol(
    `${etiket} 2d. Her örnek ünitenin tipi fiyat tablosunda TAM eşleşiyor`,
    eslesmeyen.length === 0,
    [...new Set(eslesmeyen)].join(' | ')
  );

  /* --- Render edilmiş HTML -------------------------------------------------- */
  const htmlYolu = path.join(CIKTI_DIZINI, `${slug}.html`);
  if (!fs.existsSync(htmlYolu)) {
    hatalar.push(
      `${etiket} Render çıktısı bulunamadı: ${htmlYolu} — önce "npm run build" çalıştırın.`
    );
    continue;
  }
  const html = fs.readFileSync(htmlYolu, 'utf8');
  const metin = gorunurMetin(html);

  /* --- 3. İZLENEBİLİRLİK ---------------------------------------------------- */
  const izinliSayilar = sayilariTopla(veri);

  // Açıkça beyan edilmiş türetmeler ve yapısal sayılar:
  const pesinat = veri.depozito_yapisi.reduce(
    (t, s) => t + Number(/^%(\d+)/.exec(s)?.[1] ?? 0),
    0
  );
  const turetilmisler = new Map([
    [String(pesinat), 'toplam peşinat = depozito yüzdelerinin toplamı'],
    [String(100 - pesinat), 'kalan bakiye = 100 − toplam peşinat'],
    ['100', 'yüzde tabanı'],
    ['2026', 'telif yılı'],
  ]);
  for (const [s] of turetilmisler) izinliSayilar.add(s);

  // Şematik kat diyagramı 01..kat_sayisi arası tüm kat numaralarını çizer;
  // liste sıra numaraları da bu aralıkta kalır.
  for (let k = 1; k <= veri.kat_sayisi; k++) izinliSayilar.add(String(k));

  const gorulen = new Map();
  for (const eslesme of metin.matchAll(/\d[\d.,]*/g)) {
    const norm = normalizeSayi(eslesme[0]);
    if (!izinliSayilar.has(norm)) {
      const baglam = metin
        .slice(Math.max(0, eslesme.index - 45), eslesme.index + 45)
        .trim();
      gorulen.set(eslesme[0], baglam);
    }
  }
  kontrol(
    `${etiket} 3. İzlenebilirlik: sayfadaki görünür her sayı veriden türüyor`,
    gorulen.size === 0,
    [...gorulen.entries()]
      .map(([s, b]) => `"${s}" → …${b}…`)
      .join('  ||  ')
  );

  /* --- 4. EKSİKSİZLİK ------------------------------------------------------- */
  const eksik = [];

  for (const u of veri.ornek_unite_listesi) {
    // Seçili olmayan üniteler istemci bileşenine prop olarak geçer; bu yüzden
    // görünür metinde değil, HAM HTML'de (RSC payload dâhil) aranır.
    if (!html.includes(String(u.yasam_sf)) || !html.includes(String(u.balkon_sf))) {
      eksik.push(`ünite ${u.no} ölçüleri`);
    }
  }
  for (const f of veri.unite_tipleri_fiyat) {
    if (!html.includes(f.fiyat)) eksik.push(`fiyat ${f.fiyat}`);
  }
  for (const anahtar of Object.keys(veri)) {
    if (!/^amenite_level_\d+$/.test(anahtar)) continue;
    for (const madde of veri[anahtar].liste) {
      if (!metin.includes(madde)) eksik.push(`amenite "${madde}"`);
    }
  }
  for (const [alan, deger] of Object.entries(veri.broker_bilgisi)) {
    if (!metin.includes(deger)) eksik.push(`broker.${alan} ("${deger}")`);
  }
  for (const kaynak of veri.kaynaklar) {
    if (!metin.includes(kaynak)) eksik.push(`kaynak "${kaynak.slice(0, 40)}…"`);
  }
  for (const grup of Object.values(veri.kat_plani_gruplari)) {
    if (!metin.includes(grup)) eksik.push(`kat grubu "${grup}"`);
  }
  if (!metin.includes(veri.yasal.developer_disclaimer)) {
    eksik.push('geliştirici yasal metni (birebir)');
  }
  if (!metin.includes(veri.fiyat_araligi_ozet)) eksik.push('fiyat aralığı özeti');
  if (!metin.includes(veri.teslim_tahmini)) eksik.push('teslim tahmini');
  if (!metin.includes(veri.durum)) eksik.push('durum');
  if (!metin.includes(veri.gelistirici)) eksik.push('geliştirici');
  if (!metin.includes(veri.mimar)) eksik.push('mimar');
  if (!metin.includes(veri.hoa)) eksik.push('HOA (ham değer)');

  kontrol(
    `${etiket} 4. Eksiksizlik: verideki tüm olgular sayfada`,
    eksik.length === 0,
    eksik.join(', ')
  );

  /* --- 5. KAYNAK SAFLIĞI ---------------------------------------------------- */
  const kaynaklar = kaynakDosyalari(KAYNAK_DIZINI);
  const yasakliDizeler = [
    veri.ad,
    veri.marka,
    veri.gelistirici,
    veri.mimar,
    veri.adres,
    veri.teslim_tahmini,
    veri.hoa,
    veri.fiyat_araligi_ozet,
    veri.broker_bilgisi.lisans,
    veri.broker_bilgisi.telefon,
    veri.broker_bilgisi.adres,
    veri.broker_bilgisi.broker,
    ...veri.unite_tipleri_fiyat.map((f) => f.fiyat),
    ...veri.depozito_yapisi,
  ];
  // 3+ haneli olgu sayıları (2 haneliler CSS değerleriyle çakışır)
  const yasakliSayilar = [
    ...new Set(
      [
        veri.toplam_unite,
        ...veri.ornek_unite_listesi.flatMap((u) => [u.yasam_sf, u.balkon_sf]),
      ]
        .map(String)
        .filter((s) => s.length >= 3)
    ),
  ];

  const sizintilar = [];
  for (const dosya of kaynaklar) {
    // Yorumlar kullanıcıya render EDİLMEZ; taramadan çıkarılır. Renk
    // literalleri de (#152a21, oklch(...)) sayı sınırıyla elenir.
    const icerik = fs
      .readFileSync(dosya, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
    const goreli = path.relative(KOK, dosya);
    for (const dize of yasakliDizeler) {
      if (dize && icerik.includes(dize)) {
        sizintilar.push(`${goreli}: "${dize.slice(0, 40)}"`);
      }
    }
    for (const sayi of yasakliSayilar) {
      if (new RegExp(`(?<![\\w.])${sayi}(?![\\w.])`).test(icerik)) {
        sizintilar.push(`${goreli}: ${sayi}`);
      }
    }
  }
  kontrol(
    `${etiket} 5. Kaynak saflığı: olgu değerleri JSX'e elle yazılmamış`,
    sizintilar.length === 0,
    sizintilar.join(', ')
  );

  /* --- 6. GÖRSEL DÜRÜSTLÜĞÜ ------------------------------------------------- */
  // Yalnızca MARKA kelime işareti. `blanc` koyu zeminde, `ink` açık zeminde.
  // (`cream` varyantı krem tasfiyesinde emekliye ayrıldı — dosya marka arşivi
  // olarak public/ içinde duruyor ama sayfaya artık girmiyor, o yüzden burada
  // da izinli DEĞİL: geri sızarsa bu kapı haber verir.)
  const IZINLI_GORSELLER = [
    '/miamili-wordmark-blanc.png',
    '/miamili-wordmark-ink.png',
  ];
  const imgKaynaklari = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)].map(
    (m) => m[1]
  );
  const izinsizGorseller = imgKaynaklari.filter(
    (src) =>
      !IZINLI_GORSELLER.some((izin) => decodeURIComponent(src).includes(izin))
  );
  kontrol(
    `${etiket} 6. Görsel dürüstlüğü: marka logosu dışında raster görsel yok`,
    izinsizGorseller.length === 0,
    izinsizGorseller.join(', ')
  );

  const arkaPlanGorselleri = [
    ...html.matchAll(/background-image:\s*url\(([^)]+)\)/gi),
  ].map((m) => m[1]);
  kontrol(
    `${etiket} 6b. CSS background-image ile gizli görsel yok`,
    arkaPlanGorselleri.length === 0,
    arkaPlanGorselleri.join(', ')
  );

  // Kanonik/og:url kendi adresimizdir — YÜKLENEN kaynak değildir, hariç.
  // Aranan şey tarayıcının fetch ettiği üçüncü parti varlıklar.
  const yuklenenler = [
    ...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi),
    ...html.matchAll(/<iframe\b[^>]*\bsrc="([^"]+)"/gi),
    ...html.matchAll(/<link\b[^>]*\brel="(?:stylesheet|preload|preconnect)"[^>]*\bhref="([^"]+)"/gi),
    ...html.matchAll(/<link\b[^>]*\bhref="([^"]+)"[^>]*\brel="(?:stylesheet|preload|preconnect)"/gi),
  ].map((m) => m[1]);
  const ucuncuParti = yuklenenler.filter((u) => /^(https?:)?\/\//i.test(u));
  kontrol(
    `${etiket} 6c. Üçüncü parti script/iframe/stylesheet yüklenmiyor`,
    ucuncuParti.length === 0,
    [...new Set(ucuncuParti)].join(', ')
  );

  /* --- 7. TOKEN BÜTÜNLÜĞÜ --------------------------------------------------- */
  kontrol(
    `${etiket} 7. Token bütünlüğü: sayfada çözülmemiş {{...}} yok`,
    !/\{\{\w+\}\}/.test(html),
    (html.match(/\{\{\w+\}\}/g) ?? []).join(', ')
  );
}

/* ========================================================================== */

console.log('');
for (const g of gecenler) console.log(`  \x1b[32m✓\x1b[0m ${g}`);
if (hatalar.length > 0) {
  console.log('');
  for (const h of hatalar) console.log(`  \x1b[31m✗\x1b[0m ${h}`);
}
console.log('');
console.log(
  hatalar.length === 0
    ? `\x1b[32m${gecenler.length} kontrolün tamamı geçti.\x1b[0m`
    : `\x1b[31m${hatalar.length} kontrol BAŞARISIZ\x1b[0m (${gecenler.length} geçti).`
);
console.log('');

process.exit(hatalar.length === 0 ? 0 : 1);
