/**
 * MiamiLi marka sabitleri — proje verisinden BAĞIMSIZ, sitenin tamamında ortak.
 * (Proje-özel olan her şey data/<slug>.json içindedir.)
 */

export const MARKA = {
  ad: 'MiamiLi',
  kelimeIsareti: 'MIAMILI.',
  tagline: 'START RIGHT IN MIAMI',
  taglineTr: 'Real Estate — Start Right in Miami',
  telifYili: 2026,
} as const;

/**
 * WhatsApp numarası proje verisindeki broker telefonundan türetilir
 * (tek doğruluk kaynağı orası). "+1 555-000-0000" -> "15550000000"
 */
export function whatsappLinki(telefon: string, mesaj?: string): string {
  const rakamlar = telefon.replace(/\D/g, '');
  const taban = `https://wa.me/${rakamlar}`;
  return mesaj ? `${taban}?text=${encodeURIComponent(mesaj)}` : taban;
}

export function telefonLinki(telefon: string): string {
  return `tel:+${telefon.replace(/\D/g, '')}`;
}

/** Sayfa içi navigasyon — bölüm id'leri ile birebir eşleşir. */
export const BOLUMLER = [
  { id: 'genel-bakis', etiket: 'Genel Bakış' },
  { id: 'galeri', etiket: 'Galeri' },
  { id: 'kat-planlari', etiket: 'Kat Planları' },
  { id: 'manzaralar', etiket: 'Manzaralar' },
  { id: 'yatirim-analizi', etiket: 'Yatırım Analizi' },
  { id: 'iletisim', etiket: 'İletişim' },
] as const;
