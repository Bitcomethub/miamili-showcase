'use client';

import { useMemo, useRef, useState } from 'react';

import type { ProjectView } from '@/lib/project';
import { FloorStack } from './FloorStack';
import { PendingMedia } from './PendingMedia';
import { SectionHeading } from './SectionHeading';

type Props = { proje: ProjectView };

export function FloorPlans({ proje }: Props) {
  const { ameniteKatlari, katGruplari, uniteler, katSayisi, broker, ad, sunum } =
    proje;

  const [grupIndex, setGrupIndex] = useState(0);
  const [uniteIndex, setUniteIndex] = useState(0);
  const [odakliUnite, setOdakliUnite] = useState(0);
  const uniteButonlari = useRef<Array<HTMLButtonElement | null>>([]);

  const aktifGrup = katGruplari[grupIndex];
  const aktifUnite = uniteler[uniteIndex];

  const stackEtiketi = useMemo(() => {
    const amenite = ameniteKatlari
      .map((a) => `Kat ${a.kat}: ${a.baslik}`)
      .join('. ');
    const secili = aktifGrup
      ? ` Seçili kat grubu: ${aktifGrup.etiket}.`
      : '';
    return `${katSayisi} katlı şematik kat diyagramı. ${amenite}.${secili}`;
  }, [ameniteKatlari, aktifGrup, katSayisi]);

  const uniteTusu = (e: React.KeyboardEvent) => {
    const son = uniteler.length - 1;
    const git = (i: number) => {
      setOdakliUnite(i);
      uniteButonlari.current[i]?.focus();
    };
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      git(odakliUnite === son ? 0 : odakliUnite + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      git(odakliUnite === 0 ? son : odakliUnite - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      git(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      git(son);
    }
  };

  return (
    <section
      id="kat-planlari"
      style={{
        backgroundColor: 'var(--color-blanc)',
        paddingBlock: 'clamp(4.5rem, 9vw, 8rem)',
      }}
    >
      <div className="shell">
        {/* --- 4a. Amenite katları --- */}
        <SectionHeading
          etiket="Kat Planları"
          baslik="Amenite katları ve rezidans planları"
          aciklama={sunum.katPlaniAciklama}
        />

        <div className="mt-14 grid gap-x-12 gap-y-12 lg:grid-cols-2">
          {ameniteKatlari.map((kat) => (
            <article key={kat.kat} style={{ borderTop: '1px solid var(--color-gold)' }}>
              <div className="flex items-baseline gap-4 pt-6">
                <span
                  className="figure"
                  style={{
                    fontSize: 'var(--step-figure)',
                    lineHeight: 1,
                    color: 'var(--color-moss)',
                  }}
                >
                  {String(kat.kat).padStart(2, '0')}
                </span>
                <h3
                  style={{
                    fontSize: 'var(--step-h3)',
                    color: 'var(--color-ink)',
                  }}
                >
                  {kat.baslik}
                </h3>
              </div>

              <ul className="mt-6 grid gap-x-8 gap-y-0 sm:grid-cols-2">
                {kat.liste.map((madde) => (
                  <li
                    key={madde}
                    className="py-2.5"
                    style={{
                      fontSize: 'var(--step-body-sm)',
                      lineHeight: 1.5,
                      color: 'var(--color-moss)',
                      borderTop: '1px solid var(--color-edge)',
                    }}
                  >
                    {madde}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* --- 4b. Rezidans kat planları --- */}
        <div className="mt-20 lg:mt-28">
          <h3
            id="rezidans-planlari"
            className="scroll-mt-28"
            style={{ fontSize: 'var(--step-h3)', color: 'var(--color-ink)' }}
          >
            Rezidans kat planları
          </h3>

          <div
            role="radiogroup"
            aria-label="Kat grubu seçin"
            className="mt-6 flex flex-wrap gap-2.5"
          >
            {katGruplari.map((grup, i) => {
              const secili = i === grupIndex;
              return (
                <button
                  key={grup.id}
                  type="button"
                  role="radio"
                  aria-checked={secili}
                  onClick={() => setGrupIndex(i)}
                  className="rounded-full px-6 py-3 text-left transition-colors duration-200"
                  style={{
                    backgroundColor: secili ? 'var(--color-ink)' : 'transparent',
                    color: secili ? 'var(--color-blanc)' : 'var(--color-ink)',
                    border: `1px solid ${secili ? 'var(--color-ink)' : 'var(--color-edge-strong)'}`,
                    fontSize: 12,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: secili ? 600 : 500,
                  }}
                >
                  {grup.etiket}
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-12">
            {/* Sol: plan alanı + ünite seçici */}
            <div className="lg:col-span-7">
              <PendingMedia
                baslik="Kat planı çizimi henüz paylaşılmadı"
                aciklama="Ünite ölçüleri geliştiricinin resmî kat planı sayfasından alınmıştır; çizimin kendisi sales-kit ile birlikte yayınlanacak. Buraya temsilî bir plan çizilmiyor."
                telefon={broker.telefon}
                waMesaji={
                  aktifUnite
                    ? `Merhaba, ${ad} — Rezidans ${aktifUnite.no} kat planını talep ediyorum.`
                    : `Merhaba, ${ad} kat planlarını talep ediyorum.`
                }
                oran="4 / 3"
              />

              <div className="mt-8">
                <p
                  id="unite-secici-etiketi"
                  style={{
                    fontSize: 'var(--step-micro)',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    color: 'var(--color-moss)',
                  }}
                >
                  Ünite seçin
                </p>
                <div
                  role="radiogroup"
                  aria-labelledby="unite-secici-etiketi"
                  onKeyDown={uniteTusu}
                  className="mt-4 grid gap-2"
                  style={{
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(3.25rem, 1fr))',
                  }}
                >
                  {uniteler.map((u, i) => {
                    const secili = i === uniteIndex;
                    return (
                      <button
                        key={u.no}
                        ref={(el) => {
                          uniteButonlari.current[i] = el;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={secili}
                        aria-label={`Rezidans ${u.no}, ${u.tip}, ${u.yasam_sf} SF yaşam alanı`}
                        tabIndex={i === odakliUnite ? 0 : -1}
                        onClick={() => {
                          setUniteIndex(i);
                          setOdakliUnite(i);
                        }}
                        className="figure py-3 transition-colors duration-200"
                        style={{
                          backgroundColor: secili
                            ? 'var(--color-gold)'
                            : 'var(--color-frost-deep)',
                          color: 'var(--color-ink)',
                          fontSize: 15,
                          fontWeight: secili ? 600 : 400,
                          borderRadius: 2,
                        }}
                      >
                        {u.no}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sağ: seçili ünitenin künyesi + kat grubunun diyagramdaki yeri */}
            <div className="lg:col-span-5">
              {aktifUnite && (
                <article
                  aria-live="polite"
                  className="p-7 sm:p-9"
                  style={{ backgroundColor: 'var(--color-ink)', borderRadius: 2 }}
                >
                  <p
                    style={{
                      fontSize: 'var(--step-micro)',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      color: 'var(--color-gold-lift)',
                    }}
                  >
                    Rezidans {aktifUnite.no}
                    {aktifGrup ? ` · ${aktifGrup.etiket}` : ''}
                  </p>

                  <h4
                    className="mt-4 font-[family-name:var(--font-display)]"
                    style={{
                      fontSize: 'var(--step-h3)',
                      lineHeight: 1.15,
                      color: 'var(--color-blanc)',
                    }}
                  >
                    {aktifUnite.konfigurasyon}
                  </h4>

                  <dl className="mt-8">
                    {[
                      // "Konfigürasyon" satırı YOK: hemen üstteki başlık zaten
                      // aynı değeri gösteriyor, tekrar olurdu.
                      ...(aktifUnite.banyo
                        ? [{ e: 'Banyo', d: aktifUnite.banyo }]
                        : []),
                      { e: 'Yaşam alanı', d: `${aktifUnite.yasam_sf} SF` },
                      { e: 'Balkon', d: `${aktifUnite.balkon_sf} SF` },
                      ...(aktifUnite.fiyatAraligi
                        ? [
                            {
                              e: 'Bu tip için fiyat aralığı',
                              d: aktifUnite.fiyatAraligi,
                            },
                          ]
                        : []),
                    ].map((satir, i) => (
                      <div
                        key={satir.e}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
                        style={{
                          borderTop:
                            i === 0
                              ? 'none'
                              : '1px solid var(--color-ink-edge)',
                        }}
                      >
                        <dt
                          style={{
                            fontSize: 'var(--step-micro)',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                            color: 'var(--color-mist-dim)',
                          }}
                        >
                          {satir.e}
                        </dt>
                        <dd
                          className="figure"
                          style={{
                            fontSize: 'var(--step-lead)',
                            color: 'var(--color-blanc)',
                          }}
                        >
                          {satir.d}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <p
                    className="mt-7"
                    style={{
                      fontSize: 'var(--step-fine)',
                      lineHeight: 1.7,
                      color: 'var(--color-mist-dim)',
                    }}
                  >
                    Alanlar geliştiricinin resmî kat planı sayfasındaki
                    değerlerdir. Ünite dizilimi kat grubuna göre değişebilir;
                    kesin dizilim ve ölçüm yöntemi için sözleşme belgelerine
                    bakınız.
                  </p>
                </article>
              )}

              <figure className="mt-8">
                <FloorStack
                  katSayisi={katSayisi}
                  vurgular={ameniteKatlari.map((a) => ({
                    kat: a.kat,
                    etiket: a.baslik,
                  }))}
                  aktifKatlar={aktifGrup?.katlar ?? []}
                  ton="light"
                  satirYuksekligi={7}
                  ariaEtiketi={stackEtiketi}
                />
                <figcaption
                  className="mt-4"
                  style={{
                    fontSize: 'var(--step-fine)',
                    lineHeight: 1.6,
                    color: 'var(--color-moss-dim)',
                  }}
                >
                  Koyu çizgiler seçili kat grubunun katlarıdır; altın çizgiler
                  amenite katları. Şematik diyagram — mimari render değildir.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
