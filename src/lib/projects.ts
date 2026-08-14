import fs from 'node:fs';
import path from 'node:path';

import { buildProjectView, type ProjectData, type ProjectView } from './project';

/**
 * ŞABLON GİRİŞ NOKTASI
 *
 * `data/` içine yeni bir `<slug>.json` bırakmak yeni bir proje sayfası üretir.
 * Kod değişikliği gerekmez: route, sitemap, metadata ve JSON-LD hepsi buradan
 * türer. Dosya adı slug ile eşleşmek ZORUNDA (kontrol ediliyor) — aksi halde
 * yayına çıkan URL ile veri arasında sessiz bir kayma olurdu.
 */

const VERI_DIZINI = path.join(process.cwd(), 'data');

let onbellek: ProjectView[] | null = null;

function okuVeriDosyalari(): ProjectView[] {
  const dosyalar = fs
    .readdirSync(VERI_DIZINI)
    .filter((d) => d.endsWith('.json'))
    .sort();

  if (dosyalar.length === 0) {
    throw new Error('data/ dizininde hiç proje JSON dosyası yok.');
  }

  return dosyalar.map((dosya) => {
    const tamYol = path.join(VERI_DIZINI, dosya);
    const ham = JSON.parse(fs.readFileSync(tamYol, 'utf8')) as ProjectData;
    const beklenenSlug = dosya.replace(/\.json$/, '');

    if (ham.slug !== beklenenSlug) {
      throw new Error(
        `${dosya}: slug alanı ("${ham.slug}") dosya adıyla ("${beklenenSlug}") eşleşmiyor.`
      );
    }

    return buildProjectView(ham);
  });
}

export function tumProjeler(): ProjectView[] {
  onbellek ??= okuVeriDosyalari();
  return onbellek;
}

export function projeBul(slug: string): ProjectView | undefined {
  return tumProjeler().find((p) => p.slug === slug);
}

/**
 * Kök URL'in yönlendirileceği proje. Tek projeli bir dağıtımda bu tek proje
 * demektir; birden fazla proje varsa alfabetik ilk dosya. Farklı bir "flagship"
 * istenirse burayı değiştir — başka hiçbir yerde slug sabiti yok.
 */
export function birincilProje(): ProjectView {
  const ilk = tumProjeler()[0];
  if (!ilk) throw new Error('Hiç proje yüklenemedi.');
  return ilk;
}
