import { whatsappLinki } from '@/lib/brand';
import type { ProjectView } from '@/lib/project';
import { SectionHeading } from './SectionHeading';

/**
 * MANZARALAR — kasıtlı olarak eksik bir bölüm.
 *
 * Ünite bazında manzara (yön, kat, görüş açısı) verisi elimizde YOK ve manzara
 * iddiası emlakta en kolay yanıltan iddiadır (geliştiricinin kendi yasal metni
 * de "VIEWS SHOWN CANNOT BE RELIED UPON" diyor). Bu yüzden bölüm uydurulmuyor:
 * doğrulanmış tek manzara ifadesi kaynağıyla gösteriliyor, eksik olan ne varsa
 * açıkça sayılıyor.
 */
export function Views({ proje }: { proje: ProjectView }) {
  const { ameniteKatlari, broker, ad, medya } = proje;

  // Amenite listelerinde manzaradan söz eden maddeleri kaynağıyla topla
  const dogrulanmisManzaralar = ameniteKatlari.flatMap((kat) =>
    kat.liste
      .filter((madde) => /manzara/i.test(madde))
      .map((madde) => ({ kat: kat.kat, baslik: kat.baslik, madde }))
  );

  const eksikVeriler = [
    'Ünite bazında cephe yönü (kuzey / güney / doğu / batı)',
    'Kat yüksekliğine göre görüş hattı analizi',
    'Komşu parsellerdeki onaylı imar hakları ve gelecekteki kapanma riski',
  ];

  return (
    <section
      id="manzaralar"
      style={{
        backgroundColor: 'var(--color-sand)',
        paddingBlock: 'clamp(4.5rem, 9vw, 8rem)',
      }}
    >
      <div className="shell">
        <SectionHeading
          etiket="Manzaralar"
          baslik="Manzara verisi henüz doğrulanmadı"
          aciklama="Manzara, bir projede en kolay abartılan başlıktır. Bu sayfada yalnızca geliştiricinin resmî belgelerinde geçen ifadeler yer alıyor; ünite bazında manzara analizi, veri elimize ulaşana kadar yayınlanmayacak."
        />

        <div className="mt-14 grid gap-x-12 gap-y-12 lg:grid-cols-2">
          <div>
            <p
              style={{
                fontSize: 'var(--step-micro)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: 'var(--color-gold-deep)',
              }}
            >
              Doğrulanmış
            </p>
            {dogrulanmisManzaralar.length > 0 ? (
              <ul className="mt-5">
                {dogrulanmisManzaralar.map((m) => (
                  <li
                    key={`${m.kat}-${m.madde}`}
                    className="py-5"
                    style={{ borderTop: '1px solid var(--color-edge)' }}
                  >
                    <p
                      className="font-[family-name:var(--font-display)]"
                      style={{
                        fontSize: 'var(--step-h3)',
                        lineHeight: 1.25,
                        color: 'var(--color-ink)',
                      }}
                    >
                      {m.madde}
                    </p>
                    <p
                      className="mt-2"
                      style={{
                        fontSize: 'var(--step-body-sm)',
                        color: 'var(--color-warm)',
                      }}
                    >
                      Kaynak: geliştiricinin Kat {m.kat} ({m.baslik}) amenite
                      listesi.
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className="mt-5"
                style={{
                  fontSize: 'var(--step-body-sm)',
                  color: 'var(--color-warm)',
                }}
              >
                Resmî belgelerde manzaraya dair doğrulanmış bir ifade yok.
              </p>
            )}
          </div>

          <div>
            <p
              style={{
                fontSize: 'var(--step-micro)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: 'var(--color-warm)',
              }}
            >
              Henüz elimizde olmayan
            </p>
            <ul className="mt-5">
              {eksikVeriler.map((v) => (
                <li
                  key={v}
                  className="py-4"
                  style={{
                    borderTop: '1px solid var(--color-edge)',
                    fontSize: 'var(--step-body-sm)',
                    lineHeight: 1.6,
                    color: 'var(--color-warm)',
                  }}
                >
                  {v}
                </li>
              ))}
            </ul>

            {medya.manzaralar.length === 0 && (
              <a
                href={whatsappLinki(
                  broker.telefon,
                  `Merhaba, ${ad} için ünite bazında manzara analizi talep ediyorum.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 py-1.5 transition-opacity duration-200 hover:opacity-70"
                style={{
                  fontSize: 'var(--step-eyebrow)',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  color: 'var(--color-gold-deep)',
                }}
              >
                <span style={{ borderBottom: '1px solid currentColor' }}>
                  Manzara analizi isteyin
                </span>
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
