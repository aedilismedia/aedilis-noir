# Kut Mührü — dijital kitap

Erkan Avcı için hazırlanmış, Astro tabanlı statik okuma sitesi. Veritabanı, yönetim paneli, kullanıcı hesabı, reklam ve ziyaretçi takibi içermez. Metinler sunucuda işlenmez: yayın hazırlanırken HTML sayfalarına dönüşür. Okuma tercihleri ve ilerleme yalnızca okuyucunun kendi tarayıcısında saklanır.

**Teslimdeki üç bölüm YER TUTUCUDUR. Gerçek hikayeden alıntı değildir.** Kapak tanıtımı, kapak epigrafı, ithaf ve önsöz de değiştirilebilir örneklerdir. Yazar adı Erkan Avcı varsayılmıştır. Yeni gerçek bölümlerinizi yüklemeden önce örnekleri silin veya taslak yapın.

## Dosyaları tanıyalım

```text
kut-muhru/
├── bolumler/                 ← Her bölüm burada, tek bir .md dosyası
│   ├── Bölüm 01.md
│   ├── Bölüm 02.md
│   └── Bölüm 03.md
├── kitap.json                ← Kitabın bütün tanıtım bilgileri
├── evren.md                  ← Spoilersız evren tanıtımı
├── public/                   ← İstersen kapak ve metin içi görseller
│   └── lisanslar/            ← Yerel fontların açık kaynak lisansları
├── src/
│   ├── components/           ← Mühür ve ayar paneli
│   ├── layouts/              ← Ortak sayfa çerçevesi, SEO
│   ├── lib/content.js        ← Markdown okuma ve otomatik bölüm dizini
│   ├── pages/                ← Kapak, içindekiler, okuma, RSS vb.
│   ├── scripts/              ← Okuma tercihleri ve ilerleme
│   └── styles/global.css     ← Bütün tasarım değişkenleri
├── scripts/check-content.mjs ← İçerik sistemi kontrolü
├── astro.config.mjs
├── netlify.toml
├── package.json
├── package-lock.json
└── README.md
```

## 1. Yeni bölüm ekleme — kod yazmadan

1. Bu proje klasörünü bilgisayarınıza çıkarın. Obsidian'da **Open folder as vault / Klasörü kasa olarak aç** ile açabilirsiniz.
2. `bolumler` klasöründe yeni not oluşturun. Adını **Bölüm 04** yapın. Obsidian `.md` uzantısını kendisi ekler. Not Defteri kullanıyorsanız adı `Bölüm 04.md`, kodlaması UTF-8 olsun; dosyanın yanlışlıkla `.md.txt` olmadığını kontrol edin.
3. Metninizi yazın veya yapıştırın. Hiç ön bilgi eklemeseniz de çalışır. Başlık için ilk satırda `# Bölümün adı` yazabilirsiniz. Başlık bulunamazsa kısa ilk satır veya dosya adı kullanılır. Başlık yalnızca `Bölüm 4` gibi bir numaraysa ve `subtitle` varsa, alt başlık sayfada asıl başlık olarak gösterilir; numara büyük rakam, sekme başlığı ve RSS'te ayrıca korunur.
4. Dosyayı kaydedin. **İçindekiler veya bağlantılar için başka bir dosya değiştirmeyin.**
5. Siteyi aşağıdaki GitHub + Netlify yöntemiyle kurduysanız GitHub'da `bolumler` klasörünü açın; **Add file → Upload files** ile yeni dosyayı yükleyin ve **Commit changes** ile kaydedin. Site otomatik yeniden hazırlanır. Bilgisayarınızdaki bir dosyayı kaydetmek tek başına internete yüklemez; bu yükleme adımı gereklidir.
6. Netlify'da son yayının tamamlanmasını bekleyin. Yeni bölüm, içindekiler, önceki/sonraki bağlantıları, RSS ve sitemap kendiliğinden güncellenir.

Numara dosya adından alınır; `Bölüm 02.md`, `Bölüm 10.md` dosyasından önce gelir. Numaraların ardışık olması şart değildir. Aynı numarayı iki dosyada kullanmayın; bu durumda yayın bilerek durur ve anlaşılır bir hata verir. Numarasız `.md` dosyaları bölüm olarak yayımlanmaz. Bir dosyanın numarasını değiştirmek onun adresini de değiştirir; yayımladıktan sonra numaraları koruyun. Başlığını değiştirmek adresini değiştirmez.

