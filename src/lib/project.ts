/**
 * Proje veri şeması + türetme katmanı.
 *
 * ŞABLON KURALI: Sayfada görünen HER olgusal sayı bu dosyadan geçer.
 * Bileşenlerde sayı literali yasaktır — scripts/verify-data.mjs kaynak ağacını
 * tarayıp bunu programatik olarak zorlar. Yeni bir sayı göstermen gerekiyorsa
 * önce veri dosyasına ekle, sonra burada türet.
 */

export type UniteTipiFiyat = { tip: string; fiyat: string };

export type OrnekUnite = {
  no: string;
  tip: string;
  yasam_sf: number;
  balkon_sf: number;
};

export type AmeniteKati = { baslik: string; liste: string[] };

/** Galeri sekmesi. `gorseller` boşsa ekranda dürüst bir bekleme durumu çizilir. */
export type GaleriSekmesi = { id: string; etiket: string; gorseller: string[] };

export type BrokerBilgisi = {
  sunan: string;
  broker: string;
  adres: string;
  lisans: string;
  telefon: string;
};

export type ProjectData = {
  slug: string;
  ad: string;
  marka: string;
  gelistirici: string;
  mimar: string;
  adres: string;
  kat_sayisi: number;
  toplam_unite: number;
  teslim_tahmini: string;
  hoa: string;
  durum: string;
  depozito_yapisi: string[];
  fiyat_araligi_ozet: string;
  unite_tipleri_fiyat: UniteTipiFiyat[];
  ornek_unite_listesi: OrnekUnite[];
  kat_plani_gruplari: Record<string, string>;
  broker_bilgisi: BrokerBilgisi;
  kaynaklar: string[];
  sunum: {
    kisa_ad: string;
    alt_ad: string;
    hero_alt_baslik: string;
    ozet_baslik: string;
    ozet_paragraf: string;
    ozet_alinti: string;
    galeri_aciklama: string;
    kat_plani_aciklama: string;
    yatirim_aciklama: string;
  };
  medya: {
    hero_gorseli: string | null;
    tanitim_videosu: string | null;
    galeri: GaleriSekmesi[];
    kat_plani_gorselleri: Record<string, string>;
    manzaralar: string[];
  };
  yasal: {
    illustratif_uyari: string;
    developer_disclaimer: string;
  };
  /** `amenite_level_NN` anahtarlarından türetilir — bkz. normalizeAmeniteKatlari */
  [key: string]: unknown;
};

/* -------------------------------------------------------------------------- */
/* Türetmeler — hepsi mekanik. Hiçbiri tahmin/yuvarlama yapmaz.               */
/* -------------------------------------------------------------------------- */

export type Odeme = {
  yuzde: number;
  etiket: string;
  /** true ise rakam kaynakta yazmıyor, aritmetikle bulundu (100 − peşinat) */
  turetilmis: boolean;
};

/** "%NN <olay>" -> { yuzde: NN, etiket: "<Olay>" } */
export function parseOdemePlani(depozito: string[]): {
  kalemler: Odeme[];
  pesinatToplam: number;
  kalanBakiye: number;
} {
  const kalemler: Odeme[] = depozito.map((satir) => {
    const eslesme = /^%(\d+(?:[.,]\d+)?)\s+(.+)$/.exec(satir.trim());
    if (!eslesme || !eslesme[1] || !eslesme[2]) {
      throw new Error(
        `depozito_yapisi satırı "%<sayı> <etiket>" biçiminde değil: "${satir}"`
      );
    }
    return {
      yuzde: Number(eslesme[1].replace(',', '.')),
      etiket: buyukHarfeBasla(eslesme[2]),
      turetilmis: false,
    };
  });

  const pesinatToplam = kalemler.reduce((t, k) => t + k.yuzde, 0);
  const kalanBakiye = 100 - pesinatToplam;

  if (kalanBakiye > 0) {
    kalemler.push({
      yuzde: kalanBakiye,
      etiket: 'Kalan bakiye · teslimde',
      turetilmis: true,
    });
  }

  return { kalemler, pesinatToplam, kalanBakiye };
}

/** Türkçe-güvenli baş harf büyütme (i -> İ). */
export function buyukHarfeBasla(metin: string): string {
  if (!metin) return metin;
  return metin.charAt(0).toLocaleUpperCase('tr-TR') + metin.slice(1);
}

