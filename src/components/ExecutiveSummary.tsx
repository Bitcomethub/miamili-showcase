import type { ProjectView } from '@/lib/project';
import { PendingMedia } from './PendingMedia';
import { SectionHeading } from './SectionHeading';

type Kunye = { etiket: string; deger: string };

export function ExecutiveSummary({ proje }: { proje: ProjectView }) {
  const {
    sunum,
    katSayisi,
    toplamUnite,
    teslimTahmini,
    bolge,
    gelistirici,
    mimar,
    adresSokak,
    durum,
    hoa,
    fiyatAraligiOzet,
    medya,
    broker,
    ad,
  } = proje;

  // Bakışta okunan katman. Değerlerin hiçbiri burada yazılmaz — hepsi veriden.
  const rakamlar = [
    { etiket: 'Kat', deger: String(katSayisi), sonek: 'katlı', sayi: true },
    { etiket: 'Ünite', deger: String(toplamUnite), sonek: 'rezidans', sayi: true },
    { etiket: 'Tahmini Teslim', deger: teslimTahmini, sonek: null, sayi: true },
    { etiket: 'Konum', deger: bolge ?? adresSokak, sonek: null, sayi: false },
  ];

  const kunye: Kunye[] = [
    { etiket: 'Geliştirici', deger: gelistirici },
    { etiket: 'Mimar', deger: mimar },
    { etiket: 'Adres', deger: adresSokak },
    { etiket: 'Durum', deger: durum },
    { etiket: 'Fiyat aralığı', deger: fiyatAraligiOzet },
    { etiket: 'HOA aidatı', deger: hoa },
  ];

  return (
    <section
      id="genel-bakis"
      className="scroll-mt-24"
      style={{
        backgroundColor: 'var(--color-cream)',
        paddingBlock: 'clamp(4.5rem, 9vw, 8rem)',
      }}
    >
      <div className="shell">
        <SectionHeading etiket="Yönetici Özeti" baslik={sunum.ozetBaslik} />

        {/* Künye şeridi: kart değil, teknik bir şartname bandı */}
        <ul className="spec-band spec-band--framed mt-14">
          {rakamlar.map((r) => (
            <li key={r.etiket}>
              <p
                style={{
                  fontSize: 'var(--step-micro)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  color: 'var(--color-gold-deep)',
                }}
              >
                {r.etiket}
              </p>
              <p
                className="figure mt-3"
                style={{
                  fontSize: r.sayi ? 'var(--step-figure)' : 'var(--step-h3)',
                  lineHeight: r.sayi ? 1.05 : 1.2,
                  color: 'var(--color-ink)',
                }}
              >
                {r.deger}
              </p>
              {r.sonek && (
                <p
                  className="mt-1.5"
                  style={{
                    fontSize: 'var(--step-body-sm)',
                    color: 'var(--color-warm)',
                  }}
                >
                  {r.sonek}
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-x-12 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p
              className="max-w-[38rem]"
              style={{
                fontSize: 'var(--step-body)',
                lineHeight: 1.75,
                color: 'var(--color-warm)',
              }}
            >
              {sunum.ozetParagraf}
            </p>

            <blockquote
              className="mt-10 max-w-[34rem] pl-7"
              style={{ borderLeft: '1px solid var(--color-gold)' }}
            >
              <p
                className="font-[family-name:var(--font-display)] italic"
                style={{
                  fontSize: 'var(--step-h3)',
                  lineHeight: 1.4,
                  color: 'var(--color-ink)',
                }}
              >
                {sunum.ozetAlinti}
              </p>
            </blockquote>
          </div>

          {/* Künye — özet paragrafın iddialarının denetlenebilir hâli */}
          <dl className="lg:col-span-5">
            {kunye.map((k, i) => (
              <div
                key={k.etiket}
                className="grid grid-cols-[7.5rem_1fr] gap-x-5 py-4"
                style={{
                  borderTop:
                    i === 0 ? 'none' : '1px solid var(--color-edge)',
                }}
              >
                <dt
                  style={{
                    fontSize: 'var(--step-micro)',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    color: 'var(--color-gold-deep)',
                    lineHeight: 1.9,
                  }}
                >
                  {k.etiket}
                </dt>
                <dd
                  style={{
                    fontSize: 'var(--step-body-sm)',
                    lineHeight: 1.6,
                    color: 'var(--color-ink)',
                  }}
                >
                  {k.deger}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/*
          Proje tanıtım videosu: GERÇEK içerik yoksa bu blok HİÇ render edilmez.
          Referans sitede bu alana alakasız bir çiftlik görseli konmuştu; boş
          bırakmak yanlış görsel koymaktan her zaman iyidir.
        */}
        {medya.tanitim_videosu && (
          <div className="mt-16">
            <PendingMedia
              baslik="Proje tanıtımı"
              aciklama="Tanıtım videosu hazırlanıyor."
              telefon={broker.telefon}
              waMesaji={`Merhaba, ${ad} tanıtım videosunu talep ediyorum.`}
            />
          </div>
        )}
      </div>
    </section>
  );
}