### İsteğe bağlı bölüm bilgileri

Dosyanın en başına bu örneği koyabilirsiniz. Üç çizgili satırlar ön bilginin başlangıcı ve sonudur:

```markdown
---
title: "Bölümünüzün başlığı"
subtitle: "İsteğe bağlı alt başlık"
epigraph: "İsteğe bağlı bölüm başı sözü"
date: 2026-10-01
draft: false
---

İlk gerçek paragrafınız burada başlar.

İkinci paragraf için arada bir boş satır bırakın.

***

Sahne geçişinden sonraki paragraf burada başlar.
```

`title`, `subtitle`, `epigraph`, `date` ve `draft` alanlarının tamamı isteğe bağlıdır. `date` sıralamayı değiştirmez; RSS için yayın tarihidir. Tarihi `YYYY-AA-GG` biçiminde yazın. Ön bilgi olmaması siteyi bozmaz. Bozuk YAML ön bilgisi okunamazsa dosya atılmaz; ham metin korunur ve derleme günlüğüne uyarı yazılır. Bu durumda ön bilgiyi düzeltin. Taslak için geçerli `draft: true` kullanın.

İlk `# Başlık` satırı başlık olarak alındığında metinde ikinci kez gösterilmez. Başlık dışında metne edebî düzenleme, özetleme veya düzeltme uygulanmaz. `[[Yer]]` → `Yer`, `[[Yer|görünen ad]]` → `görünen ad` olarak gösterilir; bu bağlantılar otomatik evren sayfaları üretmez. `![[görsel.png]]` gömüleri dosya adına dönüşür. `%% gizli not %%` Obsidian yorumları yayımlanmaz. Callout başlık kodu kaldırılır, görünür metin alıntı olarak kalır. Dataview/Obsidian eklentileri çalıştırılmaz. HTML betikleri güvenlik için temizlenir. Markdown görsellerini kullanacaksanız dosyayı `public/` içine koyun ve standart `![Açıklama](/gorsel.jpg)` yazın; GitHub Pages alt dizininde görsel adresine proje yolunu da ekleyin.

Bir satırda tek başına `***` veya `---` küçük elmas biçimli ayraç olur; altını çizdiği önceki satırı başlığa çevirmez. Dosyanın **en başındaki** `---` ise ön bilgi başlangıcı sayılır; ilk sahne ayracı için `***` kullanın. Paragraflar arasında bir boş satır bırakın. Normal satır sonları aynı paragrafta birleşir.

## 2. Sıfırdan internette yayınlama — önerilen yol

Bu bölüm hiç hesabınız yokmuş gibi başlar. İlk kurulumdan sonra yeni bölümleri yalnızca dosya yükleyerek yayımlarsınız. Netlify'ın ücretsiz planı kullanım sınırlarına tabidir; ücretli plana geçmeniz bu proje için zorunlu değildir. İsterseniz Cloudflare Pages alternatifi aşağıdadır. Özel alan adı almak zorunlu değildir.

### A. GitHub hesabı ve kitap klasörü

