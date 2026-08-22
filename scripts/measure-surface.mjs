#!/usr/bin/env node
/**
 * YÜZEY ÖLÇÜMÜ — `npm run shots`
 *
 * Ekran görüntüsü alır VE sayfadaki gerçek `background-color` değerlerini
 * tarayıcıdan OKUR. "Gözle baktım, bej değil" demenin yerine geçer: bir zemin
 * bej bandındaysa bunu sRGB aritmetiğiyle söyler.
 *
 * Bağımlılık YOK. Chrome DevTools Protocol'ü doğrudan konuşur; Node 20'de
 * WebSocket bayrak arkasında olduğu için npm script `--experimental-websocket`
 * ile çağırır. (Playwright/Puppeteer kurmak 100 MB+ tarayıcı indirir; burada
 * sistemdeki Chrome yeterli.)
 *
 * Kullanım:
 *   node --experimental-websocket scripts/measure-surface.mjs \
 *        --url http://localhost:3000/... --out .shots/after --widths 393,1280
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { sicakNotrMu, hexten, rgbAyristir } from './lib/warm.mjs';

const CHROME =
  process.env.CHROME_BIN ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/* ---------------------------------------------------------------- argümanlar */

function arg(ad, varsayilan = null) {
  const i = process.argv.indexOf(`--${ad}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : varsayilan;
}
const HEDEF = arg('url', 'http://localhost:3000/palm-tree-residences-miami');
const CIKTI = path.resolve(arg('out', '.shots'));
const GENISLIKLER = arg('widths', '393,1280')
  .split(',')
  .map((s) => Number(s.trim()))
  .filter(Boolean);
const TAM_SAYFA = process.argv.includes('--full');

/* -------------------------------------------------------------------- CDP */

class Cdp {
  #ws;
  #sonId = 0;
  #bekleyen = new Map();
  #dinleyiciler = new Map();

  static async ac(url) {
    const c = new Cdp();
    await c.#bagla(url);
    return c;
  }

  #bagla(url) {
    return new Promise((coz, red) => {
      this.#ws = new WebSocket(url);
      this.#ws.onopen = () => coz();
      this.#ws.onerror = (e) => red(new Error(`WS hata: ${e.message ?? e.type}`));
      this.#ws.onmessage = (olay) => {
        const m = JSON.parse(olay.data);
        if (m.id !== undefined) {
          const b = this.#bekleyen.get(m.id);
          if (!b) return;
          this.#bekleyen.delete(m.id);
          m.error ? b.red(new Error(`${m.error.message} (${b.metot})`)) : b.coz(m.result);
        } else if (m.method) {
          (this.#dinleyiciler.get(m.method) ?? []).forEach((fn) => fn(m.params));
        }
      };
    });
  }

  gonder(metot, params = {}, sessionId) {
    const id = ++this.#sonId;
    return new Promise((coz, red) => {
      this.#bekleyen.set(id, { coz, red, metot });
      this.#ws.send(JSON.stringify({ id, method: metot, params, sessionId }));
    });
  }

  bir(metot) {
    return new Promise((coz) => {
      const liste = this.#dinleyiciler.get(metot) ?? [];
      const fn = (p) => {
        this.#dinleyiciler.set(
          metot,
          (this.#dinleyiciler.get(metot) ?? []).filter((x) => x !== fn)
        );
        coz(p);
      };
      liste.push(fn);
      this.#dinleyiciler.set(metot, liste);
    });
  }

  kapat() {
    this.#ws.close();
  }
}

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

async function chromeBaslat() {
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'miamili-chrome-'));
  const cocuk = spawn(
    CHROME,
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profil}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-color-profile=srgb',
      '--disable-lcd-text',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  const portDosyasi = path.join(profil, 'DevToolsActivePort');
  for (let i = 0; i < 100; i++) {
    if (fs.existsSync(portDosyasi)) {
      const [port] = fs.readFileSync(portDosyasi, 'utf8').split('\n');
      if (port) {
        const v = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json());
        return { cocuk, profil, wsUrl: v.webSocketDebuggerUrl };
      }
    }
    await bekle(100);
  }
  cocuk.kill();
  throw new Error('Chrome DevTools portu açılmadı.');
}

/* -------------------------------------------- sayfada çalışan ölçüm ifadesi */

/**
 * Sayfadaki GÖRÜNÜR zeminleri toplar. `getComputedStyle` kullanır — yani CSS
 * değişkeni, color-mix, kalıtım hepsi çözülmüş HALİYLE okunur. Kaynak koda
 * değil, tarayıcının gerçekten boyadığı piksele bakar.
 */
const OLCUM_IFADESI = `(() => {
  const gorulen = new Map();
  const ekle = (renk, el, alan) => {
    if (!renk || renk === 'rgba(0, 0, 0, 0)' || renk === 'transparent') return;
    const k = renk;
    const v = gorulen.get(k) ?? { renk, alan: 0, ornek: null, adet: 0 };
    v.alan += alan;
    v.adet += 1;
    if (!v.ornek) {
      v.ornek = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
        (el.className && typeof el.className === 'string' && el.className.trim()
          ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.')
          : '');
    }
    gorulen.set(k, v);
  };

  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    const alan = Math.max(0, r.width) * Math.max(0, r.height);
    if (alan < 400) continue;
    ekle(getComputedStyle(el).backgroundColor, el, alan);
  }

  const govde = getComputedStyle(document.body);
  const html = getComputedStyle(document.documentElement);

  const kok = document.documentElement;

  return {
    body: govde.backgroundColor,
    html: html.backgroundColor,
    // Bu depoda YATAY TAŞMA tekrar eden bir hata sınıfı (aspect-ratio +
    // min-height birlikte kutu genişliğini yükseklikten hesaplıyordu).
    // Gözle bakmak yerine ölçülür.
    yatayTasma: kok.scrollWidth - kok.clientWidth,
    bolumler: [...document.querySelectorAll('main > section, header, footer')].map((s) => ({
      ad: s.id || s.tagName.toLowerCase(),
      zemin: getComputedStyle(s).backgroundColor,
      yukseklik: Math.round(s.getBoundingClientRect().height),
    })),
    zeminler: [...gorulen.values()]
      .sort((a, b) => b.alan - a.alan)
      .slice(0, 24)
      .map((v) => ({ renk: v.renk, ornek: v.ornek, adet: v.adet, alan: Math.round(v.alan) })),
  };
})()`;

/* ------------------------------------------------------------------- akış */

const { cocuk, profil, wsUrl } = await chromeBaslat();
fs.mkdirSync(CIKTI, { recursive: true });

let cdp;
const rapor = { url: HEDEF, olcumler: [] };

try {
  cdp = await Cdp.ac(wsUrl);
  const { targetId } = await cdp.gonder('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.gonder('Target.attachToTarget', {
    targetId,
    flatten: true,
  });

  await cdp.gonder('Page.enable', {}, sessionId);
  await cdp.gonder('Runtime.enable', {}, sessionId);

  for (const genislik of GENISLIKLER) {
    const mobil = genislik < 700;
    await cdp.gonder(
      'Emulation.setDeviceMetricsOverride',
      {
        width: genislik,
        height: mobil ? 852 : 900,
        deviceScaleFactor: 2,
        mobile: mobil,
      },
      sessionId
    );

    const yuklendi = cdp.bir('Page.loadEventFired');
    await cdp.gonder('Page.navigate', { url: HEDEF }, sessionId);
    await yuklendi;

    // Fontlar yerleşmeden ekran görüntüsü almak yanıltıcı olur (FOUT yakalar).
    await cdp.gonder(
      'Runtime.evaluate',
      { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true },
      sessionId
    );
    // `.rise` giriş animasyonu 0.85s; bitmeden kare almak opacity:0 yakalar.
    await bekle(1200);

    // TAM SAYFA çekiminde önce sayfayı baştan sona TARA. `next/image`
    // varsayılan olarak lazy yükler; görüntü alanı hiç oraya inmediğinde
    // katlamanın altındaki görseller YÜKLENMEZ ve tam-sayfa karesi onları
    // eksik gösterir — sitede olmayan bir hata gibi görünür. (Footer'daki
    // marka kelime işareti tam olarak böyle "kayboldu".)
    if (TAM_SAYFA) {
      await cdp.gonder(
        'Runtime.evaluate',
        {
          expression: `(async () => {
            const adim = Math.max(200, window.innerHeight);
            const son = document.documentElement.scrollHeight;
            // Sınırlı döngü: hiçbir koşulda asılı kalmaz. (İlk sürüm
            // img.decode() bekliyordu; hiç istenmemiş bir lazy görselde
            // decode() HİÇ çözülmüyor ve script sonsuza kadar bekliyor.)
            for (let y = 0; y <= son && y < 200000; y += adim) {
              window.scrollTo({ top: y, behavior: 'instant' });
              await new Promise((r) => setTimeout(r, 90));
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
            await new Promise((r) => setTimeout(r, 600));
            const g = [...document.images];
            return g.filter((im) => im.complete && im.naturalWidth > 0).length + '/' + g.length;
          })()`,
          awaitPromise: true,
          returnByValue: true,
        },
        sessionId
      );
    }

    const { result } = await cdp.gonder(
      'Runtime.evaluate',
      { expression: OLCUM_IFADESI, returnByValue: true },
      sessionId
    );
    rapor.olcumler.push({ genislik, ...result.value });

    const { cssContentSize } = await cdp.gonder('Page.getLayoutMetrics', {}, sessionId);
    const kare = TAM_SAYFA
      ? {
          x: 0,
          y: 0,
          width: cssContentSize.width,
          height: Math.min(cssContentSize.height, 30000),
          scale: 1,
        }
      : { x: 0, y: 0, width: genislik, height: mobil ? 852 : 900, scale: 1 };

    const { data } = await cdp.gonder(
      'Page.captureScreenshot',
      { format: 'png', clip: kare, captureBeyondViewport: TAM_SAYFA },
      sessionId
    );
    const dosya = path.join(CIKTI, `${genislik}${TAM_SAYFA ? '-full' : ''}.png`);
    fs.writeFileSync(dosya, Buffer.from(data, 'base64'));
    console.log(`  ✓ ${path.relative(process.cwd(), dosya)}  (${genislik}px)`);
  }
} finally {
  cdp?.kapat();
  cocuk.kill();
  // Chrome profil dizinine hâlâ yazıyor olabilir: çıkışını BEKLEMEDEN silmek
  // ENOTEMPTY ile patlar ve ölçüm raporunu yutar. Temizlik hiçbir koşulda
  // sonucu gölgelemesin diye hem beklenir hem yutulur.
  await Promise.race([
    new Promise((coz) => cocuk.once('exit', coz)),
    bekle(3000),
  ]);
  try {
    fs.rmSync(profil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    /* geçici profil; silinemezse işletim sistemi temizler */
  }
}

/* ------------------------------------------------------------------ rapor */

let bejBulundu = false;

for (const olcum of rapor.olcumler) {
  console.log(`\n── ${olcum.genislik}px ──────────────────────────────`);
  const govde = rgbAyristir(olcum.body);
  const govdeBej = govde ? sicakNotrMu(govde) : false;
  bejBulundu ||= govdeBej;
  console.log(
    `  body background-color : ${olcum.body}  ${govdeBej ? '❌ SICAK-NÖTR (bej bandı)' : '✓ bej bandında DEĞİL'}`
  );
  console.log(
    `  yatay taşma           : ${olcum.yatayTasma}px  ${olcum.yatayTasma > 0 ? '❌ SAYFA YANA KAYIYOR' : '✓ yok'}`
  );
  if (olcum.yatayTasma > 0) bejBulundu = true;

  console.log('  bölüm zeminleri:');
  for (const b of olcum.bolumler) {
    const r = rgbAyristir(b.zemin);
    const bej = r ? sicakNotrMu(r) : false;
    bejBulundu ||= bej;
    console.log(
      `    ${b.ad.padEnd(18)} ${String(b.zemin).padEnd(22)} ${String(b.yukseklik).padStart(6)}px  ${bej ? '❌ BEJ' : '·'}`
    );
  }

  const bejZeminler = olcum.zeminler.filter((z) => {
    const r = rgbAyristir(z.renk);
    return r && sicakNotrMu(r);
  });
  if (bejZeminler.length) {
    bejBulundu = true;
    console.log('  ❌ sıcak-nötr zemin boyayan öğeler:');
    bejZeminler.forEach((z) => console.log(`    ${z.renk}  ${z.ornek}  (${z.adet}×)`));
  } else {
    console.log('  ✓ 400px²+ boyanan hiçbir zemin sıcak-nötr bandında değil');
  }
}

fs.writeFileSync(path.join(CIKTI, 'olcum.json'), JSON.stringify(rapor, null, 2));
console.log(`\n  rapor: ${path.relative(process.cwd(), path.join(CIKTI, 'olcum.json'))}`);
console.log(bejBulundu ? '\n❌ Bej/krem zemin ÖLÇÜLDÜ.' : '\n✓ Bej/krem zemin YOK.');
process.exit(bejBulundu ? 1 : 0);
