import type { CSSProperties, ReactNode } from 'react';

type Props = {
  etiket: string;
  baslik: ReactNode;
  aciklama?: string;
  /** koyu bölümlerde ton değişir */
  ton?: 'light' | 'dark';
  id?: string;
};

/**
 * Editoryal bölüm başlığı: altın saç teli + tracked etiket, ardından Bodoni H2.
 *
 * Etiket rengi zemine göre DEĞİŞMEK ZORUNDA. Açık zeminde altın METİN yasak —
 * #B19565 beyaz üstünde 2.85:1, #C9AE77 2.14:1, ikisi de AA'dan kalıyor. Bu
 * yüzden açık zeminde etiket `--color-moss` (7.31:1) ve altın vurgu METİNDEN
 * ÇİZGİYE taşınır; koyu zeminde `--color-gold-lift` (7.08:1) metin olarak kalır.
 */
export function SectionHeading({
  etiket,
  baslik,
  aciklama,
  ton = 'light',
  id,
}: Props) {
  const koyu = ton === 'dark';
  return (
    <header className="max-w-[46rem]">
      <p
        className="eyebrow"
        style={
          {
            color: koyu ? 'var(--color-gold-lift)' : 'var(--color-moss)',
            // Açık zeminde altın HARF yasak (2.85:1) ama altın ÇİZGİ serbest —
            // bölüm başlığının altın vurgusu bu yüzden metinden çizgiye taşındı.
            '--eyebrow-cizgi': koyu ? 'currentColor' : 'var(--color-gold)',
            '--eyebrow-cizgi-opaklik': koyu ? 0.55 : 1,
          } as CSSProperties
        }
      >
        {etiket}
      </p>
      <h2
        id={id}
        className="mt-5"
        style={{
          fontSize: 'var(--step-h2)',
          color: koyu ? 'var(--color-blanc)' : 'var(--color-ink)',
        }}
      >
        {baslik}
      </h2>
      {aciklama && (
        <p
          className="mt-5 max-w-[42rem]"
          style={{
            fontSize: 'var(--step-lead)',
            lineHeight: koyu ? 1.65 : 1.6,
            color: koyu ? 'var(--color-mist)' : 'var(--color-moss)',
          }}
        >
          {aciklama}
        </p>
      )}
    </header>
  );
}
