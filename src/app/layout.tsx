import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Hanken_Grotesk } from 'next/font/google';

import './globals.css';

/**
 * Marka fontları miamili.com ile AYNI: yüksek kontrastlı editoryal serif +
 * sıcak geometrik sans. `latin-ext` alt kümesi ZORUNLU — onsuz ı/İ/ş/ğ/ç
 * fallback fonta düşer ve Türkçe metin gözle görülür biçimde bozulur.
 */
const bodoni = Bodoni_Moda({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-bodoni',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
});

const hanken = Hanken_Grotesk({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-hanken',
  weight: ['400', '500', '600'],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

/**
 * VARSAYILAN: NOINDEX.
 * Bu sayfa, halihazırda yayında olan bir sunumun yeniden inşasıdır. İki kopya
 * aynı anda indekslenirse kopya içerik sorunu doğar. Yayına hazır olduğunda
 * Vercel'de `NEXT_PUBLIC_ALLOW_INDEXING=true` ayarlayıp yeniden deploy edin —
 * NEXT_PUBLIC_* değerleri BUILD anında gömülür, sadece env eklemek yetmez.
 */
const indexlemeAcik = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: indexlemeAcik
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#152A21',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${bodoni.variable} ${hanken.variable}`}>
      <body>
        <a
          href="#genel-bakis"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:px-5 focus:py-3"
          style={{
            backgroundColor: 'var(--color-gold)',
            color: 'var(--color-ink)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          İçeriğe geç
        </a>
        {children}
      </body>
    </html>
  );
}
