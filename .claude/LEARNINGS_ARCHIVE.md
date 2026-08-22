# miamili-showcase — vaka arşivi

> Bu dosya oturum başında OKUNMAZ. Yalnızca bir başlıktaki semptomla eşleşen bir
> şeyi debug ederken açılır.

---

## 2026-08-22 — Krem tasfiyesi: bir paleti kaldırmak yerine YÖNÜNÜ değiştirmek

**Bağlam.** Metin'in kesin talimatı: bej/krem zemin hiçbir sitede istenmiyor.
Bu sitenin body'si `--color-cream` (#F4F1EA) idi — en ağır ihlal buradaydı.
Ölçüldü (göz kararı değil): 1280px'te bölüm zeminlerinin **%66'sı** sıcak-nötr
bandındaydı.

**Sorun.** "Krem yerine beyaz koy" mekanik bir çeviri olurdu ve ortaya
kremsiz ama hâlâ AÇIK-öncelikli, karaktersiz bir sayfa çıkardı. Talimat
"koyu-zümrüt öncelikli" diyordu; bu bir renk değişimi değil, kompozisyon
değişimi.

**Reddedilen seçenekler.**
- Sadece token değerlerini değiştir (cream→beyaz, sand→gri) → sayfa yine 6 açık
  / 2 koyu bölüm kalırdı. "Koyu-öncelikli" ölçülebilir bir iddiadır ve bu onu
  karşılamıyordu.
- Her bölümü koyuya çevir → okuma bölümleri (Yönetici Özeti, Kat Planları) uzun
  metin ve yoğun künye taşıyor; hepsi koyu olsa sayfa tek blok hâline gelirdi
  ve talimat zaten "SAF BEYAZ kartlar/bantlar" istiyordu.
- **Seçilen:** bölüm POLARİTELERİNİ yeniden dağıt. Galeri ve Manzaralar
  açık→koyu; İletişim krem bölüm+koyu kart yerine koyu bölüm+**beyaz kart**.
  Sonuç %64 koyu / %36 beyaz, iki beyaz "belge bandı" + bir beyaz kapanış kartı.

**Kanıt.** `npm run shots` canlı URL'de: `body` = `rgb(21, 42, 33)`; 400px²+
boyanan hiçbir zemin sıcak-nötr bandında değil; yatay taşma 0px (393 ve 1280).

**Kural.** Palet talimatı "şu rengi kaldır" değil "şu YÖNE git" diyorsa, token
değerlerini değiştirmek yetmez — bölümlerin açık/koyu dağılımını yeniden kur ve
sonucu oranla ölç.

---

## 2026-08-22 — İki talimat çelişince: "eyebrow altın olsun" vs "açık zeminde altın metin yasak"

**Bağlam.** Talimat aynı anda şunları söylüyordu: *"Gold yalnız vurgu: çizgi,
eyebrow, buton"* ve *"açık zeminde gold metin YASAK (bilinen 2.5:1 sorunu)"*.
Eyebrow bir METİNDİR; açık bölümlerde onlarca yerde `--color-gold-deep` ile
yazılıyordu.

