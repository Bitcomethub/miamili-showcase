import type { ProjectView } from './project';

/**
 * JSON-LD @graph.
 *
 * İKİ SERT KURAL (miamili.com'da bir kez ihlal edilip 26 domain hatası
 * doğurduğu için buraya yazılıyor):
 *
 * 1. `ApartmentComplex` bir **Place** türevidir. `brand`, `isPartOf` ve
 *    `inLanguage` şema domain'i CreativeWork olduğu için oraya YAZILAMAZ —
 *    parse hatası vermez, sessizce geçersiz olur. Marka/geliştirici/mimar
 *    bilgisi `additionalProperty → PropertyValue` ile verilir.
 *
 * 2. `Offer` / `offers` / `price` KULLANILMAZ. Geliştiricinin kendi yasal
 *    metni "THIS IS NOT AN OFFER TO SELL" diyor; fiyat aralığını bağlayıcı bir
 *    Offer olarak yayınlamak bu beyanla çelişir. Fiyat aralığı yalnızca
 *    bilgilendirici bir PropertyValue'dur.
 */
export function buildJsonLd(proje: ProjectView, sayfaUrl: string) {
  const orgId = `${sayfaUrl}#broker`;
  const projeId = `${sayfaUrl}#proje`;

  const adresParcalari = proje.adresSokak.split(',').map((p) => p.trim());
  const sokak = adresParcalari[0] ?? proje.adresSokak;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${sayfaUrl}#webpage`,
        url: sayfaUrl,
        name: `${proje.ad} — ${proje.broker.sunan}`,
        inLanguage: 'tr-TR',
        description: proje.sunum.heroAltBaslik,
        about: { '@id': projeId },
        publisher: { '@id': orgId },
      },
      {
        '@type': 'ApartmentComplex',
        '@id': projeId,
        name: proje.ad,
        url: sayfaUrl,
        numberOfAccommodationUnits: {
          '@type': 'QuantitativeValue',
          value: proje.toplamUnite,
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: sokak,
          addressLocality: proje.bolge ?? 'Miami',
          addressRegion: 'FL',
          addressCountry: 'US',
        },
        amenityFeature: proje.ameniteKatlari.flatMap((kat) =>
          kat.liste.map((madde) => ({
            '@type': 'LocationFeatureSpecification',
            name: madde,
            value: true,
          }))
        ),
        // Marka/geliştirici/durum Place'e doğrudan yazılamaz — PropertyValue ile.
        additionalProperty: [
          { ad: 'Marka', deger: proje.marka },
          { ad: 'Geliştirici', deger: proje.gelistirici },
          { ad: 'Mimari ve iç mekân', deger: proje.mimar },
          { ad: 'Kat sayısı', deger: String(proje.katSayisi) },
          { ad: 'Tahmini teslim', deger: proje.teslimTahmini },
          { ad: 'Durum', deger: proje.durum },
          { ad: 'HOA aidatı', deger: proje.hoa },
          {
            ad: 'Fiyat aralığı (bilgilendirici, teklif değildir)',
            deger: proje.fiyatAraligiOzet,
          },
        ].map((p) => ({
          '@type': 'PropertyValue',
          name: p.ad,
          value: p.deger,
        })),
      },
      {
        '@type': 'RealEstateAgent',
        '@id': orgId,
        name: proje.broker.sunan,
        employee: {
          '@type': 'Person',
          name: proje.broker.broker,
        },
        telephone: proje.broker.telefon,
        address: {
          '@type': 'PostalAddress',
          streetAddress: proje.broker.adres,
          addressCountry: 'US',
        },
        identifier: {
          '@type': 'PropertyValue',
          name: 'Florida Real Estate Broker License',
          value: proje.broker.lisans,
        },
        areaServed: {
          '@type': 'AdministrativeArea',
          name: 'Miami-Dade County, Florida',
        },
      },
    ],
  };
}
