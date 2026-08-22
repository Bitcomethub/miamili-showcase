import { saydam } from '@/lib/color';

type Vurgu = { kat: number; etiket: string };

type Props = {
  katSayisi: number;
  /** Etiketlenecek katlar (amenite katları) */
  vurgular?: Vurgu[];
  /** Seçili kat grubunun katları — daha parlak çizilir */
  aktifKatlar?: number[];
  ton?: 'dark' | 'light';
  /** Satır yüksekliği (px). Yoğun yerlerde küçült. */
  satirYuksekligi?: number;
  ariaEtiketi: string;
};

/**
 * ŞEMATİK KAT DİYAGRAMI — mimari render DEĞİLDİR.
 *
 * Elimizde projenin gerçek görseli yok ve uydurma görsel yasak. Bu bileşen
 * boşluğu stok görselle doldurmak yerine, ELDEKİ VERİYİ çiziyor:
 *   - çizgi sayısı  = data.kat_sayisi
 *   - altın çizgiler = data.amenite_level_* anahtarlarındaki katlar
 *   - parlak çizgiler = seçili kat grubunun katları (kat_plani_gruplari)
 * Binanın nasıl göründüğüne dair hiçbir iddiada bulunmaz; yalnızca kaç kat
 * olduğunu ve hangi katın ne olduğunu gösterir. Soyut kalması KASITLI.
 */
export function FloorStack({
  katSayisi,
  vurgular = [],
  aktifKatlar = [],
  ton = 'dark',
  satirYuksekligi = 9,
  ariaEtiketi,
}: Props) {
  const koyu = ton === 'dark';
  const vurguHaritasi = new Map(vurgular.map((v) => [v.kat, v.etiket]));
  const aktifKume = new Set(aktifKatlar);

  // En üst kattan zemine doğru — bir binanın okunma yönü
  const katlar = Array.from({ length: katSayisi }, (_, i) => katSayisi - i);

  const renkler = koyu
    ? {
        pasif: saydam('--color-blanc', 15),
        aktif: saydam('--color-blanc', 62),
        vurgu: 'var(--color-gold)',
        sayi: 'var(--color-mist-dim)',
        etiketRengi: 'var(--color-gold-lift)',
      }
    : {
        pasif: saydam('--color-ink', 13),
        aktif: saydam('--color-ink', 72),
        vurgu: 'var(--color-gold)',
        sayi: 'var(--color-moss)',
        etiketRengi: 'var(--color-ink)',
      };

  return (
    <div
      role="img"
      aria-label={ariaEtiketi}
      className="grid w-full items-center"
      style={{
        gridTemplateColumns: 'minmax(1.75rem, auto) minmax(2rem, 1fr) auto',
        columnGap: '0.75rem',
      }}
    >
      {katlar.map((kat) => {
        const etiket = vurguHaritasi.get(kat);
        const aktif = aktifKume.has(kat);
        const zemin = kat === 1;
        const sayiGoster = Boolean(etiket) || zemin;

        const kalinlik = etiket ? 3 : aktif ? 2 : 1;
        const renk = etiket ? renkler.vurgu : aktif ? renkler.aktif : renkler.pasif;

        return (
          <div key={kat} className="contents">
            <span
              aria-hidden="true"
              className="figure text-right tabular-nums"
              style={{
                fontSize: 10,
                lineHeight: `${satirYuksekligi}px`,
                letterSpacing: '0.06em',
                color: renkler.sayi,
                opacity: sayiGoster ? 1 : 0,
              }}
            >
              {String(kat).padStart(2, '0')}
            </span>

            <span
              aria-hidden="true"
              className="block w-full transition-all duration-500"
              style={{
                height: kalinlik,
                backgroundColor: renk,
                marginBlock: (satirYuksekligi - kalinlik) / 2,
                transitionTimingFunction: 'var(--ease-out-quart)',
              }}
            />

            <span
              aria-hidden="true"
              className="whitespace-nowrap"
              style={{
                fontSize: 10,
                lineHeight: `${satirYuksekligi}px`,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: renkler.etiketRengi,
                opacity: etiket ? 1 : 0,
              }}
            >
              {etiket ?? ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
