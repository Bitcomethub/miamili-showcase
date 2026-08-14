import type { ReactNode } from 'react';

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
 * Etiket rengi zemine göre DEĞİŞMEK ZORUNDA — açık zeminde marka altını
 * (#B19565) 2.53:1 ile WCAG'den kalıyor, o yüzden açık zeminde gold-deep.
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
        style={{ color: koyu ? 'var(--color-gold-lift)' : 'var(--color-gold-deep)' }}
      >
        {etiket}
      </p>
      <h2
        id={id}
        className="mt-5"
        style={{
          fontSize: 'var(--step-h2)',
          color: koyu ? 'var(--color-cream)' : 'var(--color-ink)',
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
            color: koyu ? 'var(--color-mist)' : 'var(--color-warm)',
          }}
        >
          {aciklama}
        </p>
      )}
    </header>
  );
}
