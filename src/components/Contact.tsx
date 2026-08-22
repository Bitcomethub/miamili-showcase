import type { CSSProperties } from 'react';

import { telefonLinki, whatsappLinki } from '@/lib/brand';
import type { ProjectView } from '@/lib/project';

/**
 * Form YOK — bilinçli. Form olsaydı KVKK onay katmanı, üçüncü parti embed ve
 * bir CRM bağlantısı gerekirdi; bu sayfa tek bir satış sunumu olduğu için
 * iletişim doğrudan WhatsApp ve telefonla kuruluyor. Sayfada hiçbir üçüncü
 * parti script çalışmaz.
 */
export function Contact({ proje }: { proje: ProjectView }) {
  const { broker, ad } = proje;

  return (
    <section
      id="iletisim"
      style={{
        backgroundColor: 'var(--color-ink)',
        paddingBlock: 'clamp(4.5rem, 9vw, 8rem)',
      }}
    >
      <div className="shell">
        <div
          className="grid gap-x-12 gap-y-10 p-8 sm:p-12 lg:grid-cols-12 lg:p-14"
          style={{ backgroundColor: 'var(--color-blanc)', borderRadius: 2 }}
        >
          <div className="lg:col-span-7">
            <p
              className="eyebrow"
              style={
                {
                  // Beyaz kartın üstünde altın HARF yasak (2.85:1); altın
                  // vurgu metinden ÇİZGİYE taşınır.
                  color: 'var(--color-moss)',
                  '--eyebrow-cizgi': 'var(--color-gold)',
                  '--eyebrow-cizgi-opaklik': 1,
                } as CSSProperties
              }
            >
              İletişim
            </p>
            <h2
              className="mt-5"
              style={{
                fontSize: 'var(--step-h2)',
                color: 'var(--color-ink)',
              }}
            >
              Rakamları birlikte geçelim
            </h2>
            <p
              className="mt-5 max-w-[34rem]"
              style={{
                fontSize: 'var(--step-body)',
                lineHeight: 1.7,
                color: 'var(--color-moss)',
              }}
            >
              Ünite seçimi, ödeme takvimi ve sözleşme süreci için doğrudan
              broker ile konuşun. Form doldurmanız gerekmiyor.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={whatsappLinki(
                  broker.telefon,
                  `Merhaba, ${ad} için görüşme ayarlamak istiyorum.`
                )}
                target="_blank"
                rel="noopener noreferrer"
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
                WhatsApp&apos;tan yazın
                <span aria-hidden="true">→</span>
              </a>
              <a
                href={telefonLinki(broker.telefon)}
                className="inline-flex items-center rounded-full px-7 py-4 transition-colors duration-200"
                style={{
                  border: '1px solid var(--color-edge-strong)',
                  color: 'var(--color-ink)',
                  fontSize: 13,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                {broker.telefon}
              </a>
            </div>
          </div>

          <address
            className="not-italic lg:col-span-5 lg:pl-12"
            style={{ borderTop: '1px solid var(--color-edge)' }}
          >
            <dl className="pt-8 lg:border-t-0 lg:pt-0">
              {[
                { e: 'Ofis', d: broker.adres },
                { e: 'Broker', d: broker.broker },
                { e: 'Broker lisans no', d: broker.lisans },
                { e: 'Sunan', d: broker.sunan },
              ].map((s, i) => (
                <div
                  key={s.e}
                  className="py-4"
                  style={{
                    borderTop:
                      i === 0 ? 'none' : '1px solid var(--color-edge)',
                  }}
                >
                  <dt
                    style={{
                      fontSize: 'var(--step-micro)',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      color: 'var(--color-moss)',
                    }}
                  >
                    {s.e}
                  </dt>
                  <dd
                    className="mt-2"
                    style={{
                      fontSize: 'var(--step-body-sm)',
                      lineHeight: 1.6,
                      color: 'var(--color-ink)',
                    }}
                  >
                    {s.d}
                  </dd>
                </div>
              ))}
            </dl>
          </address>
        </div>
      </div>
    </section>
  );
}
