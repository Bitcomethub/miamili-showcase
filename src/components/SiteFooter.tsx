import { MARKA, telefonLinki } from '@/lib/brand';
import type { ProjectView } from '@/lib/project';
import { MiamiliMark } from './MiamiliMark';

/**
 * Footer'daki broker künyesi ve geliştirici yasal metni Florida'da bir
 * ön-satış projesini tanıtırken ZORUNLU unsurlardır. Metinler
 * data/<slug>.json'dan gelir ve verify script'i tarafından karakter karakter
 * doğrulanır — burada elle düzenleme yapma.
 */
export function SiteFooter({ proje }: { proje: ProjectView }) {
  const { broker, ad, yasal } = proje;

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-ink)',
        paddingBlock: 'clamp(3.5rem, 6vw, 5rem)',
      }}
    >
      <div className="shell">
        <div className="flex justify-center">
          <MiamiliMark ton="cream" boyut="lg" taglineGoster />
        </div>

        <hr className="rule-dark mt-12" />

        <div className="grid gap-x-12 gap-y-8 py-10 lg:grid-cols-2">
          <div>
            <p
              className="font-[family-name:var(--font-display)]"
              style={{
                fontSize: 'var(--step-h3)',
                lineHeight: 1.2,
                color: 'var(--color-cream)',
              }}
            >
              {ad}
            </p>
            <p
              className="mt-3"
              style={{
                fontSize: 'var(--step-micro)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: 'var(--color-gold-lift)',
              }}
            >
              Sunan · {broker.sunan}
            </p>
          </div>

          <address
            className="not-italic lg:justify-self-end lg:text-right"
            style={{
              fontSize: 'var(--step-body-sm)',
              lineHeight: 1.8,
              color: 'var(--color-mist)',
            }}
          >
            <span className="block">Broker: {broker.broker}</span>
            <span className="block">{broker.adres}</span>
            <span className="block">
              Broker Lisans No: {broker.lisans} ·{' '}
              <a
                href={telefonLinki(broker.telefon)}
                className="underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
              >
                {broker.telefon}
              </a>
            </span>
          </address>
        </div>

        <hr className="rule-dark" />

        <p
          className="pt-8"
          style={{
            fontSize: 'var(--step-fine)',
            lineHeight: 1.85,
            letterSpacing: '0.02em',
            color: 'var(--color-mist-dim)',
          }}
        >
          {yasal.developerDisclaimer}
        </p>

        <p
          className="pt-8"
          style={{ fontSize: 12, color: 'var(--color-mist-dim)' }}
        >
          © {MARKA.telifYili} {broker.sunan}. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