**Sorun.** Gevşek okuma (#7E6636 beyazda 5.47:1, AA geçiyor, kalsın) ile sıkı
okuma (açık zeminde hiç altın harf olmasın) farklı sitelere çıkıyordu.

**Reddedilen seçenekler.**
- Gevşek okuma: gold-deep'i koru → "YASAK" olarak yazılmış bir talimatı ölçüme
  dayanarak esnetmek olurdu; ayrıca altın hem açık hem koyu zeminde görününce
  koyu-öncelikli yönü zayıflıyordu.
- Altını açık bölümlerden tamamen sil → talimatın "eyebrow" maddesini çiğnerdi
  ve beyaz bantlar marka vurgusuz kalırdı.
- **Seçilen:** açık zeminde altın **HARF** değil, **ÇİZGİ ve DOLGU** olarak
  yaşar. `.eyebrow::before` rengi metinden ayrıldı (`--eyebrow-cizgi`
  değişkeni); amenite kartlarının üst çizgisi altın oldu; alıntı kenarı ve
  seçili çip dolgusu zaten altındı. Etiket metni `--color-moss`'a düştü.

**Yan kazanç.** `--color-gold-deep` yalnızca "açık zeminde okunabilir altın
metin" için vardı; kural onu gereksiz kıldı, silindi. Altın 3 rolden 2'ye indi.
Kapı bunu koruyor: gold/blanc çiftlerinin GEÇMEMESİ gerektiğini doğruluyor —
geçmeye başlarlarsa kuralın gerekçesi düşmüş demektir ve uyarı veriyor.

**Kural.** İki talimat çelişiyorsa hangisinin daha DAR olduğunu bul ve onu
uygula; genellikle dar olan ("YASAK") niyeti, geniş olan ("vurgu olarak
kullan") aracı tarif eder. Çözümü koda değil, kapıya yazdır.

---

## 2026-08-22 — "Footer'daki logo kayboldu" — hata sitede değil, ekran görüntüsü aracındaydı

**Bağlam.** Tam sayfa ekran görüntüsünde footer'daki MiamiLi kelime işareti
görünmüyordu. Yeni `miamili-wordmark-blanc.png` varlığını PIL ile üretmiştim,
ilk şüphe oradaydı.

**Reddedilen tanılar.**
- Yeni PNG bozuk / sharp okuyamıyor → `curl` ile hem ham dosya (200, 16516
  bayt) hem `/_next/image` çıktısı (200, image/png) sağlamdı.
- CSP `img-src` engelliyor → `img-src 'self' data:` zaten kendi kaynağına izinli
  ve diğer logolar aynı yoldan geliyordu.
- **Gerçek kök neden:** `next/image` varsayılan olarak **lazy** yükler.
  `Page.captureScreenshot` + `captureBeyondViewport` katlamanın altını
  RENDERLER ama görüntü alanı oraya hiç inmediği için lazy görsel HİÇ
  istenmez. Sitede sorun yoktu; ölçüm aracı yalan söylüyordu.

**İlk düzeltme de yanlıştı.** Tarama döngüsüne `img.decode()` beklemesi
eklendim → script **sonsuza kadar asıldı** (300s timeout). Hiç istenmemiş bir
lazy görselde `decode()` asla çözülmez. Sınırlı kaydırma döngüsü + sabit
bekleme ile değiştirildi.

**Kanıt.** Düzeltme öncesi footer bölgesinde saf beyaz piksel = 0, en açık
piksel `(175,192,182)` (tagline metni). Sonrası: 4492 saf beyaz piksel.

**Kural.** Ekran görüntüsü bir ÖLÇÜM ARACIDIR ve o da hatalı olabilir. "Sayfada
X eksik" demeden önce aracın X'i görebilecek durumda olduğunu kanıtla (HTTP
200 + lazy yükleme tetiklenmiş). Tarayıcı içi bekleme yazarken asla süresiz
çözülebilen bir promise'i (`decode()`, `load` olayı) beklemeyin — sınırlı
döngü + sabit süre kullanın.

## 2026-08-14 — Görseli olmayan bir sunum sayfası nasıl ayakta durur

**Bağlam.** Palm Tree Residences Miami için elimizde geliştiricinin iki resmî
PDF'i (ödeme planı + fiyat aralığı) vardı; **hiç render, kat planı çizimi veya
video yoktu**. Referans sunumda bu boşluk bir kez alakasız bir çiftlik görseliyle
doldurulmuştu (tanıtım videosu thumbnail'i olarak) — tekrarı yasaklandı.

**Sorun.** Hero'yu tam genişlik proje görselinin taşıması gerekiyordu. Görsel
yoksa hero ya boş ve zayıf kalır ya da sahte bir görselle doldurulur.

**Reddedilen seçenekler.**
- Stok Miami fotoğrafı → projeyi temsil ettiği izlenimi verir, yasak.
- AI ile üretilmiş render → geliştiricinin yasal metniyle ("ARTIST CONCEPTUAL
  RENDERING… CANNOT BE RELIED UPON") doğrudan çelişir, yasak.
- Gri placeholder kutu → sayfayı bitmemiş gösterir.
- Sadece tipografi → çalışır ama hero zayıf kalır.

**Seçilen çözüm: şematik kat diyagramı (`FloorStack`).** Binanın *nasıl
göründüğüne* dair hiçbir iddiada bulunmayan, tamamen eldeki veriden çizilen
soyut bir kesit:
- çizgi sayısı = `kat_sayisi` (37)
- altın çizgiler = `amenite_level_*` (09 Wellness, 37 Rooftop)
- koyu çizgiler = seçili kat grubunun katları

Bu, kısıtı farklılaştırıcıya çevirdi. Diyagram Kat Planları bölümünde kat grubu
seçicisine bağlı olduğu için **iki kez iş yapıyor** — dekorasyon değil arayüz.
Kat grubu B seçilince 13. katın atlandığı ve 16/21/26/31'in A grubuna ait olduğu
diyagramda gözle görülüyor. Her iki yerde de ekranda "şematik diyagram — mimari
render değildir" notu var.

**Kalan boşluklar için desen:** `PendingMedia` — mimari çizimlerdeki "sonra
belirlenecek" tarama konvansiyonu + tek satır dürüst açıklama + WhatsApp'tan
görsel talep bağlantısı. Boşluğu özür yerine eyleme çeviriyor.

---

## 2026-08-14 — 393px'te yatay taşma: `aspect-ratio` + `min-height`

**Semptom.** 393px ve 360px viewport'ta `document.scrollWidth` 447px. Suçlu
`PendingMedia` kutusu: `left: 20, right: 447`.

**Yanlış hipotezler.** Uzun Türkçe kelime taşması, `whitespace-nowrap` etiketler,
grid `minmax` tabanı — hiçbiri değildi.

**Kök neden.** Bileşende `aspectRatio: '16 / 9'` ve `minHeight: '15rem'` (240px)
birlikte tanımlıydı ve elemanın genişliği `auto` idi. Bu durumda tarayıcı
genişliği **yükseklikten** hesaplıyor: 240 × 16/9 = 427px. Kutu kapsayıcısını
aşıp sayfayı yatay kaydırtıyordu.

**Çözüm.** `width: '100%'` eklemek. Genişlik sabitlenince oran yüksekliği
belirliyor, `min-height` yalnızca taban görevi görüyor. Tek satır, ama
`aspect-ratio`'nun iki yönlü çalıştığı bilinmeden bulunması zor.

**Ders.** `aspect-ratio` kullanan her kutuda ana eksen açıkça sabitlenmeli.
Taşmayı gözle değil programatik ara: her elemanın `getBoundingClientRect().right`
değerini viewport genişliğiyle karşılaştıran bir tarama saniyede sonuç veriyor,
ekran görüntüsüne bakarak aynı şeyi bulmak dakikalar sürüyor.

---

## 2026-08-14 — Sticky başlık mobilde ters çalıştı (`isIntersecting` tuzağı)

**Semptom.** Masaüstünde doğru (hero üzerinde şeffaf/krem metin), **mobilde
sayfanın en üstünde krem zemin + koyu metin**. Yani hero koyu yeşilken başlık
"aşağı kaydırılmış" gibi davranıyordu.

**Kök neden.** Hero'nun SONUNA `#hero-sonu` işaretçisi konmuş ve
`setKaydirildi(!giris.isIntersecting)` yazılmıştı. Masaüstünde hero 900px'lik
viewport'a sığdığı için işaretçi görünürdü → doğru sonuç. Mobilde hero ~2400px
olduğundan işaretçi sayfanın en üstünde de görünmüyordu → `isIntersecting=false`
→ başlık kaydırılmış sanıyordu.

**Ders.** `isIntersecting` "işaretçi ekranda mı" sorusunu cevaplar; burada
sorulan soru "işaretçi başlığın ÜSTÜNE çıktı mı" idi. Doğrusu
`giris.boundingClientRect.top <= BASLIK_PX`. IntersectionObserver hâlâ sadece
sınır geçişlerinde tetiklendiği için scroll listener'a göre ucuz kalıyor.

Aynı oturumda ikinci bir başlık hatası: mobil menü açıkken (tam ekran koyu yeşil
panel) başlık krem kalıyordu, panelin tepesinde yabancı bir şerit oluşuyordu.
`koyuZemin = !kaydirildi || menuAcik` ile çözüldü.

---

## 2026-08-14 — Doğrulama script'inin üç yanlış alarmı

Sayıların JSON'a karşı programatik doğrulanması istendi; ilk sürüm 3 kontrolde
düştü ve **üçü de script hatasıydı**, sayfa hatası değil. Yeni kontrol yazarken
aynı tuzaklara dikkat:

1. **HTML entity'lerini silme, ÇÖZ.** `&amp;` ve `&#x27;` boşlukla
   değiştirildiği için "Wellness & Spor", "Chef's Kitchen", "Member's Club" ve
   `mimar` alanı "sayfada yok" sanıldı. 13 sahte eksiklik.
2. **Sayı sınırı `\d` değil `\w` olmalı.** Olgu sayılarının kaynağa elle
   yazılmadığını kontrol eden regex `(?<![\d.])152(?![\d.])` idi ve `#152a21`
   hex renginin içindeki `152`'yi yakalıyordu. `(?<![\w.])` ile çözüldü.
3. **Kanonik URL dış kaynak değildir.** "Üçüncü parti script yok" kontrolü tüm
   `href="http..."` eşleşmelerini tarıyordu ve sayfanın kendi `canonical`/`og:url`
   değerini üçüncü parti sanıyordu. Kontrol yalnızca **yüklenen** kaynaklara
   (`<script src>`, `<iframe src>`, `<link rel=stylesheet|preload|preconnect>`)
   daraltıldı.

**Gerçek bulgu da çıktı:** `rgba(244,241,234,...)` gibi ham marka renkleri 6
dosyada elle tekrarlanmıştı (`234` ünite balkon m²'siyle çakışıyordu). Bu bir
tasarım sistemi ihlaliydi — `saydam('--color-cream', 32)` yardımcısına çevrildi,
kod tabanında ham `rgba(` sayısı 0'a indi.

**Ayrıca:** kaynak taraması yorumları hariç tutmalı (render edilmezler), ama
kütüphane dokümanlarının canlı proje verisini örnek olarak alıntılamaması da
ayrı bir şablon kuralı — başka bir projeye geçildiğinde sessizce yanlış olurlar.

---

## 2026-08-14 — Referans sunumun iki WCAG hatası ve altının üçe bölünmesi

Referans ekran görüntülerinden **piksel örneklemesiyle** çıkarılan palet:
koyu yeşil `#152A21`, yükseltilmiş yüzey `#233A30`, altın `#B19565`, krem
`#F4F1EA`, kum `#EFEBE0`.

Kontrast hesabı iki ihlal gösterdi:
- Altın buton + **beyaz** metin → **2.85:1** (AA fail). Referans site böyle.
- Krem zeminde `#B19565` etiket → **2.53:1** (AA fail).

Aynı görsel etkiyi kaybetmeden çözmek için altın tek renk olmaktan çıkarıldı:
`--color-gold` dolgu (üstüne `--color-ink`, 5.31:1), `--color-gold-lift`
`#C9AE77` koyu zeminde metin (7.08:1 / 5.70:1), `--color-gold-deep` `#7E6636`
açık zeminde metin (4.85:1). Sonuç: Lighthouse Accessibility 100.

**Ders.** Bir referansı "birebir kopyala" görevinde bile ölçülebilir erişilebilirlik
hatalarını taşımak gerekmiyor; sapmayı belgeleyip düzeltmek doğru olan.

---

## 2026-08-14 — Lighthouse mobil `font-size`: %48 okunabilir metin

**Semptom.** Mobil Best Practices 96, `font-size` denetimi düştü: sayfadaki
metnin yalnızca **%48.31**'i ≥12px.

**Kök neden.** Tek bir blok: footer'daki geliştirici yasal metni 10.5px'ti ve
tek başına metnin **%45.3**'ünü oluşturuyordu (uzun İngilizce hukuk paragrafı).
Kalan onlarca 10-11px etiket toplamda %0.6'ydı.

**Ders.** Bu tür denetimlerde "kaç eleman küçük" değil "**karakter olarak ne
kadarı** küçük" önemli. Tek bir uzun paragrafı düzeltmek 20 küçük etiketi
düzeltmekten kat kat etkili. Punto tabanı token'landı: `--step-fine` (12px) düz
metin için, `--step-micro` (11px) yalnızca kısa büyük-harf etiketler için.
Sonuç: Best Practices 100.
