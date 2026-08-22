import Link from 'next/link';

import { MiamiliMark } from '@/components/MiamiliMark';
import { birincilProje } from '@/lib/projects';

export default function NotFound() {
  const proje = birincilProje();

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--color-ink)' }}
    >
      <MiamiliMark ton="blanc" boyut="md" taglineGoster />
      <p
        className="mt-12 font-[family-name:var(--font-display)]"
        style={{ fontSize: 'var(--step-h2)', color: 'var(--color-blanc)' }}
      >
        Bu sayfa bulunamadı
      </p>
      <p
        className="mt-4 max-w-[28rem]"
        style={{ fontSize: 'var(--step-body)', color: 'var(--color-mist)' }}
      >
        Aradığınız proje sunumu bu adreste yayında değil.
      </p>
      <Link
        href={`/${proje.slug}`}
        className="mt-9 inline-flex items-center gap-3 rounded-full px-7 py-4"
        style={{
          backgroundColor: 'var(--color-gold)',
          color: 'var(--color-ink)',
          fontSize: 13,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {proje.ad}
        <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
