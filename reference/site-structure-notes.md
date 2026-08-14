# Referans site yapısı — miamili-palmtree.vercel.app (Erman'ın yaptırdığı, erişimimiz yok)

Kaynağa erişim yok, bu yüzden **görsel/yapısal gözlemden** çıkarıldı. Sıfırdan, aynı yapıda, gerçek veriyle yeniden inşa ediliyor.

## Marka kimliği
- MiamiLi'nin GERÇEK kurumsal kimliği: koyu orman yeşili + gold aksan + krem/off-white zemin (miamigezi/floridarehberi/miamiendeksi'nin turizm paletiyle KARIŞTIRMA — bu ayrı, miamili.com'un kendi "Warm Light" kimliği).
- Logo: "MIAMILI." koyu yeşil kutu içinde, altında "Real Estate — Start Right in Miami" tagline'ı.
- Footer'da gerçek broker bilgisi zorunlu: Erman Adanır, BK3401359, 1504 Bay Rd Suite 10 Miami Beach FL 33139, +1 305-690-3146.

## Navigasyon (sticky header)
Logo/proje adı solda | Genel Bakış · Galeri · Kat Planları · Manzaralar · Yatırım Analizi · İletişim | sağda "Görüşme Ayarla" CTA butonu.

## Bölümler (sırayla)

### 1. Hero
- Tam genişlik proje görseli (alacakaranlıkta dış cephe render — GERÇEK render yoksa GÖRSEL KOYMA, boş/soyut zemin bırak, uydurma stok görsel YASAK).
- Üstte küçük etiket: "MiamiLi Real Estate · Yatırımcı Sunumu"
- H1: proje adı
- Alt satır: "Miami'nin yükselen merkezinde, kurumsal kalitede bir yatırım fırsatı. Veriye dayalı bir analiz, tek bir sayfada." (bu cümle şablon — proje adına göre uyarla)
- İki CTA: "Yatırım Analizini İncele" (yatırım analizi bölümüne çapa) + "Galeriyi Gör" (galeriye çapa)
- Alt bilgi satırı: "Sunan [MiamiLi logo]" + "Tahmini Teslim [tarih aralığı]"

### 2. Yönetici Özeti
- Küçük etiket "Yönetici Özeti"
- H2: proje için tek cümlelik değer önerisi
- Paragraf: proje açıklaması (SADECE doğrulanmış kaynaklardan — geliştirici, konum, hizmet seviyesi)
- Alıntı kutusu (italik): kısa, iddialı ama doğrulanamaz-abartı OLMAYAN bir konumlandırma cümlesi
- 4 istatistik kartı: [Kat sayısı] · [Ünite sayısı aralığı] · [Teslim tahmini] · [Konum/bölge]
- "Proje Tanıtımı" video/görsel alanı (GERÇEK içerik yoksa BOŞ bırak — bir önceki denemede buraya alakasız bir çiftlik görseli konmuştu, bu KESİNLİKLE tekrarlanmayacak bir hata, video/görsel yoksa hiç render etme)

### 3. Galeri
- 3 sekmeli tab: "Dış Cephe" · "Ortak Alanlar" · "Rezidans İçi"
- Görsel yoksa (bizim durumumuzda YOK — geliştirici sales-kit'i olmadan gerçek render alınamaz) sekmeler dursun ama içerik alanı "Görseller geliştirici onayı sonrası eklenecektir" gibi dürüst bir bekleme durumu göstersin. Placeholder/stok görsel YASAK.

### 4. Kat Planları — iki alt bölüm
**4a. Amenite Katları:** İki (veya proje kaç ana amenite katı varsa) kat için başlık + kısa açıklama + amenite listesi (bullet). Görsel yoksa metin-only kalsın.

**4b. Rezidans Kat Planları — interaktif seçici:**
- Üstte kat grubu seçici (butonlar): "Kat X / Y / Z" gibi tekrarlanan kat gruplarını göstersin (PDF'teki floor plan sayfasında belirtilen residential key plan grubu — bkz. `palm-tree-residences-data.json` → `kat_plani_gruplari`)
- Altta ünite numarası butonları (grid) — PDF'teki tüm örnek ünite numaraları (01-19 gibi)
- Seçilen ünitenin detay kartı: ünite no, tip (1BR+Den vb.), banyo sayısı, yaşam alanı SF, balkon SF — **HEPSİ `palm-tree-residences-data.json` → `ornek_unite_listesi`'nden, uydurma YOK**
- Kat planı görseli alanı — GERÇEK görsel yoksa boş/placeholder bırak, sahte floor plan çizme

### 5. Manzaralar
Bölüm başlığı var ama içerik gerçek görsel/veri olmadan kurulmasın — bu bölüm gerçek manzara verisi (yön, kat, görüş açısı) olmadan BOŞ/kaldırılmış tutulabilir. Erman'dan bu veri gelirse eklenir.

### 6. Yatırım Analizi (koyu yeşil zemin, gold aksan — sitenin tek koyu bölümü)
- H2 başlık
- **Ödeme Planı** kartı: `palm-tree-residences-data.json` → `depozito_yapisi`'ndeki 4 kalemi göster (yüzdeler + tetikleyici olay). Bunun ötesinde (cap rate, ROI, kira getirisi tahmini gibi) HİÇBİR finansal projeksiyon UYDURMA — geliştirici PDF'inde veya kamuya açık kaynakta olmayan hiçbir sayı yazılmayacak.
- Yasal uyarı metni ZORUNLU (footer'ın hemen üstünde, region olarak): "Bu bölümdeki tüm rakamlar örnek üniteler üzerinden hazırlanmış illüstratif tahminlerdir ve yatırım, hukuki veya vergi tavsiyesi niteliği taşımaz. Fiyatlar, kira seviyeleri, faiz oranları, HOA aidatları ve değer artışı piyasa koşullarına göre değişir; getiri garanti edilmez. HOA aidatı $[X]/SF/ay olarak öngörülmüştür." — proje verisine göre parametrik.

### 7. İletişim
- "Randevu Al" / "WhatsApp üzerinden yazın" CTA'ları (WhatsApp linki: `https://wa.me/13056903146`)
- Ofis adresi + broker lisans bilgisi (bkz. broker_bilgisi)

### 8. Footer
- MiamiLi logo
- Proje adı · "Sunan · MiamiLi Real Estate"
- Broker: Erman Adanır satırı
- Adres + lisans no + telefon
- TAM developer legal disclaimer bloğu (florida 718.503 madde referansı, "ARTIST CONCEPTUAL RENDERING", "NOT AN OFFER TO SELL" vb. — gerçek geliştirici PDF'lerindeki standart metinle uyumlu, bkz. indirilen PDF'lerin alt bilgisi)
- "© 2026 MiamiLi Real Estate. Tüm hakları saklıdır."

## Teknik notlar
- Bu proje TEK proje için değil, **tekrar kullanılabilir bir şablon** olarak kurulmalı: proje verisi (`palm-tree-residences-data.json` formatında) değiştirilince başka bir flagship proje için de aynı sayfa üretilebilmeli. `/data/[proje-slug].json` + `app/[slug]/page.tsx` deseni düşünülebilir, ya da Palm Tree tek route ise sabit sayfa + ileride genişletilebilir veri şeması.
- Next.js + Tailwind, miamigezi/floridarehberi/miamiendeksi ile aynı altyapı deseni (statik, blog pipeline YOK bu projede — bu tek seferlik/az sayıda satış sayfası).
- KVKK/consent gate gerekmiyor (form yok, sadece wa.me linki ve tel: linki — üçüncü parti script yok).
