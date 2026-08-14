'use client';

import { useRef, useState } from 'react';

import type { GaleriSekmesi } from '@/lib/project';
import { PendingMedia } from './PendingMedia';
import { SectionHeading } from './SectionHeading';

type Props = {
  sekmeler: GaleriSekmesi[];
  aciklama: string;
  telefon: string;
  projeAdi: string;
};

/**
 * W3C ARIA APG "Tabs with Manual Activation" deseni:
 * ok tuşlarıyla odak gezer, Enter/Space ile seçilir. Otomatik aktivasyon
 * kullanılmadı — sekme içeriği ileride ağır görseller taşıyacak, ok tuşuyla
 * gezerken her sekmeyi yüklemek gereksiz.
 */
export function Gallery({ sekmeler, aciklama, telefon, projeAdi }: Props) {
  const [aktif, setAktif] = useState(0);
  const [odakli, setOdakli] = useState(0);
  const butonlar = useRef<Array<HTMLButtonElement | null>>([]);

  if (sekmeler.length === 0) return null;

  const odaklan = (i: number) => {
    setOdakli(i);
    butonlar.current[i]?.focus();
  };

  const tusaBas = (e: React.KeyboardEvent) => {
    const son = sekmeler.length - 1;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      odaklan(odakli === son ? 0 : odakli + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      odaklan(odakli === 0 ? son : odakli - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      odaklan(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      odaklan(son);
    }
  };

  const aktifSekme = sekmeler[aktif];
  if (!aktifSekme) return null;

  return (
    <section
      id="galeri"
      style={{
        backgroundColor: 'var(--color-sand)',
        paddingBlock: 'clamp(4.5rem, 9vw, 8rem)',
      }}
    >
      <div className="shell">
        <SectionHeading
          etiket="Galeri"
          baslik="Mimari ve yaşam alanları"
          aciklama={aciklama}
        />

        <div
          role="tablist"
          aria-label="Galeri kategorileri"
          onKeyDown={tusaBas}
          className="mt-10 flex flex-wrap gap-2.5"
        >
          {sekmeler.map((s, i) => {
            const secili = i === aktif;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  butonlar.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`galeri-sekme-${s.id}`}
                aria-selected={secili}
                aria-controls={`galeri-panel-${s.id}`}
                tabIndex={i === odakli ? 0 : -1}
                onClick={() => {
                  setAktif(i);
                  setOdakli(i);
                }}
                className="rounded-full px-6 py-3 transition-colors duration-200"
                style={{
                  backgroundColor: secili ? 'var(--color-ink)' : 'transparent',
                  color: secili ? 'var(--color-cream)' : 'var(--color-ink)',
                  border: `1px solid ${secili ? 'var(--color-ink)' : 'var(--color-edge)'}`,
                  fontSize: 12,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  fontWeight: secili ? 600 : 500,
                }}
              >
                {s.etiket}
                {s.gorseller.length > 0 && (
                  <span className="figure ml-2 opacity-60">
                    {s.gorseller.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`galeri-panel-${aktifSekme.id}`}
          aria-labelledby={`galeri-sekme-${aktifSekme.id}`}
          tabIndex={0}
          className="mt-8"
        >
          {aktifSekme.gorseller.length === 0 ? (
            <PendingMedia
              baslik={`${aktifSekme.etiket} görselleri henüz yayına açılmadı`}
              aciklama="Geliştiricinin resmî sales-kit'i tarafımıza ulaştığında bu alan gerçek render'larla doldurulacak. O zamana kadar buraya temsilî veya stok görsel konmuyor — gördüğünüz her şey doğrulanmış veridir."
              telefon={telefon}
              waMesaji={`Merhaba, ${projeAdi} için ${aktifSekme.etiket.toLocaleLowerCase('tr-TR')} görsellerini talep ediyorum.`}
              oran="16 / 9"
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {aktifSekme.gorseller.map((src) => (
                <li key={src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="w-full"
                    style={{ borderRadius: 2 }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
