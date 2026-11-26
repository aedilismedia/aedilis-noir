# Aedilis Noir — okuma sitesi

*Aedilis Noir: Günah Körfezi* romanının internetten okunduğu statik site. Kut Mührü sitesinin okuma motoru üzerine kuruldu: Astro ile derlenir, veritabanı, kullanıcı hesabı, reklam ve ziyaretçi takibi yoktur. Okuma tercihleri ve ilerleme yalnızca okurun kendi tarayıcısında tutulur.

Adres: **https://aedilisnoir.aedilismedia.com**

## Yeni bölüm ekleme

1. `bolumler/` klasörüne `Bölüm 01.md`, `Bölüm 02.md` … adıyla bir dosya ekle (UTF-8).
2. Dosyanın başına başlığı yaz:

```markdown
---
title: "Memlekete Hoş Geldin"
date: 2026-12-01
---

İlk paragraf.

* * *

Sahne geçişinden sonraki paragraf.
```

3. GitHub'da **Add file → Upload files** ile yükle ve **Commit changes** de. `main` dalına gelen her değişiklik siteyi derleyip Hostinger'a yükler.

İçindekiler, önceki/sonraki bağlantıları, kapaktaki bölüm sayacı, RSS ve site haritası kendiliğinden güncellenir. Numara dosya adından alınır; yayımladıktan sonra numarayı değiştirme, adres de değişir. Yarım bir bölümü `draft: true` ile gizleyebilirsin.

**Süreklilik raporu ve yazar notları bu repoya konmaz.** Bölüm dosyasında yalnızca roman metni durur. Obsidian'daki `%% not %%` yorumları yayımlanmaz, ama gizli arşiv bilgisini hiçbir biçimde bu repoya yazma.

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


## Karakterler (spoiler korumalı)

Her karakter `karakterler/` içinde tek bir `.md` dosyasıdır. `chapter` alanı karakterin ilk göründüğü bölümdür: okur o bölüme gelmeden kart gizli kalır ve bölüm sonunda "Kilidi açılanlar" altında görünür. Okur isterse uyarıyı onaylayıp hepsini açabilir, bu yüzden karakter metinlerine yalnızca ilk göründükleri bölümün verdiği bilgiyi yaz.

```markdown
---
name: "Tamer Vural"
role: "Hikâyenin merkezindeki adam"
age: 41
image: "karakterler/tamer-vural.webp"   # public/ altında; boşsa "Portre hazırlanıyor" görünür
imagePosition: "50% 35%"
portraitNote: "Temsili portre"
order: 1
chapter: 1
---
Kısa, spoilersız tanıtım.
```

## Sabit sayfalar

| Sayfa | Dosya |
| --- | --- |
| Kapak tanıtımı, yazar, hedef bölüm sayısı | `kitap.json` |
| Evren | `evren.md` |
| Valara | `valara.md` |
| Okur sözlüğü (bölümlerde `*` ile açıklanan kelimeler) | `src/data/sozluk.json` |

`kitap.json` içindeki `preface` doldurulursa kapağın altında "Okura bir not" bölümü çıkar; boşsa hiç görünmez. `plannedChapters` kapakta "00 / 40 BÖLÜM" sayacını besler.

Bölümler sırayla açılır. Yazar önizlemesi için adrese `?kilitleri-ac` ekle, geri almak için `?kilitleri-kapat`.

## Yayın

`.github/workflows/hostinger-deploy.yml` her push'ta `npm ci && npm run build` çalıştırır ve `dist/` klasörünü FTPS ile yükler. FTP hesabı yalnızca `public_html/aedilisnoir` klasörüne açılan ayrı bir hesaptır (hPanel → FTP Hesapları). Gerekli GitHub Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`. Secret yoksa derleme yine yapılır, yükleme atlanır.

Bir kerelik Hostinger ayarı: **Domains → Subdomains** altında `aedilisnoir.aedilismedia.com` alt alan adını oluştur ve kök klasörünü `public_html/aedilisnoir` yap.

## Yerelde çalıştırma

```
npm install
npm run dev      # http://localhost:4173
npm run build    # yalnızca dist/ üretir
```

Node 22 önerilir.

## Tasarım

Gece paleti Görsel Kimlik belgesindeki taslak renklerden alındı: lacivert `#121A30`, sodyum lambası amberi `#E6A345`, neon pembe `#D63779`, camgöbeği `#25B9C1`. Başlıklar Playfair Display, kapak üst yazısı Special Elite, metin Source Serif 4. Renk değişkenleri `src/styles/global.css` başındadır. Fontların lisansları `public/lisanslar/` içindedir.
