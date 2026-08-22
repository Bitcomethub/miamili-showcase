import { whatsappLinki } from '@/lib/brand';
import { saydam } from '@/lib/color';

type Props = {
  baslik: string;
  aciklama: string;
  telefon: string;
  waMesaji: string;
  /** CSS aspect-ratio değeri, ör. '16 / 9' */
  oran?: string;
  ton?: 'light' | 'dark';
};

/**
 * DÜRÜST BEKLEME DURUMU.
 *
 * Bu proje için elimizde gerçek render / kat planı görseli YOK. Stok görsel,
 * AI görseli veya "placeholder" fotoğraf KOYULMAZ — referans sitede bir kez
 * alakasız bir çiftlik görseli tanıtım videosu thumbnail'i olarak konmuştu;
 * bu bileşen o hatanın tekrarlanmasını yapısal olarak engellemek için var.
 *
 * Boşluğu özür diler gibi değil, kasıtlı gösterir: taralı alan mimari
 * çizimlerdeki "sonra belirlenecek" konvansiyonudur ve boşluğu bir eyleme
 * (görsel talebi) çevirir.
 */
export function PendingMedia({
  baslik,
  aciklama,
  telefon,
  waMesaji,
  oran = '16 / 9',
  ton = 'light',
}: Props) {
  const koyu = ton === 'dark';

  const cizgi = koyu ? saydam('--color-gold-lift', 28) : saydam('--color-gold', 34);
  const tarama = koyu ? saydam('--color-gold-lift', 5) : saydam('--color-gold', 5.5);

  return (
    <div
      className="relative flex flex-col items-center justify-center px-6 py-12 text-center sm:px-10"
      style={{
        // width:100% ZORUNLU. `aspect-ratio` + `min-height` birlikteyken kutu
        // genişliği YÜKSEKLİKTEN hesaplar (240px × 16/9 = 427px) ve dar
        // ekranda sayfayı yatay kaydırtır. Genişliği sabitleyince oran
        // yüksekliği belirler, min-height yalnızca taban olur.
        width: '100%',
        aspectRatio: oran,
        minHeight: '15rem',
        border: `1px solid ${cizgi}`,
        borderRadius: 2,
        backgroundColor: koyu ? 'var(--color-ink-lift)' : 'var(--color-frost)',
        backgroundImage: `repeating-linear-gradient(135deg, ${tarama} 0 1px, transparent 1px 11px)`,
      }}
    >
      <span
        aria-hidden="true"
        className="block h-px w-10"
        style={{ background: koyu ? 'var(--color-gold-lift)' : 'var(--color-gold)' }}
      />
      <p
        className="mt-5 font-[family-name:var(--font-display)]"
        style={{
          fontSize: 'var(--step-h3)',
          lineHeight: 1.2,
          color: koyu ? 'var(--color-blanc)' : 'var(--color-ink)',
        }}
      >
        {baslik}
      </p>
      <p
        className="mt-3 max-w-[34rem]"
        style={{
          fontSize: 'var(--step-body-sm)',
          lineHeight: 1.65,
          color: koyu ? 'var(--color-mist)' : 'var(--color-moss)',
        }}
      >
        {aciklama}
      </p>
      <a
        href={whatsappLinki(telefon, waMesaji)}
        target="_blank"
        rel="noopener noreferrer"
        // py-1.5: dokunma hedefini WCAG 2.2 SC 2.5.8 için 24px'in üstüne çıkarır
        className="mt-5 inline-flex items-center gap-2 py-1.5 transition-opacity duration-200 hover:opacity-70"
        style={{
          fontSize: 'var(--step-eyebrow)',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontWeight: 500,
          color: koyu ? 'var(--color-gold-lift)' : 'var(--color-ink)',
        }}
      >
        <span style={{ borderBottom: '1px solid currentColor' }}>
          Görselleri talep edin
        </span>
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
