# miamili-showcase — kalıcı kurallar

> Bu dosya her oturumda otomatik okunur. **Yalnızca her oturumu bağlayan
> kurallar** buraya yazılır (~12.000 karakter kapağı). Tarihli vaka anlatıları
> `LEARNINGS_ARCHIVE.md`'ye gider ve yalnızca eşleşen bir semptomu debug ederken
> açılır.

## Bu projenin varlık sebebi
Erman'ın ayrı bir Vercel hesabında yaptırdığı `miamili-palmtree.vercel.app`'in
kaynağa erişim olmadan, gözlemden ve gerçek PDF verisinden yeniden inşası.
Tek proje için değil, **tekrar kullanılabilir şablon** olarak kuruldu.

## Bağlayıcı kurallar

1. **Uydurma görsel YASAK.** Gerçek render/kat planı/video yok. Boş alanlar
   `PendingMedia` ile dürüst bekleme durumu gösterir; stok veya temsilî görsel
   konmaz. İçeriği tamamen olmayan blok (tanıtım videosu) hiç render edilmez.
   `npm run verify` kapı 6 bunu zorlar.
2. **Kaynağında olmayan rakam üretilmez.** Yatırım Analizi'nde sadece ödeme
   planı vardır — cap rate / ROI / kira getirisi / doluluk YOK. Tek türetilmiş
   sayı `%60` kalan bakiyedir ve ekranda türetilmiş olarak İŞARETLENİR.
3. **Sayı literali JSX'e yazılmaz.** Her olgusal sayı `data/*.json` →
   `src/lib/project.ts` yolundan geçer. Editoryal metinde rakam yerine
   `{{token}}` kullanılır; bilinmeyen token build'i kırar.
4. **`data/<slug>.json` olgu alanları `reference/*.json` ile birebir aynıdır.**
   Kaynak PDF değişirse ÖNCE referans dosya güncellenir. Verify kapı 1 derin
   eşitlik kontrol eder.
5. **Üçüncü parti script yok** (form, analytics, chat, harita). İletişim
   `wa.me` + `tel:`. Bu yüzden KVKK onay katmanı da gerekmiyor. `next.config.ts`
   CSP'si bunu teknik olarak zorlar — gevşetme.
6. **Altın üç rollüdür, karıştırma.** `--color-gold` (#B19565) DOLGU (üstüne
   `--color-ink` metin), `--color-gold-lift` (#C9AE77) koyu zeminde METİN,
   `--color-gold-deep` (#7E6636) açık zeminde METİN. Referans sunum tek altın
   kullandığı için iki WCAG hatası üretiyordu (altın+beyaz 2.85:1, krem+altın
   2.53:1).
7. **Ham `rgba()` yasak.** Yarı saydam marka rengi `saydam('--color-x', %)`
   (`src/lib/color.ts`) ile üretilir; aksi halde token değişince kopyalar eskir.
8. **Punto tabanı:** düz metin < 12px olamaz (`--step-fine`). `--step-micro`
   (11px) yalnızca kısa büyük-harf tracked etiketler. Tek istisna `FloorStack`
   kat anotasyonları (10px, `aria-hidden`).
9. **Marka kimliği:** koyu orman yeşili `#152A21` + altın + krem `#F4F1EA`.
   miamigezi / floridarehberi / miamiendeksi'nin turizm paletiyle KARIŞTIRILMAZ.
   Fontlar miamili.com ile aynı: Bodoni Moda (display) + Hanken Grotesk (body),
   `latin-ext` alt kümesi ZORUNLU (yoksa ı/İ/ş/ğ fallback'e düşer).
10. **Varsayılan `noindex`.** Erman'ın canlı sunumuyla kopya içerik olmasın diye.
    Açmak için `NEXT_PUBLIC_ALLOW_INDEXING=true` + **yeniden deploy**
    (`NEXT_PUBLIC_*` build anında gömülür).

## Tekrar eden teknik tuzaklar

- **`aspect-ratio` + `min-height` birlikte kutu genişliğini YÜKSEKLİKTEN
  hesaplar** ve dar ekranda yatay taşma yapar. `width: 100%` şart.
  (393px'te 240px × 16/9 = 427px taşma yaşandı.)
- **Sticky başlık durumu için `isIntersecting` yanlış ölçüttür.** Hero sonundaki
  işaretçi, hero ekrandan uzunsa sayfanın en üstünde de "kesişmiyor" der. Doğru
  soru `boundingClientRect.top <= başlıkYüksekliği`.
- **Odak halkasını programatik `.focus()` ile ölçme** — Chrome'un
  `:focus-visible` sezgiselini güvenilir tetiklemez, yanlış negatif verir.
  Gerçek `Tab` basışlarıyla test et.
- **Bir bağlantıya `aria-label` yazarken görünür metnin TAMAMINI içermeli**
  (WCAG 2.5.3). Logo + proje adı taşıyan bağlantıda en temiz çözüm `aria-label`'ı
  kaldırıp görselin `alt`'ını boşaltmaktır.
- **`gap-px` + kapsayıcı zemin deseni** öğe sayısı sütuna bölünmediğinde boş
  hücreyi dolu bloğa çevirir. Bandlarda `.spec-band` (nth-child ayraçları)
  kullan; `--band-cols` / `--band-edge` ile parametrelenir.
- **CSS özgüllüğü sırayı yener:** `.spec-band > *:nth-child(even)` kuralı
  `* + *`ten spesifiktir; geniş ekran bloğunda ikisi de aynı sonucu vermek
  zorunda, birini silme.

## Oturum protokolü
Başta bu dosyayı oku. Sonda: 2+ başarısız deneme / semptomdan uzak kök neden /
gerçek mimari seçim / para-auth-veri dokunuşu varsa `extract-approach` uygula ve
vakayı `LEARNINGS_ARCHIVE.md`'ye yaz. Yalnızca yeni bir **kalıcı kural** doğduysa
buraya satır ekle.