1. [github.com](https://github.com) adresinde **Sign up** ile hesap açın, e-postanızı doğrulayın.
2. Sağ üstteki **+ → New repository** ile yeni depo oluşturun. Adı `kut-muhru` olabilir. Bölüm kaynaklarını paylaşmak istemiyorsanız **Private** seçin.
3. **Create repository** düğmesine basın. Boş deponun sayfasında **uploading an existing file** bağlantısını açın.
4. Teslim ZIP'ini bilgisayarınızda çıkarın. `package.json` ve `kitap.json` dosyalarının bulunduğu klasörün **içindekileri**, klasör yapısını koruyarak yükleyin. Dıştaki `kut-muhru` klasörünü tek bir ekstra katman olarak yüklemeyin. GitHub'ın kökünde `package.json` görünmelidir. Tarayıcı gizli dosyaları göstermiyorsa sorun değildir; `.openai` Sites'a özeldir ve GitHub'a taşımak gerekmez. `node_modules`, `.git`, `.astro`, `.sites-runtime` ve `dist` klasörlerini yüklemeyin.
5. **Commit changes** ile kaydedin. Bu işlem sadece dosyalarınızı depolar; henüz siteyi yayınlamaz.

### B. Netlify ile otomatik yayın

1. [app.netlify.com](https://app.netlify.com) adresinde ücretsiz hesap oluşturun. GitHub hesabınızla giriş yapabilirsiniz.
2. Projeler ekranında **Add new project → Import an existing project** seçin.
3. **GitHub**'ı seçin; istenirse yalnızca bu depoya erişim verin. `kut-muhru` deponuzu seçin.
4. Dal **main**, komut **npm run build**, yayın klasörü **dist** olsun. Kök klasör alanını boş bırakın. Bu ayarlar `netlify.toml` içinde de hazırdır. Node sürümü 22'dir; statik yayın için adaptör eklemeyin.
5. **Deploy site / Deploy project** ile yayını başlatın. Tamamlanınca size verilen `.netlify.app` adresini açın.
6. Proje özel başlatıldıysa proje görünürlüğünü okuyucular için **Public** yapın. Bu sitede okur girişi yoktur; dışarıdan erişim barındırma hesabının görünürlük ayarına bağlıdır.
7. GitHub'da `kitap.json` dosyasını açın, kalem simgesiyle düzenleyin. `siteUrl` değerini size verilen tam HTTPS adresiyle değiştirin. Örneğin `https://kitabim.netlify.app`. `base` değerini `/` bırakın. Kaydedin. Bu, RSS, sitemap ve sosyal paylaşım adreslerini düzeltir.
8. Yeni yayın tamamlanınca telefonunuzda siteyi açın. Artık bir bölüm dosyası ekleyip GitHub'a kaydettiğinizde site otomatik güncellenir.

Bir hata olursa Netlify'ın **Deploys** ekranındaki son kaydın günlüğüne bakın. En sık nedenler: yanlış klasör seviyesi, aynı numaralı iki bölüm, `kitap.json` içinde eksik tırnak/virgül. Geçersiz yeni bir yayın önceki başarılı sitenin yerine geçmez.

### C. Cloudflare Pages alternatifi

1. [dash.cloudflare.com](https://dash.cloudflare.com) üzerinden hesap açın.
2. **Workers & Pages** bölümünden **Pages** projesi oluşturup GitHub deponuzu bağlayın. Arayüzde **Create application → Pages → Connect to Git** olarak da görünebilir. Worker projesi yerine Pages seçin.
3. Framework olarak **Astro**, derleme komutu olarak `npm run build`, çıktı klasörü olarak `dist` seçin. Gerekirse ortam değişkeni `NODE_VERSION=22` ekleyin.
4. **Save and Deploy** ile yayınlayın. Verilen `.pages.dev` adresini `kitap.json` → `siteUrl` alanına yazıp kaydedin. `base` `/` kalır. Sonraki GitHub dosya yüklemeleri otomatik yayımlanır.

GitHub Pages da statik `dist/` çıktısını barındırabilir. Bu yol için `siteUrl` → `https://KULLANICI.github.io`, `base` → `/DEPO-ADI/` ayarlayın ve GitHub Actions ile `npm ci`, `npm run build` adımlarının ardından `dist/` çıktısını Pages'a yayımlayın. Hazır bir GitHub Actions iş akışı bu pakete eklenmemiştir; kod bilmeden kurulum için yukarıdaki iki yolu kullanın.

### D. Bilgisayarda çalıştırma (isteğe bağlı)

[Node.js](https://nodejs.org) 22 sürümünü kurun. Proje klasöründe terminal açın ve sırayla çalıştırın:

```sh
npm ci
npm run dev
```

Terminalin gösterdiği yerel adresi açın. Kapatmak için terminalde Ctrl+C kullanın. Markdown değiştirdikten sonra sayfayı yenileyin; yeni dosya rotası geliştirme sırasında görünmezse sunucuyu yeniden başlatın. Yayın derlemesi her seferinde klasörü baştan tarar.

```sh
npm run build
npm run preview
```

İlk komut son siteyi `dist/` içine oluşturur. İkincisi oluşturulan siteyi bilgisayarda açar. **Kaynak `.md` dosyaları ve taslaklar `dist/` içine kopyalanmaz.** Manuel yüklemede yalnızca `dist/` içeriğini yükleyin. İçeriği güncelledikten sonra yeniden derlemek gerekir; Git bağlantılı yayın bunu otomatik yapar.

## 3. Bir bölümü gizleme veya silme

- **Geçici gizleme:** Bölümün en üstündeki ön bilgiye `draft: true` ekleyin. Ön bilgi yoksa dosyanın başına üç satır ekleyin: `---`, `draft: true`, `---`. GitHub'da değişikliği kaydedin. Yeni yayında bölümün sayfası, içindekiler kaydı, RSS kaydı ve komşu bağlantıları kaldırılır. Tekrar açmak için `false` yapın veya alanı silin.
- **Kalıcı kaldırma:** GitHub'da ilgili `.md` dosyasını açın, dosya menüsünden **Delete file** seçin ve kaydedin. Bilgisayarınızdaki kopyayı da silin. Diğer dosyaları değiştirmeyin.
- Eski bölümün kayıtlı okuma konumu cihazda bulunabilir; site artık var olmayan bu bölüme devam bağlantısı vermez. İnternette daha önce kopyalanmış veya önbelleğe alınmış bir içerik geri çağrılamaz.

## 4. Kitap adını, yazarı, kapağı ve önsözü değiştirme

Yalnızca **kitap.json** dosyasını düzenleyin. Değerler çift tırnak içinde kalmalı; satırlar arasındaki virgülleri koruyun. Metnin içinde tırnak gerekiyorsa “kıvrımlı tırnak” kullanmak kolaydır. Yeni satır için `\n` yazabilirsiniz.

| Alan | Değiştirdiği bilgi |
| --- | --- |
| `title` | Kitap adı; kapak, menü, telif ve paylaşım başlıkları |
| `subtitle` | Kapaktaki üst başlık |
| `author` | Yazar adı ve telif satırı |
| `description` | Kısa kapak tanıtımı ve ana sayfa SEO açıklaması |
| `epigraph` | Kapak altındaki söz |
| `prefaceTitle` | Önsöz başlığı |
| `preface` | Önsöz metni |
| `dedication` | İthaf |
| `showUniverse` | `true` evren sayfasını açar; `false` sayfayı ve menü bağlantısını kaldırır |
| `coverImage` | Kendi kapak görselinizin dosya yolu; boşsa tipografik kapak kullanılır |
| `siteUrl` | Yayındaki sitenin tam HTTPS adresi |
| `base` | Normal yayında `/`; GitHub Pages proje yolunda `/DEPO-ADI/` |

Önsöz çok paragraflı olacaksa `\n\n` kullanabilirsiniz. Hikayenin evren tanıtımı **evren.md** dosyasındadır. Tema renkleri, yazı tipleri ve boşluklar **src/styles/global.css** dosyasının başındaki değişkenlerdedir. Görsel kimlik için çizilen mühür özgün geometrik bir motiftir; tarihsel bir tamganın bire bir kopyası olduğu iddia edilmez.

### Kendi kapak görseliniz

Görseli `public/kapak.webp` olarak koyun, `kitap.json` içinde `"coverImage": "kapak.webp"` yazın. Dikey, metinsiz ve yaklaşık 200–400 KB boyutunda bir görsel uygundur. Görsel kapakta sakin bir arka plan olarak görünür, başlık ve düğmeler üzerine yerleşir. Boş değerle tamamen SVG/CSS tipografik kapağa dönersiniz.

Sosyal paylaşım için 1200×630 PNG her yayında kitap adı, yazar ve alt başlıktan otomatik üretilir. Bu görsel hikaye illüstrasyonu değildir. Çok uzun kitap adları için `src/pages/sosyal-kapak.png.js` düzeni genişletilebilir. Paylaşım platformları eski görseli bir süre önbellekte tutabilir.

## 5. Okuma deneyimi

- Varsayılan tema sistemin açık/koyu ayarını izler. Okuma sayfasındaki **Aa** ile Aydınlık, Sepya veya Koyu seçilir; **Sistem temasını izle** seçimi sistemi tekrar izlemeye alır.
- Beş yazı boyutu, iki satır aralığı, iki genişlik vardır. Ayarlar bu cihaz ve tarayıcıya özgüdür; cihazlar arasında eşitlenmez.
- Okunan her bölümün konumu ve tamamlanma işareti kaydedilir. Kapaktaki **Kaldığın Yerden Devam Et** son mevcut bölüme döner. Aynı bölüm doğrudan açılırsa da konum geri yüklenir. **Başa dön** sıfırdan okumayı sağlar.
- Çerez veya takip yoktur. localStorage engellense bile metin okunabilir; bu durumda tercihler sonraki ziyarete taşınmayabilir.
- `←` / `→`: önceki/sonraki bölüm. `J` / `K`: aşağı/yukarı. Boşluk: aşağı; Shift+Boşluk: yukarı. Esc: ayar panelini kapatma. Bu kısayollar bir düğme veya alanda odak varken gezinmeyi ele geçirmez.
- Satır uzunluğu yaklaşık 64 veya 72 karakterdir. Fontun `ch` ölçüsü ortalama satır uzunluğunu tam garanti etmez. Türkçe heceleme tarayıcının Türkçe sözlüğü varsa uygulanır.
- Yazdırmak/PDF almak için tarayıcının **Yazdır** menüsünü kullanın. Menü ve okuma araçları gizlenir, beyaz zemin ve kitap paragraf düzeni kullanılır. Yazdırma penceresinde tarayıcıya ait üst/alt bilgi seçeneğini kapatın.
- **Sayfa çevirme/kitap modu bilerek eklenmedi.** Mobilde font, yön ve genişlik değiştiğinde uzun paragrafları bölmek ve konumu korumak ayrı kapsamlı tarayıcı testleri gerektirir. Bu sürüm güvenilir sürekli kaydırmaya odaklanır.

## 6. Erişilebilirlik, gizlilik ve performans

Sayfalar `lang="tr"` kullanır. Fontların Latin ve Latin Extended alt kümeleri site içinden sunulur; Google Fonts/CDN çağrısı yoktur. Font lisansları `public/lisanslar/` altında, font dosyaları derlemede `dist/_astro/` içindedir. Kapak ve ayraç SVG'leri dekoratiftir. Atla bağlantısı, belirgin klavye odağı, doğal dialog odak yönetimi ve azaltılmış hareket tercihi desteklenir. Okumak için JavaScript zorunlu değildir; ayarlar ve ilerleme için gereklidir.

Varsayılan analitik yoktur. İleride isterseniz Umami veya Plausible eklenebilir; bu projeye kurulu değildir. Kendi sunucusunda barındırılan seçenekler bakım gerektirir, yönetilen servisler ücretli olabilir. Eklemeden önce seçtiğiniz servisin gizlilik ve ücret koşullarını değerlendirin.

RSS: `/rss.xml`, site haritası: `/sitemap.xml`, robot kuralları: `/robots.txt`. Özel 404 sayfası statik sağlayıcılar tarafından kullanılır. Özel Sites ön gösterimi erişim korumalı olabilir; herkese açık Netlify/Cloudflare yayınında okur hesabı gerekmez. Sites erişim koruması uygulamaya eklenmiş bir giriş ekranı değildir.

Lighthouse hedefi dört başlıkta 95+ olarak gözetildi; **ölçüm yapılmadan puan garantisi verilmez**. Gerçek yayın, cihaz ve bağlantı sonucu değiştirir. Bu oturumda görsel tarayıcı, gerçek mobil ve yazdırma ekranı doğrulaması yapılamadı. Otomatik içerik ve DOM kontrollerinin sonuçları `KONTROL.md` içindedir.

## 7. Kaynaklar

Kurulum bilgileri 1 Ekim 2026 tarihinde resmî belgelerden kontrol edildi. Sağlayıcı arayüzündeki düğme adları zamanla değişebilir.

- Astro statik yayın: https://docs.astro.build/guides/deploy/
- Netlify proje içe aktarma: https://docs.netlify.com/manage/projects/add-new-project/
- Cloudflare Pages / Astro: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- Netlify plan koşulları: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
