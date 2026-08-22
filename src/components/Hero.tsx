import { MARKA } from '@/lib/brand';
import type { ProjectView } from '@/lib/project';
import { FloorStack } from './FloorStack';
import { MiamiliMark } from './MiamiliMark';
import { saydam } from '@/lib/color';

/**
 * Hero'da GÖRSEL YOKTUR ve bilinçli olarak konmamıştır: projenin gerçek
 * render'ı elimizde değil, uydurma/stok görsel yasak. Boşluğu doldurmak için
 * fotoğraf taklidi bir şey üretmek yerine, hero'nun ağırlığını tipografi ve
 * ELDEKİ VERİDEN çizilen şematik kat diyagramı taşıyor.
 */
export function Hero({ proje }: { proje: ProjectView }) {
  const { sunum, ameniteKatlari, katSayisi, teslimTahmini } = proje;

  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--color-ink)',
        backgroundImage:
          `radial-gradient(115% 85% at 76% 6%, var(--color-ink-glow) 0%, ${saydam('--color-ink-glow', 0)} 58%)`,
        paddingTop: 'calc(var(--header-h) + clamp(3rem, 7vw, 6rem))',
        paddingBottom: 'clamp(2rem, 4vw, 3rem)',
      }}
    >
      <div className="shell">
        <div className="grid items-center gap-y-14 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-8">
            <p
              className="eyebrow rise"
              style={{ color: 'var(--color-gold-lift)', animationDelay: '40ms' }}
            >
              {MARKA.ad} Real Estate · Yatırımcı Sunumu
            </p>

            <h1
              className="rise mt-7"
              style={{
                fontSize: 'var(--step-h1)',
                color: 'var(--color-blanc)',
                animationDelay: '110ms',
              }}
            >
              {sunum.kisaAd}
              <br />
              {sunum.altAd}
            </h1>

            <p
              className="rise mt-8 max-w-[34rem]"
              style={{
                fontSize: 'var(--step-lead)',
                lineHeight: 1.65,
                color: 'var(--color-mist)',
                animationDelay: '190ms',
              }}
            >
              {sunum.heroAltBaslik}
            </p>

            <div
              className="rise mt-11 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '270ms' }}
            >
              <a
                href="#yatirim-analizi"
                className="inline-flex items-center gap-3 rounded-full px-7 py-4 transition-transform duration-200 hover:-translate-y-px"
                style={{
                  backgroundColor: 'var(--color-gold)',
                  color: 'var(--color-ink)',
                  fontSize: 13,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Yatırım Analizini İncele
                <span aria-hidden="true">↓</span>
              </a>
              <a
                href="#galeri"
                className="inline-flex items-center rounded-full px-7 py-4 transition-colors duration-200"
                style={{
                  border: `1px solid ${saydam('--color-blanc', 32)}`,
                  color: 'var(--color-blanc)',
                  fontSize: 13,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                Galeriyi Gör
              </a>
            </div>
          </div>

          {/* Şematik kesit — dekorasyon değil, veri */}
          <figure
            className="rise lg:col-span-4 lg:pl-4"
            style={{ animationDelay: '340ms' }}
          >
            <FloorStack
              katSayisi={katSayisi}
              vurgular={ameniteKatlari.map((a) => ({
                kat: a.kat,
                etiket: a.baslik,
              }))}
              ton="dark"
              satirYuksekligi={9}
              ariaEtiketi={`${proje.ad}: ${katSayisi} katlı şematik kat diyagramı. ${ameniteKatlari
                .map((a) => `Kat ${a.kat}: ${a.baslik}`)
                .join('. ')}.`}
            />
            <figcaption
              className="mt-5"
              style={{
                fontSize: 'var(--step-fine)',
                lineHeight: 1.6,
                letterSpacing: '0.04em',
                color: 'var(--color-mist-dim)',
              }}
            >
              Şematik kat diyagramı — kat sayısı ve amenite katları proje
              verisinden çizilmiştir. Mimari render değildir.
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Alt bilgi şeridi */}
      <div className="shell mt-14">
        <hr className="rule-dark" />
        <div className="flex flex-wrap items-center justify-between gap-6 pt-6">
          <span className="flex items-center gap-4">
            <span
              style={{
                fontSize: 'var(--step-micro)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--color-mist-dim)',
              }}
            >
              Sunan
            </span>
            <MiamiliMark ton="blanc" boyut="sm" />
          </span>

          <span className="flex items-baseline gap-4">
            <span
              style={{
                fontSize: 'var(--step-micro)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--color-mist-dim)',
              }}
            >
              Tahmini Teslim
            </span>
            <span
              className="figure"
              style={{ fontSize: 'var(--step-h3)', color: 'var(--color-blanc)' }}
            >
              {teslimTahmini}
            </span>
          </span>
        </div>
      </div>

      {/* Başlığın koyu/açık geçişini tetikleyen görünmez işaretçi */}
      <div id="hero-sonu" aria-hidden="true" className="h-px w-full" />
    </section>
  );
}
