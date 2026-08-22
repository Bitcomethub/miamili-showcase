# MiamiLi Showcase — flagship proje sunum şablonu

Tek bir lüks gayrimenkul projesini yatırımcıya sunan, veri-güdümlü tek sayfa.
İlk uygulaması **Palm Tree Residences Miami**; sayfa bir şablon olarak kuruldu,
`data/` içine yeni bir JSON bırakmak yeni bir proje sayfası üretir.

Next.js 16 (App Router, SSG) · React 19 · Tailwind CSS 4 · sıfır üçüncü parti script.

---

## Hızlı başlangıç

```bash
npm install
npm run dev            # localhost:3000  ("/" -> birincil projeye yönlenir)

npm run build          # statik üretim
npm run check:palette  # palet kapısı (bej taraması + kontrast tablosu)
npm run verify         # palet kapısı + veri doğrulama (build çıktısını okur — ÖNCE build)
npm run shots -- --url <adres> --out .shots/x --widths 393,1280 [--full]
                       # ekran görüntüsü + zeminleri TARAYICIDAN ölç
npm run typecheck
```

---

## Yeni bir proje eklemek

1. `data/<slug>.json` oluştur. Dosya adı ile içindeki `slug` alanı **eşleşmek
   zorunda** (eşleşmezse build hata verir — yayındaki URL ile veri arasında
   sessiz kayma olmasın diye).
2. Başka hiçbir şey yapma. Route, `sitemap.xml`, `<title>`/OG etiketleri ve
   JSON-LD hepsi bu dosyadan türer.
3. `npm run build && npm run verify`.

Kök URL (`/`) alfabetik ilk projeye yönlenir. Farklı bir "flagship" istersen
`src/lib/projects.ts` → `birincilProje()` içindeki tek satırı değiştir; slug
başka hiçbir yerde sabit yazılı değil.

### Veri şeması

| Blok | Ne | Kural |
|---|---|---|
| Olgu alanları (`slug` … `kaynaklar`) | Geliştiricinin belgelerinden gelen ham gerçekler | `reference/*.json` ile **birebir** aynı olmak zorunda; verify script'i derin eşitlik kontrol eder |
| `sunum` | Projeye özel editoryal metin | İçinde **çıplak rakam olamaz** — sayılar `{{token}}` ile gelir |
| `medya` | Görsel/video varlıkları | Boş dizi = ekranda dürüst bekleme durumu |
| `yasal` | İllüstratif uyarı + geliştirici yasal metni | `illustratif_uyari` HOA'yı `{{hoa_tr}}` ile alır |

Kullanılabilir token'lar `src/lib/project.ts` → `tokenSozlugu()` içinde.
Bilinmeyen token render sırasında **hata fırlatır** (sayfada ham `{{...}}`
görünmesindense build kırılsın).

---

## Bu sayfanın uymak zorunda olduğu kurallar

Bunlar stil tercihi değil; her biri kodda ve doğrulama script'inde zorlanıyor.

### 1. Uydurma görsel yasak
Projenin gerçek render'ı, kat planı çizimi ve tanıtım videosu **elimizde yok**.
Boşluklar stok/temsilî görselle doldurulmaz — `PendingMedia` ile dürüst bir
bekleme durumu gösterilir ve boşluk bir eyleme (görsel talebi) çevrilir.
Tanıtım videosu gibi tamamen içeriksiz bloklar **hiç render edilmez**.

> Bu kural gerçek bir hatadan doğdu: referans sunumda "Proje Tanıtımı" alanına
> alakasız bir çiftlik görseli konmuştu.

Verify script'i sayfadaki `<img>`, `background-image` ve dış kaynakları tarar;
marka logosu dışında raster görsel bulursa **build'i reddeder**.

### 2. Kaynağında olmayan rakam üretilmez
Yatırım Analizi bölümünde **yalnızca ödeme planı** vardır. Cap rate, ROI, kira
getirisi, doluluk, değer artışı projeksiyonu YOKTUR ve eklenmeyecektir.

Tek türetilmiş sayı `%60` kalan bakiyedir (`100 − toplam peşinat`) ve ekranda
**türetilmiş olarak işaretlenir** — farklı renk, ayrı not satırı.

### 3. Sayı literali JSX'e yazılmaz
Ekranda görünen her olgusal sayı `data/*.json` → `src/lib/project.ts` yolundan
geçer. Verify script'i kaynak ağacını tarayıp olgu değerlerinin elle yazılmadığını
doğrular (yorumlar hariç tutulur; render edilmezler).

### 4. Üçüncü parti yok
Form yok, analytics yok, chat widget yok, harita yok. İletişim `wa.me` ve `tel:`
bağlantılarıyla. Bu yüzden KVKK onay katmanına da ihtiyaç yok. `next.config.ts`
içindeki CSP bunu teknik olarak zorlar — biri yanlışlıkla embed eklerse tarayıcı
engeller.

