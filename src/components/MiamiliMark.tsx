import Image from 'next/image';

import { MARKA } from '@/lib/brand';

/**
 * MiamiLi kelime işareti. Gerçek marka varlığı kullanılır (özel display face —
 * elmas nokta, açık bacaklı M); font ile taklit EDİLMEZ.
 * Koyu ve açık zemin için iki ayrı renk varyantı vardır; CSS filtresiyle
 * renklendirme yapılmaz (filtre kenarları kirletiyor).
 *
 * `blanc` varyantı SAF BEYAZ'dır. Önceki `cream` varlığı düz krem dolguydu —
 * yani sayfadaki son krem pikseldi; alfa kanalı korunarak beyaza çevrildi.
 * Orijinal `miamili-wordmark-cream.png` marka arşivi olarak public/ içinde
 * duruyor, geri dönmek istenirse tek kelimelik değişiklik.
 */

const GENISLIKLER = {
  sm: { w: 96, h: 19 },
  md: { w: 132, h: 26 },
  lg: { w: 232, h: 46 },
} as const;

type Props = {
  /** 'ink' açık zeminde, 'blanc' koyu zeminde */
  ton: 'ink' | 'blanc';
  boyut?: keyof typeof GENISLIKLER;
  taglineGoster?: boolean;
  oncelikli?: boolean;
  /**
   * Adı zaten söylenen bir bağlamın İÇİNDE (ör. proje adını taşıyan başlık
   * bağlantısı) markayı dekoratif yapar. Aksi halde bağlantının erişilebilir
   * adı görünür metinle uyuşmaz — WCAG 2.5.3 "Label in Name" ihlali; axe bunu
   * `label-content-name-mismatch` olarak yakalıyor.
   */
  dekoratif?: boolean;
};

export function MiamiliMark({
  ton,
  boyut = 'md',
  taglineGoster = false,
  oncelikli = false,
  dekoratif = false,
}: Props) {
  const { w, h } = GENISLIKLER[boyut];
  return (
    <span className="inline-flex flex-col items-center gap-1.5">
      <Image
        src={`/miamili-wordmark-${ton}.png`}
        alt={dekoratif ? '' : MARKA.ad}
        width={w}
        height={h}
        priority={oncelikli}
        className="h-auto"
        style={{ width: w }}
      />
      {taglineGoster && (
        <span
          aria-hidden="true"
          className="font-[family-name:var(--font-display)] leading-none"
          style={{
            fontSize: Math.max(9, Math.round(w / 21)),
            letterSpacing: '0.3em',
            textIndent: '0.3em',
            color: ton === 'blanc' ? 'var(--color-mist)' : 'var(--color-moss)',
          }}
        >
          {MARKA.tagline}
        </span>
      )}
    </span>
  );
}
