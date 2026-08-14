import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Contact } from '@/components/Contact';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { FloorPlans } from '@/components/FloorPlans';
import { Gallery } from '@/components/Gallery';
import { Hero } from '@/components/Hero';
import { Investment } from '@/components/Investment';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { Views } from '@/components/Views';
import { projeBul, tumProjeler } from '@/lib/projects';
import { buildJsonLd } from '@/lib/schema';

/**
 * ŞABLON ROTASI — data/ içindeki her JSON dosyası için bir statik sayfa.
 * `dynamicParams = false`: bilinmeyen slug 404 verir, uydurma sayfa üretmez.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return tumProjeler().map((p) => ({ slug: p.slug }));
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const proje = projeBul(slug);
  if (!proje) return {};

  const baslik = `${proje.ad} — ${proje.broker.sunan}`;
  const aciklama = `${proje.katSayisi} katlı, ${proje.toplamUnite} üniteli ön-satış projesi. Geliştirici: ${proje.gelistirici}. Tahmini teslim ${proje.teslimTahmini}. Ödeme planı ve ünite ölçüleri geliştiricinin resmî belgelerinden.`;

  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: `/${proje.slug}` },
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      title: baslik,
      description: aciklama,
      url: `${siteUrl}/${proje.slug}`,
      siteName: proje.broker.sunan,
      // Not: og:image YOK. Projenin gerçek görseli elimizde olmadığı için
      // paylaşım kartına temsilî bir görsel konmuyor.
    },
  };
}

export default async function ProjePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const proje = projeBul(slug);
  if (!proje) notFound();

  const jsonLd = buildJsonLd(proje, `${siteUrl}/${proje.slug}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader
        kisaAd={proje.sunum.kisaAd}
        altAd={proje.sunum.altAd}
        telefon={proje.broker.telefon}
        projeAdi={proje.ad}
      />

      <main>
        <Hero proje={proje} />
        <ExecutiveSummary proje={proje} />
        <Gallery
          sekmeler={proje.medya.galeri}
          aciklama={proje.sunum.galeriAciklama}
          telefon={proje.broker.telefon}
          projeAdi={proje.ad}
        />
        <FloorPlans proje={proje} />
        <Views proje={proje} />
        <Investment proje={proje} />
        <Contact proje={proje} />
      </main>

      <SiteFooter proje={proje} />
    </>
  );
}