### 5. Koyu-zümrüt öncelikli; bej/krem YASAK
Sayfanın taşıyıcı zemini derin zümrüttür (`--color-ink` #152A21). Okuma
bölümleri bunun üstünde **saf beyaz** (#FFFFFF) bantlar ve kartlardır; ikincil
açık yüzey gerekirse yeşile kayan **soğuk nötr** (`--color-frost` #F1F5F3)
kullanılır. Bej / krem / kum / "kağıt" tonları hiçbir yüzeyde kullanılmaz.

Bu bir tercih değil, **kapı**: `npm run check:palette` src/ içindeki her hex'i
tarar ve sıcak-nötr bandına (R ≥ G > B, chroma ≤ 46) düşen her değeri reddeder —
yasak listeye yazmayı unuttuğumuz yeni bir bej de dahil.

### 5b. Altın iki rol + odak halkası, ve açık zeminde METİN OLAMAZ
`--color-gold` (#B19565) **dolgu / çizgi** — üstüne koyu yeşil metin (5.31:1).
`--color-gold-lift` (#C9AE77) **yalnız koyu zeminde metin** (7.08:1).
`--color-gold-focus` (#9A7F4C) odak halkası — beyazda 3.81:1, zümrütte 3.98:1;
tek renkle iki yüzeyde de WCAG 2.4.11'i geçer.

Açık zeminde altın **metin** yasaktır: #B19565 beyaz üstünde 2.85:1, #C9AE77
2.14:1. Açık zeminde altın yalnız **çizgi ve dolgu** olarak görünür (eyebrow saç
teli, alıntı kenarı, seçili çip zemini). Eski `--color-gold-deep` bu kural
yüzünden gereksizleşti ve kaldırıldı.

### 6. Punto tabanı
Düz metin **12px altına inmez** (`--step-fine`). `--step-micro` (11px) yalnızca
kısa, büyük harf, tracked etiketler içindir. Tek istisna `FloorStack`'in şematik
kat anotasyonları (10px, `aria-hidden`, satır yüksekliğine bağlı).

---

## Şematik kat diyagramı (`FloorStack`)

Gerçek render olmadığı için hero'nun görsel ağırlığını bu bileşen taşıyor.
**Mimari render değildir** ve binanın nasıl göründüğüne dair hiçbir iddiada
bulunmaz — yalnızca eldeki veriyi çizer:

- çizgi sayısı = `kat_sayisi`
- altın çizgiler = `amenite_level_*` anahtarlarındaki katlar
- koyu çizgiler = seçili kat grubunun katları (`kat_plani_gruplari`)

Kat Planları bölümünde kat grubu seçicisiyle canlı bağlantılıdır; grup
değiştirince hangi katları kapsadığını görürsünüz. Ekranda her iki yerde de
"şematik diyagram — mimari render değildir" notu görünür.

---

## Doğrulama

`npm run verify` önce **palet kapısını** (`check-palette.mjs`: sıcak-nötr
taraması, token bütünlüğü, kontrast tablosu) sonra yedi veri kapısını koşar;
herhangi biri düşerse çıkış kodu 1 verir:

| # | Kapı | Ne kanıtlar |
|---|---|---|
| 1 | Referans sadakati | `data/*.json` olgu alanları `reference/*.json` ile birebir aynı |
| 2 | Şablon disiplini | Editoryal metinde çıplak rakam yok; token'lar yerinde |
| 3 | İzlenebilirlik | Sayfadaki **görünür her sayı** veriden veya beyan edilmiş bir türetmeden geliyor |
| 4 | Eksiksizlik | 19 ünite, tüm fiyatlar, ameniteler, broker künyesi ve yasal metin sayfada |
| 5 | Kaynak saflığı | Olgu değerleri JSX'e elle yazılmamış |
| 6 | Görsel dürüstlüğü | Marka logosu dışında raster görsel / dış kaynak yok |
| 7 | Token bütünlüğü | Sayfaya çözülmemiş `{{...}}` sızmamış |

---

## Dağıtım (Vercel)

Root Directory: repo kökü. Framework: Next.js. Ek yapılandırma gerekmez.

| Env | Varsayılan | Ne yapar |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Vercel prod URL'i, yoksa `localhost` | Kanonik URL, OG, sitemap |
| `NEXT_PUBLIC_ALLOW_INDEXING` | *(boş)* → **noindex** | `true` yaparsan arama motorlarına açılır |

**Varsayılan `noindex` bilinçlidir:** bu sayfa halihazırda yayında olan bir
sunumun yeniden inşasıdır; iki kopya aynı anda indekslenirse kopya içerik sorunu
doğar. Yayına hazır olduğunda `NEXT_PUBLIC_ALLOW_INDEXING=true` ekleyip **yeniden
deploy et** — `NEXT_PUBLIC_*` değerleri build anında gömülür, sadece env eklemek
yetmez.

---

## Dosya haritası

```
data/<slug>.json            proje verisi (tek doğruluk kaynağı)
reference/                  Erman'ın PDF'lerinden çıkarılan ham veri + yapı notları
scripts/check-palette.mjs   palet kapısı: bej taraması + kontrast tablosu
scripts/lib/warm.mjs        sıcak-nötr bandı + WCAG kontrast (tek kaynak)
scripts/measure-surface.mjs ekran görüntüsü + canlı zemin ölçümü (CDP, bağımlılıksız)
scripts/verify-data.mjs     yedi kapılı doğrulama
src/lib/project.ts          şema, türetmeler, token motoru
src/lib/projects.ts         data/ yükleyici — şablonun giriş noktası
src/lib/schema.ts           JSON-LD (@graph)
src/lib/brand.ts            MiamiLi sabitleri, wa.me/tel yardımcıları
src/lib/color.ts            token-tabanlı saydamlık (ham rgba yasak)
src/app/globals.css         tasarım token'ları + .spec-band + .eyebrow
src/app/[slug]/page.tsx     SSG proje sayfası
src/components/             bölüm bileşenleri
```
