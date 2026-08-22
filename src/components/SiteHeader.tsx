'use client';

import { useEffect, useRef, useState } from 'react';

import { BOLUMLER, whatsappLinki } from '@/lib/brand';
import { MiamiliMark } from './MiamiliMark';
import { saydam } from '@/lib/color';

type Props = {
  kisaAd: string;
  altAd: string;
  telefon: string;
  projeAdi: string;
};

export function SiteHeader({ kisaAd, altAd, telefon, projeAdi }: Props) {
  // Site KOYU-ÖNCELİKLİ: başlık her zaman zümrüt zeminli ve beyaz metinlidir.
  // Kaydırma açık/koyu TEMA değiştirmez — yalnızca şeffaflığı değiştirir:
  // hero'nun üstünde tamamen şeffaf, hero'dan çıkınca yarı saydam zümrüt +
  // bulanıklık + saç teli. (Daha önce burada krem bir şerite geçiliyordu;
  // koyu bir sayfanın üstünde açık bir bar yabancı duruyordu.)
  const [kaydirildi, setKaydirildi] = useState(false);
  const [menuAcik, setMenuAcik] = useState(false);
  const [aktifBolum, setAktifBolum] = useState<string | null>(null);
  const menuButonu = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const isaretci = document.getElementById('hero-sonu');
    if (!isaretci) return;
    // DİKKAT: `isIntersecting` burada YANLIŞ ölçüttür. İşaretçi hero'nun
    // sonundadır; hero ekrandan uzunsa (mobilde her zaman öyle) sayfanın en
    // üstünde de "kesişmiyor" der ve başlık hero'nun üstündeyken zemin
    // kazanırdı. Doğru soru "işaretçi başlığın ÜSTÜNE çıktı mı".
    const BASLIK_PX = 72;
    const olc = (giris: IntersectionObserverEntry) =>
      setKaydirildi(giris.boundingClientRect.top <= BASLIK_PX);

    const gozlemci = new IntersectionObserver(
      ([giris]) => {
        if (giris) olc(giris);
      },
      { rootMargin: `-${BASLIK_PX}px 0px 0px 0px`, threshold: 0 }
    );
    gozlemci.observe(isaretci);
    return () => gozlemci.disconnect();
  }, []);

  // Aktif bölüm göstergesi — uzun tek sayfada nerede olduğunu söyler
  useEffect(() => {
    const bolumler = BOLUMLER.map((b) => document.getElementById(b.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (bolumler.length === 0) return;

    const gozlemci = new IntersectionObserver(
      (girisler) => {
        const gorunur = girisler
          .filter((g) => g.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (gorunur[0]) setAktifBolum(gorunur[0].target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    bolumler.forEach((el) => gozlemci.observe(el));
    return () => gozlemci.disconnect();
  }, []);

  // Menü açıkken sayfa kaymasın + Escape kapatsın ve odağı geri versin
  useEffect(() => {
    if (!menuAcik) return;
    const oncekiOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const tusaBas = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuAcik(false);
        menuButonu.current?.focus();
      }
    };
    document.addEventListener('keydown', tusaBas);
    return () => {
      document.body.style.overflow = oncekiOverflow;
      document.removeEventListener('keydown', tusaBas);
    };
  }, [menuAcik]);

  // Mobil menü tam ekran zümrüt açılır; başlık o sırada yarı saydam zemin ve
  // saç teli taşırsa panelin tepesinde yabancı bir şerit oluşur — bu yüzden
  // menü açıkken başlık yeniden tamamen şeffaflaşır.
  const seffaf = !kaydirildi || menuAcik;
  const metinRengi = 'var(--color-blanc)';

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500"
        style={{
          height: 'var(--header-h)',
          backgroundColor: seffaf ? 'transparent' : saydam('--color-ink', 88),
          backdropFilter: seffaf ? 'none' : 'saturate(140%) blur(12px)',
          borderBottom: `1px solid ${seffaf ? 'transparent' : 'var(--color-ink-edge)'}`,
          transitionTimingFunction: 'var(--ease-out-quart)',
        }}
      >
        <div className="shell flex h-full items-center gap-4">
          {/* Proje kimliği + sunan marka: iki ayrı varlık, ince bir çizgiyle ayrılır */}
          {/*
            aria-label YOK ve olmamalı. Bağlantının erişilebilir adı görünür
            metninin kendisidir ("Palm Tree" + "Residences Miami"); ayrı bir
            aria-label yazmak WCAG 2.5.3 "Label in Name" ihlali doğuruyordu
            (görünür metnin tamamını içermiyordu). Logo görseli bu yüzden
            `dekoratif` — adı zaten yanındaki metin söylüyor.
          */}
          <a href="#hero" className="flex shrink-0 items-center gap-4">
            <span className="flex flex-col leading-none">
              <span
                className="font-[family-name:var(--font-display)]"
                style={{ fontSize: 19, color: metinRengi, letterSpacing: '-0.01em' }}
              >
                {kisaAd}
              </span>
              <span
                className="mt-1"
                style={{
                  fontSize: 'var(--step-micro)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  color: 'var(--color-gold-lift)',
                }}
              >
                {altAd}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="hidden h-8 w-px sm:block"
              style={{
                backgroundColor: saydam('--color-blanc', 28),
              }}
            />
            <span className="hidden sm:block">
              <MiamiliMark ton="blanc" boyut="sm" oncelikli dekoratif />
            </span>
          </a>

          <nav
            aria-label="Bölümler"
            className="ml-auto hidden items-center gap-7 xl:flex"
          >
            {BOLUMLER.map((b) => {
              const aktif = aktifBolum === b.id;
              return (
                <a
                  key={b.id}
                  href={`#${b.id}`}
                  aria-current={aktif ? 'true' : undefined}
                  className="relative py-2 transition-opacity duration-200 hover:opacity-100"
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.13em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    color: metinRengi,
                    opacity: aktif ? 1 : 0.72,
                  }}
                >
                  {b.etiket}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-px origin-left transition-transform duration-300"
                    style={{
                      backgroundColor: 'var(--color-gold-lift)',
                      transform: `scaleX(${aktif ? 1 : 0})`,
                      transitionTimingFunction: 'var(--ease-out-quart)',
                    }}
                  />
                </a>
              );
            })}
          </nav>

          <a
            href={whatsappLinki(
              telefon,
              `Merhaba, ${projeAdi} hakkında görüşmek istiyorum.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto hidden shrink-0 items-center rounded-full px-5 py-2.5 transition-[transform,background-color] duration-200 hover:-translate-y-px md:inline-flex xl:ml-0"
            style={{
              backgroundColor: 'var(--color-gold)',
              color: 'var(--color-ink)', // beyaz DEĞİL: beyaz 2.85:1 ile AA'dan kalıyor
              fontSize: 12,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Görüşme Ayarla
          </a>

          <button
            ref={menuButonu}
            type="button"
            onClick={() => setMenuAcik((a) => !a)}
            aria-expanded={menuAcik}
            aria-controls="mobil-menu"
            className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center xl:hidden"
            style={{ color: metinRengi }}
          >
            <span className="sr-only">{menuAcik ? 'Menüyü kapat' : 'Menüyü aç'}</span>
            <span aria-hidden="true" className="relative block h-3.5 w-6">
              <span
                className="absolute left-0 block h-px w-full transition-transform duration-300"
                style={{
                  backgroundColor: 'currentColor',
                  top: menuAcik ? '50%' : 0,
                  transform: menuAcik ? 'rotate(45deg)' : 'none',
                  transitionTimingFunction: 'var(--ease-out-quart)',
                }}
              />
              <span
                className="absolute left-0 block h-px w-full transition-opacity duration-200"
                style={{
                  backgroundColor: 'currentColor',
                  top: '50%',
                  opacity: menuAcik ? 0 : 1,
                }}
              />
              <span
                className="absolute left-0 block h-px w-full transition-transform duration-300"
                style={{
                  backgroundColor: 'currentColor',
                  top: menuAcik ? '50%' : '100%',
                  transform: menuAcik ? 'rotate(-45deg)' : 'none',
                  transitionTimingFunction: 'var(--ease-out-quart)',
                }}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobil menü: modal değil, tam ekran bir panel — geri dönüşü tek tuş */}
      <div
        id="mobil-menu"
        hidden={!menuAcik}
        className="fixed inset-0 z-40 xl:hidden"
        style={{ backgroundColor: 'var(--color-ink)' }}
      >
        <div
          className="shell flex h-full flex-col justify-between pb-10"
          style={{ paddingTop: 'calc(var(--header-h) + 1.5rem)' }}
        >
          <nav aria-label="Bölümler (mobil)" className="flex flex-col">
            {BOLUMLER.map((b, i) => (
              <a
                key={b.id}
                href={`#${b.id}`}
                onClick={() => setMenuAcik(false)}
                className="border-b py-4 font-[family-name:var(--font-display)]"
                style={{
                  borderColor: 'var(--color-ink-edge)',
                  color: 'var(--color-blanc)',
                  fontSize: 'var(--step-h3)',
                  animation: menuAcik
                    ? `rise 0.5s var(--ease-out-expo) ${i * 45}ms both`
                    : undefined,
                }}
              >
                {b.etiket}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-5">
            <a
              href={whatsappLinki(
                telefon,
                `Merhaba, ${projeAdi} hakkında görüşmek istiyorum.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuAcik(false)}
              className="inline-flex items-center justify-center rounded-full px-6 py-4"
              style={{
                backgroundColor: 'var(--color-gold)',
                color: 'var(--color-ink)',
                fontSize: 13,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Görüşme Ayarla
            </a>
            <MiamiliMark ton="blanc" boyut="md" taglineGoster />
          </div>
        </div>
      </div>
    </>
  );
}
