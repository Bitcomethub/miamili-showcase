import type { ProjectView } from '@/lib/project';
import { SectionHeading } from './SectionHeading';
import { saydam } from '@/lib/color';

/**
 * YATIRIM ANALİZİ — bilinçli olarak SADECE ödeme planı.
 *
 * Cap rate, ROI, kira getirisi, doluluk ve değer artışı projeksiyonu bu sayfada
 * YOKTUR ve eklenmeyecektir: geliştiricinin resmî belgelerinde bu rakamlar yok,
 * olmayan rakamı üretmek yatırımcıya yalan söylemektir. Gösterilen tek sayısal
 * yapı `depozito_yapisi`dır; %60'lık kalan bakiye ise aritmetiktir (100 − peşinat)
 * ve ekranda TÜRETİLMİŞ olarak işaretlenir.
 */
export function Investment({ proje }: { proje: ProjectView }) {
  const { odeme, sunum, yasal, kaynaklar, broker } = proje;
  const { kalemler, pesinatToplam } = odeme;

  const gerekceler = [
    {
      baslik: 'Doğrudan lisanslı broker',
      metin: `${broker.broker}, Florida lisans no ${broker.lisans}. Aracı zinciri yok; sözleşmeden teslime tek muhatap.`,
    },
    {
      baslik: 'Kademeli sermaye programı',
      metin: `Teslime kadar toplam %${pesinatToplam} peşinat, kalan bakiye teslimde. Sermaye tek seferde değil, takvime yayılarak bağlanır.`,
    },
    {
      baslik: 'Türkçe ve İngilizce süreç',
      metin:
        'Sözleşme, escrow ve kapanış yazışmaları iki dilde yürütülür; belge çevirisi için üçüncü bir tarafa ihtiyaç duymazsınız.',
    },
    {
      baslik: 'Kaynağı gösterilen veri',
      metin:
        'Bu sayfadaki her rakam geliştiricinin resmî belgelerinden gelir ve kaynağı aşağıda listelenmiştir. Kaynağı olmayan rakam yayınlanmaz.',
    },
  ];

  return (
    <section
      id="yatirim-analizi"
      style={{
        backgroundColor: 'var(--color-ink)',
        paddingBlock: 'clamp(4.5rem, 9vw, 8rem)',
      }}
    >
      <div className="shell">
        <SectionHeading
          ton="dark"
          etiket="Yatırım Analizi"
          baslik="Ödeme planı ve sermaye takvimi"
          aciklama={sunum.yatirimAciklama}
        />

        {/* --- Ödeme planı --- */}
        <div
          className="mt-14 p-7 sm:p-10"
          style={{ backgroundColor: 'var(--color-ink-lift)', borderRadius: 2 }}
        >
          <h3
            style={{ fontSize: 'var(--step-h3)', color: 'var(--color-cream)' }}
          >
            Ödeme planı
          </h3>

          {/* Segment genişlikleri yüzdelerle ORANTILI — çubuk dekor değil, veri */}
          <div
            aria-hidden="true"
            className="mt-8 flex gap-1.5"
            style={{ height: 6 }}
          >
            {kalemler.map((k) => (
              <span
                key={k.etiket}
                className="block"
                style={{
                  flexGrow: k.yuzde,
                  flexBasis: 0,
                  borderRadius: 999,
                  backgroundColor: k.turetilmis
                    ? saydam('--color-gold-lift', 32)
                    : 'var(--color-gold)',
                }}
              />
            ))}
          </div>

          <ol
            className="spec-band mt-6"
            style={{
              ['--band-cols']: String(kalemler.length),
              ['--band-edge']: 'var(--color-ink-edge)',
            } as React.CSSProperties}
          >
            {kalemler.map((k) => (
              <li key={k.etiket}>
                <p
                  className="figure"
                  style={{
                    fontSize: 'var(--step-figure)',
                    lineHeight: 1,
                    color: k.turetilmis
                      ? 'var(--color-mist)'
                      : 'var(--color-gold-lift)',
                  }}
                >
                  %{k.yuzde}
                </p>
                <p
                  className="mt-3"
                  style={{
                    fontSize: 'var(--step-body-sm)',
                    lineHeight: 1.5,
                    color: 'var(--color-cream)',
                  }}
                >
                  {k.etiket}
                </p>
                {k.turetilmis && (
                  <p
                    className="mt-2"
                    style={{ fontSize: 'var(--step-fine)', color: 'var(--color-mist-dim)' }}
                  >
                    Türetilmiş · %100 − %{pesinatToplam}
                  </p>
                )}
              </li>
            ))}
          </ol>

          <p
            className="mt-9 max-w-[46rem]"
            style={{
              fontSize: 'var(--step-fine)',
              lineHeight: 1.75,
              color: 'var(--color-mist-dim)',
            }}
          >
            Peşinat kalemleri geliştiricinin resmî ödeme planı belgesinden
            alınmıştır (toplam %{pesinatToplam}). Kalan bakiye kaynak belgede ayrı bir
            satır olarak yazmaz; yüzdelerin 100&apos;e tamamlanmasıyla
            hesaplanmıştır ve bu yüzden yukarıda türetilmiş olarak
            işaretlenmiştir.
          </p>
        </div>

        {/* --- Neden MiamiLi: kart ızgarası değil, numaralı editoryal liste --- */}
        <div className="mt-20">
          <h3
            style={{ fontSize: 'var(--step-h3)', color: 'var(--color-cream)' }}
          >
            Neden MiamiLi ile yatırım?
          </h3>

          <ol className="mt-10 grid gap-x-14 gap-y-0 lg:grid-cols-2">
            {gerekceler.map((g, i) => (
              <li
                key={g.baslik}
                className="grid grid-cols-[2.5rem_1fr] gap-x-5 py-7"
                style={{ borderTop: '1px solid var(--color-ink-edge)' }}
              >
                <span
                  className="figure"
                  style={{
                    fontSize: 'var(--step-lead)',
                    color: 'var(--color-gold-lift)',
                    lineHeight: 1.3,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4
                    className="font-[family-name:var(--font-display)]"
                    style={{
                      fontSize: 'var(--step-h3)',
                      lineHeight: 1.2,
                      color: 'var(--color-cream)',
                    }}
                  >
                    {g.baslik}
                  </h4>
                  <p
                    className="mt-3 max-w-[30rem]"
                    style={{
                      fontSize: 'var(--step-body-sm)',
                      lineHeight: 1.7,
                      color: 'var(--color-mist)',
                    }}
                  >
                    {g.metin}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* --- Kaynaklar: iddiaların denetlenebilirliği --- */}
        <details className="group mt-16">
          <summary
            className="inline-flex cursor-pointer list-none items-center gap-3 pb-1"
            style={{
              fontSize: 'var(--step-eyebrow)',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontWeight: 500,
              color: 'var(--color-gold-lift)',
              borderBottom: '1px solid var(--color-gold-lift)',
            }}
          >
            Bu sayfadaki verinin kaynakları
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-open:rotate-90"
            >
              →
            </span>
          </summary>
          <ol className="mt-6 max-w-[52rem]">
            {kaynaklar.map((k, i) => (
              <li
                key={k}
                className="grid grid-cols-[2rem_1fr] gap-x-4 py-3.5"
                style={{
                  borderTop:
                    i === 0 ? 'none' : '1px solid var(--color-ink-edge)',
                  fontSize: 'var(--step-body-sm)',
                  lineHeight: 1.65,
                  color: 'var(--color-mist)',
                }}
              >
                <span className="figure" style={{ color: 'var(--color-mist-dim)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{k}</span>
              </li>
            ))}
          </ol>
        </details>

        {/* --- Yasal uyarı: kendi landmark'ı, gizlenemez --- */}
        <section
          aria-label="Yatırım analizi yasal uyarısı"
          className="mt-16"
          style={{ borderTop: '1px solid var(--color-ink-edge)' }}
        >
          <p
            className="max-w-[62rem] pt-8"
            style={{
              fontSize: 12,
              lineHeight: 1.8,
              color: 'var(--color-mist-dim)',
            }}
          >
            {yasal.illustratifUyari}
          </p>
        </section>
      </div>
    </section>
  );
}