/**
 * "1 Yatak + Den · 1 Banyo" -> { konfigurasyon: "1 Yatak + Den", banyo: "1 Banyo" }
 * Ayırıcı kaynakta zaten var; çeviri/kısaltma YAPILMAZ.
 */
export function parseUniteTipi(tip: string): {
  konfigurasyon: string;
  banyo: string | null;
} {
  const parcalar = tip.split('·').map((p) => p.trim());
  return {
    konfigurasyon: parcalar[0] ?? tip,
    banyo: parcalar[1] ?? null,
  };
}

/** Adres parantezindeki bölge: "… (Park West / Downtown Miami)" -> "Park West / Downtown Miami" */
export function parseBolge(adres: string): string | null {
  const eslesme = /\(([^)]+)\)\s*$/.exec(adres.trim());
  return eslesme?.[1]?.trim() ?? null;
}

/** Adresin parantezsiz sokak kısmı. */
export function parseSokakAdresi(adres: string): string {
  return adres.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/** "$N.NN/SQ FT" -> "$N,NN" (Türkçe ondalık ayırıcı) */
export function hoaTurkce(hoa: string): string {
  const eslesme = /([\d]+(?:\.\d+)?)/.exec(hoa);
  if (!eslesme?.[1]) return hoa;
  return `$${Number(eslesme[1]).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
  })}`;
}

/** `amenite_level_09` gibi anahtarları sıralı bir diziye çevirir. */
export function normalizeAmeniteKatlari(
  data: Record<string, unknown>
): Array<{ kat: number; baslik: string; liste: string[] }> {
  return Object.entries(data)
    .flatMap(([anahtar, deger]) => {
      const eslesme = /^amenite_level_(\d+)$/.exec(anahtar);
      if (!eslesme?.[1]) return [];
      const kat = Number(eslesme[1]);
      const icerik = deger as AmeniteKati;
      return [{ kat, baslik: icerik.baslik, liste: icerik.liste }];
    })
    .sort((a, b) => a.kat - b.kat);
}

/** `kat_plani_gruplari` nesnesini sıralı diziye çevirir (grup sayısı serbest). */
export function normalizeKatGruplari(
  gruplar: Record<string, string>
): Array<{ id: string; etiket: string }> {
  return Object.entries(gruplar).map(([id, etiket]) => ({ id, etiket }));
}

/** "Kat 10 / 16 / 21 / 26 / 31" ve "Kat 11-12, 14-15" -> [10,16,21,26,31] / [11,12,14,15] */
export function parseKatNumaralari(etiket: string): number[] {
  const katlar = new Set<number>();
  const govde = etiket.replace(/^\s*Kat\s*/i, '');
  for (const parca of govde.split(/[,/]/)) {
    const aralik = /^\s*(\d+)\s*[-–]\s*(\d+)\s*$/.exec(parca);
    if (aralik?.[1] && aralik[2]) {
      const bas = Number(aralik[1]);
      const son = Number(aralik[2]);
      for (let k = bas; k <= son; k++) katlar.add(k);
      continue;
    }
    const tek = /^\s*(\d+)\s*$/.exec(parca);
    if (tek?.[1]) katlar.add(Number(tek[1]));
  }
  return [...katlar].sort((a, b) => a - b);
}

/**
 * Ünite tipi -> fiyat aralığı eşlemesi.
 * TAM eşleşme aranır. Eşleşme yoksa null döner ve ekranda fiyat ÇİZİLMEZ —
 * yaklaşık eşleştirme/tahmin yapılmaz.
 */
export function fiyatAraligiBul(
  tip: string,
  tablo: UniteTipiFiyat[]
): string | null {
  return tablo.find((satir) => satir.tip === tip)?.fiyat ?? null;
}

/** "ön-satış (temel atımı henüz olmadı, Nisan 2027 planlanan)" -> "ön-satışta" öncesi kısım */
export function parseDurumKisa(durum: string): string {
  return durum.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/** Çok ortaklı geliştirici dizesinden ilk ortağın kısa adı: "PMG" */
export function kisaAd(tamAd: string): string {
  const ilk = tamAd.split(/\s*\+\s*/)[0] ?? tamAd;
  const parantezsiz = ilk.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  return parantezsiz;
}

/* -------------------------------------------------------------------------- */
/* Şablon token'ları — editoryal metinlerdeki {{...}} olgu alanlarından dolar  */
/* -------------------------------------------------------------------------- */

export function tokenSozlugu(p: ProjectData): Record<string, string> {
  return {
    ad: p.ad,
    marka: p.marka,
    gelistirici: p.gelistirici,
    gelistirici_kisa: kisaAd(p.gelistirici),
    mimar: p.mimar,
    mimar_kisa: kisaAd(p.mimar),
    adres: p.adres,
    adres_sokak: parseSokakAdresi(p.adres),
    bolge: parseBolge(p.adres) ?? '',
    kat_sayisi: String(p.kat_sayisi),
    toplam_unite: String(p.toplam_unite),
    teslim_tahmini: p.teslim_tahmini,
    durum: p.durum,
    durum_kisa: parseDurumKisa(p.durum),
    hoa: p.hoa,
    hoa_tr: hoaTurkce(p.hoa),
    fiyat_araligi_ozet: p.fiyat_araligi_ozet,
  };
}

/**
 * "{{kat_sayisi}} katlı" -> "37 katlı".
 * Bilinmeyen token BIRAKILMAZ, hata fırlatır — sayfada ham {{...}} görünmesi
 * sessiz bir içerik hatası olurdu.
 */
export function doldur(sablon: string, sozluk: Record<string, string>): string {
  return sablon.replace(/\{\{(\w+)\}\}/g, (_esles, anahtar: string) => {
    const deger = sozluk[anahtar];
    if (deger === undefined) {
      throw new Error(`Bilinmeyen şablon token'ı: {{${anahtar}}}`);
    }
    return deger;
  });
}

/* -------------------------------------------------------------------------- */
/* Sunuma hazır görünüm modeli                                                */
/* -------------------------------------------------------------------------- */

export type ProjectView = ReturnType<typeof buildProjectView>;

export function buildProjectView(p: ProjectData) {
  const sozluk = tokenSozlugu(p);
  const odeme = parseOdemePlani(p.depozito_yapisi);
  const ameniteKatlari = normalizeAmeniteKatlari(p);
  const katGruplari = normalizeKatGruplari(p.kat_plani_gruplari).map((g) => ({
    ...g,
    katlar: parseKatNumaralari(g.etiket),
  }));

  const uniteler = p.ornek_unite_listesi.map((u) => {
    const { konfigurasyon, banyo } = parseUniteTipi(u.tip);
    return {
      ...u,
      konfigurasyon,
      banyo,
      fiyatAraligi: fiyatAraligiBul(u.tip, p.unite_tipleri_fiyat),
    };
  });

  return {
    slug: p.slug,
    ad: p.ad,
    marka: p.marka,
    gelistirici: p.gelistirici,
    mimar: p.mimar,
    adres: p.adres,
    adresSokak: parseSokakAdresi(p.adres),
    bolge: parseBolge(p.adres),
    katSayisi: p.kat_sayisi,
    toplamUnite: p.toplam_unite,
    teslimTahmini: p.teslim_tahmini,
    durum: p.durum,
    durumKisa: parseDurumKisa(p.durum),
    hoa: p.hoa,
    hoaTr: hoaTurkce(p.hoa),
    fiyatAraligiOzet: p.fiyat_araligi_ozet,
    uniteTipleriFiyat: p.unite_tipleri_fiyat,
    uniteler,
    katGruplari,
    ameniteKatlari,
    broker: p.broker_bilgisi,
    kaynaklar: p.kaynaklar,
    medya: p.medya,
    odeme,
    sunum: {
      kisaAd: p.sunum.kisa_ad,
      altAd: p.sunum.alt_ad,
      heroAltBaslik: doldur(p.sunum.hero_alt_baslik, sozluk),
      ozetBaslik: doldur(p.sunum.ozet_baslik, sozluk),
      ozetParagraf: doldur(p.sunum.ozet_paragraf, sozluk),
      ozetAlinti: doldur(p.sunum.ozet_alinti, sozluk),
      galeriAciklama: doldur(p.sunum.galeri_aciklama, sozluk),
      katPlaniAciklama: doldur(p.sunum.kat_plani_aciklama, sozluk),
      yatirimAciklama: doldur(p.sunum.yatirim_aciklama, sozluk),
    },
    yasal: {
      illustratifUyari: doldur(p.yasal.illustratif_uyari, sozluk),
      developerDisclaimer: p.yasal.developer_disclaimer,
    },
  };
}
