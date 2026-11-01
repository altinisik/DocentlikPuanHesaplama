# Doçentlik Puan Hesaplama Aracı

**Sosyal, Beşeri ve İdari Bilimler temel alanı · ÜAK Tablo 11**

Doçentlik başvurusu için eser ve faaliyetlerinizden aldığınız puanı, madde tavanlarını ve zorunlu koşulları hesaplayan bir araç. Excel şablonunu doldurup yüklemeniz ya da eserlerinizi doğrudan sayfaya girmeniz yeterli. Şu an yedi temel alan için çalışıyor; Sosyal, Beşeri ve İdari Bilimler dışındakiler beta aşamasında (aşağıya bakın).

👉 **Araca buradan ulaşabilirsiniz:** [https://altinisik.ezgilab.com/DocentlikPuanHesaplama/](https://altinisik.github.io/DocentlikPuanHesaplama/){.uri}

> Bu araç bilgilendirme amaçlıdır. Resmî değerlendirme ÜAK jürisi tarafından yapılır. Başvurudan önce kriterlerin güncel metnini [uak.gov.tr](https://www.uak.gov.tr) adresinden kontrol edin.

------------------------------------------------------------------------

## Bu sürümde neler değişti?

Önceki sürüm R/Shiny ile yazılmıştı ve shinyapps.io üzerinde çalışıyordu. O sürümde puanlamayla ilgili bazı hatalar vardı. Ayrıca sunucu sık sık yavaşlıyor ya da çöküyordu. Ayrıca shinyapps artık desteklenmeyecek, o yüzden taşımak gerekiyordu.

Araç, kolay erişim için **Claude Opus 5.5 ile baştan yeniden yazıldı**. Artık sunucu gerektirmiyor: doğrudan tarayıcınızda çalışıyor, hızlı açılıyor ve verileriniz yine hiçbir yere gönderilmiyor. Yaptığım kontrollerde hesap hatası görünmüyor. Ancak gözünüze çarpan bir hata olursa lütfen bilgilendirin.

### Desteklenen temel alanlar

| Tablo | Temel alan | Durum | Doğrudan bağlantı |
|---|---|---|---|
| 1 | Eğitim Bilimleri | Beta | [#tablo-01](https://altinisik.ezgilab.com/DocentlikPuanHesaplama/#tablo-01) |
| 2 | Fen Bilimleri ve Matematik | Beta | [#tablo-02](https://altinisik.ezgilab.com/DocentlikPuanHesaplama/#tablo-02) |
| 5 | Hukuk | Beta | [#tablo-05](https://altinisik.ezgilab.com/DocentlikPuanHesaplama/#tablo-05) |
| 9 | Mühendislik | Beta | [#tablo-09](https://altinisik.ezgilab.com/DocentlikPuanHesaplama/#tablo-09) |
| 10 | Sağlık Bilimleri | Beta | [#tablo-10](https://altinisik.ezgilab.com/DocentlikPuanHesaplama/#tablo-10) |
| 11 | Sosyal, Beşeri ve İdari Bilimler | Kontrol edildi | [#tablo-11](https://altinisik.ezgilab.com/DocentlikPuanHesaplama/#tablo-11) |
| 12 | Ziraat, Orman ve Su Ürünleri | Beta | [#tablo-12](https://altinisik.ezgilab.com/DocentlikPuanHesaplama/#tablo-12) |

> **Beta** olan alanların kuralları ÜAK’ın yayımladığı tablolardan aktarıldı ve testlerle kontrol edildi, ancak henüz o alandan biri tarafından gerçek bir başvuru dosyasıyla doğrulanmadı. Bu alanlardan birindeyseniz ve sonucu kendi hesabınızla karşılaştırabilirseniz çok yardımcı olur. Doğrulanan alanların beta işareti kaldırılacak.
>
> Her alanın puan tablosu, sayfanın altındaki **Hesaplama nasıl yapılıyor? → Puan tablosu** bölümünde ÜAK tablosuyla karşılaştırılabilecek şekilde listelenir.

## Nasıl kullanılır?

1.  Sayfanın üstündeki **Temel alan** listesinden alanınızı seçin, ardından **Boş şablonu indir** düğmesine tıklayın. Şablon seçtiğiniz alana göre hazırlanır.
2.  Şablonu aşağıdaki açıklamalara göre doldurup kaydedin.
3.  **Excel dosyası yükle** düğmesiyle dosyayı yükleyin ya da dosyayı sayfaya sürükleyip bırakın.
4.  Sonuçlarınız anında görünür:
    - toplam puanınız ve doktora sonrası puanınız (100 ve 90 çizgileriyle birlikte),
    - zorunlu koşulların listesi ve her birinin durumu,
    - madde bazında döküm,
    - eksik ya da tutarsız bilgi içeren satırlar için uyarılar.

Şablon kullanmadan **Satır ekle** düğmesiyle eserlerinizi doğrudan sayfaya da girebilirsiniz. Yaptığınız değişiklikler tarayıcınızda otomatik saklanır, sayfayı kapatıp açtığınızda kaldığınız yerden devam edersiniz. Ancak, arkaplanda bir sunucu çalışmadığından verileriniz yalnızca kendi tarayıcınızda kalır. **Excel olarak kaydet** düğmesi listenizi ve hesap sonuçlarınızı bir Excel dosyasına indirir. Bu dosyayı daha sonra tekrar yükleyebilirsiniz.

Aracı önce denemek isterseniz **Örnek veriyle dene** düğmesi kurgusal bir adayın dosyasını yükler.

### ORCID’den yayın aktarma (beta)

Yayınlarınızı tek tek yazmak yerine ORCID kaydınızdan çekebilirsiniz: [https://altinisik.ezgilab.com/DocentlikPuanHesaplama/orcid.html](https://altinisik.ezgilab.com/DocentlikPuanHesaplama/orcid.html)

1.  ORCID numaranızı ve doktora unvanını aldığınız yılı girip **Yayınları getir** düğmesine tıklayın.
2.  Kaydınızdaki yayınlar bir önizleme tablosunda listelenir. Tablo şunları içerir:
    - başlık, tür, yıl ve dergi/kitap/toplantı adı,
    - DOI’si olan yayınlar için Crossref’ten alınan yazar sayısı,
    - yayın yılına göre doktora öncesi/sonrası bilgisi (doktora yılıyla aynı yıl olanlar boş bırakılır).
3.  Her yayın için **maddeyi siz seçin**. Yayının türüne göre önerilen maddeler listenin başında yer alır. Turuncu alanlar eksik bilgileri gösterir.
4.  **Seçilenleri listeye ekle** düğmesiyle yayınlar hesaplama sayfasındaki listenize eklenir. Listenizde zaten olan yayınlar (aynı DOI ya da başlık) tekrar eklenmez.
5.  Atıf, proje, danışmanlık, ders gibi diğer kalemleri hesaplama sayfasında ekleyin.

> ⚠️ **Bu özellik deneme aşamasındadır.** Puan, yalnızca ORCID kaydınızdaki bilgiler kadar doğru hesaplanabilir. ORCID kaydınızda eksik, tekrarlı ya da hatalı yayın varsa sonuç da yanlış olur. Ayrıca:
>
> - İndeks (SSCI, ESCI, Scopus, TR Dizin) ve Q dilimi ORCID’de bulunmaz; maddeyi her yayın için sizin seçmeniz gerekir. Madde seçilmeyen yayınlar puan almaz.
> - DOI’si olmayan yayınlarda yazar sayısını kendiniz girin. Boş bırakılırsa tek yazarlı kabul edilir ve puanınız olduğundan yüksek görünebilir.
> - Yayının tezden üretilip üretilmediği ORCID’de yoktur. Tezden üretilen yayınlar için 3. maddeden bir bent seçin ve hesaplama sayfasında “Tezden” sütununu **E** yapın.

### Gizlilik

Eser listeniz hiçbir sunucuya gönderilmez. Tüm hesaplama tarayıcınızda yapılır ve veriler yalnızca sizin tarayıcınızda saklanır. ORCID’den aktarma özelliğini kullanırsanız tarayıcınız ORCID numaranızla doğrudan ORCID’e (pub.orcid.org), DOI’li yayınlar için de Crossref’e (api.crossref.org) istek gönderir; bu istekler herkese açık kayıtları okur ve bu sitenin herhangi bir sunucusundan geçmez. Ortak kullanılan bir bilgisayardaysanız, işiniz bitince **Listeyi temizle** düğmesini kullanın.

------------------------------------------------------------------------

## Şablon nasıl doldurulur?

Her temel alanın kendi şablonu vardır; madde listesi ve bazı sütunlar alana göre değişir. Şablonda üç sayfa vardır. **Eserler** sayfasına eserlerinizi, **Ayarlar** sayfasına kişisel durumunuzu girersiniz. **Kılavuz** sayfasında o alanın bütün maddeleri ve puanları bulunur. Sarı hücreler girdi alanıdır.

Şablonun Ayarlar sayfasında temel alan da yazılıdır. Dosyayı yüklediğinizde hesaplama otomatik olarak o alana göre yapılır.

### Ayarlar sayfası

| Ayar | Ne seçmeli? |
|------------------------------------|------------------------------------|
| **Temel alan** | Şablonun hazırlandığı tablo. Değiştirmenize gerek yoktur. |
| **Bilim alanı** | Yalnızca iki tabloda vardır. **Sosyal, Beşeri ve İdari Bilimler:** Görsel İletişim Tasarımı, İletişim Çalışmaları, Reklamcılık, Sinema veya Halkla İlişkiler alanından başvuruyorsanız alanınızı seçin; bu alanlarda 13. maddeden ek bir şart aranır. Diğer herkes **Diğer** seçer. **Fen Bilimleri ve Matematik:** Alanınızı seçmeniz zorunludur; 1. maddedeki puan şartı Biyoloji, Fizik, Kimya, Moleküler Biyoloji ve Genetik için 40, Matematik ve İstatistik için 20’dir. |
| **Yabancı uyruk / yurt dışı denklik** | Yabancı uyrukluysanız ya da yurt dışı doçentlik denkliği için başvuruyorsanız **E** seçin. |
| **2 yıl kadrolu görev** | Doktoradan (Sağlık Bilimlerinde doktora ya da uzmanlıktan) sonra yükseköğretim kurumunda en az 2 yıl kadrolu öğretim elemanı olarak çalıştıysanız **E** seçin. Bu durumda 9. maddeden 2 puan almış sayılırsınız. Sağlık Bakanlığı hastanelerindeki görev bu şartı karşılamaz (ÜAK SSS 42). |
| **Unvan Aralık 2016’dan önce** | Doktora (ya da uzmanlık) unvanınızı Aralık 2016’dan önce aldıysanız **E** seçin. Bu durumda 3. maddedeki “en az bir yayın” şartı aranmaz (ÜAK SSS 59). |

### Eserler sayfası

Her eser ya da faaliyet için bir satır doldurun.

| Sütun | Açıklama |
|------------------------------------|------------------------------------|
| **Eser / Faaliyet** | Eserin kısa adı. Kendinizin tanıyacağı bir ad yeterli. Aynı eseri iki ayrı satıra yazmayın; her çalışma yalnızca bir maddede puanlanır. |
| **Madde** | Açılır listeden seçin. Listede madde kodu ve açıklaması birlikte yer alır. Çeyreklik dilimi (Q1–Q4), danışmanlık türü ve projedeki rol de bu listede ayrı seçenekler olarak bulunur. |
| **Doktora Sonrası (E/H)** | Eser doktora unvanını aldıktan sonra yayımlandıysa ya da faaliyet doktoradan sonra yapıldıysa **E**, önceyse **H**. Boş bırakırsanız doktora öncesi kabul edilir. |
| **Yazar / Kişi Sayısı** | Makale, kitap, bölüm, bildiri ve patentlerde toplam yazar sayısı. Puan bu sayıya eşit bölünür. Tek yazarlıysanız **1** yazın. |
| **Başlıca Yazar** | Yalnızca Fen Bilimleri ve Matematik, Mühendislik, Sağlık Bilimleri ve Ziraat şablonlarında vardır. Çok yazarlı makalelerde “Başlıca yazar benim”, “Başlıca yazar başkası” ya da “Başlıca yazar belirtilmemiş” seçin; makale puanı buna göre hesaplanır. Başlıca yazarın tanımı şablonun Kılavuz sayfasında ve aracın puanlama kurallarında yazılıdır. Boş bırakılırsa puan eşit bölünür ve uyarı verilir. |
| **Adet** | Yalnızca iki yerde kullanılır: atıflarda (5. madde) atıf sayısı, eğitim-öğretimde (9. madde) farklı yarıyıl ya da yıl sayısı. Diğer satırlarda boş bırakın. |
| **Dergi / Kitap / Toplantı Adı** | Bazı kurallar bu sütuna göre kontrol edilir; ayrıntılar aşağıda. Aynı dergi, kitap ya da toplantı için her satırda **aynı adı** yazın. |
| **Kendim Sundum (E/H)** | Yalnızca Hukuk şablonunda vardır. 8. madde bildirilerinde, bildiriyi kendiniz sunduysanız **E**. Hukukta en az bir bildiriyi adayın kendisinin sunmuş olması gerekir. |
| **Tezden Üretildi (E/H)** | Yayın yüksek lisans ya da doktora tezinizden üretildiyse **E**. Bu durumda Madde sütununda 3. maddeden bir bent seçmelisiniz. |
| **Not** | İsteğe bağlı; hesaba girmez. |

### Dergi, kitap ve toplantı adı neden önemli?

Bu sütun üç kuralın kontrolünde kullanılır:

- **TR Dizin makaleleri (2a):** Ulusal makale şartı, beş yayının farklı dergilerde olmasını ister. Dergi adını yazmazsanız her makale ayrı bir dergide sayılır ve araç bunun için uyarı verir.
- **Kitap bölümleri (4b, 4d):** Aynı kitaptan yalnızca bir bölüm puanlanır. Burada kitabın adını yazın.
- **Bildiriler (8. madde):** Aynı toplantıdan yalnızca bir çalışma puanlanır. Burada toplantının adını yazın.

Aynı kitap ya da toplantıdan birden fazla satır varsa, araç en yüksek puanlı olanı sayar ve diğerlerinin yanına not düşer.

### Sık karşılaşılan durumlar

| Durum | Madde | Doktora Sonrası | Yazar | Adet | Dergi / Kitap / Toplantı |
|------------|------------|------------|------------|------------|------------|
| Doktoradan sonra 3 yazarlı SSCI Q2 makale | 1a-Q2 | E | 3 |  | Dergi adı |
| Tek yazarlı TR Dizin makalesi | 2a | E | 1 |  | Dergi adı |
| Doktora tezinden üretilmiş Scopus makalesi | 3b (Tezden: E) | E | 2 |  | Dergi adı |
| Derleme kitapta tek yazarlı bölüm (BKCI değil) | 4d | E | 1 |  | Kitap adı |
| WoS/Scopus’ta 7 atıf | 5a | E |  | 7 |  |
| Yüksek lisans tezinde eş danışmanlık | 6b-Eş | E |  |  |  |
| TÜBİTAK 1001 projesinde araştırmacılık | 7a-Araştırmacı | E |  |  |  |
| İki yazarlı ulusal kongre bildirisi | 8b | E | 2 |  | Kongre adı ve yılı |
| Dönemlik programda 6 farklı yarıyıl ders | 9a | E |  | 6 |  |

**Atıflar için ipucu:** Her atıfı ayrı satıra yazmanız gerekmez. Her bent (5a, 5b, 5c, 5d) için tek satır açıp toplam atıf sayısını Adet sütununa yazabilirsiniz. Doktora sonrası şartı, atıf alan eserinizin doktora sonrası yayımlanmış olmasına göre değerlendirilir. Atıflarınızın bir kısmı doktora öncesi, bir kısmı doktora sonrası eserlerinize yapıldıysa bunları iki ayrı satıra bölün. Kendi eserlerinize yaptığınız atıfları saymayın; aynı yayında aynı eserinize yapılan birden fazla atıf tek atıf sayılır.

------------------------------------------------------------------------

## Hesaplama kuralları

- **Puanın yazarlar arasında bölünmesi alana göre değişir:**
  - Eğitim Bilimleri, Hukuk ve Sosyal, Beşeri ve İdari Bilimler: yayın, bildiri ve patentlerde puan yazar ya da kişi sayısına eşit bölünür.
  - Fen Bilimleri ve Matematik, Mühendislik, Sağlık Bilimleri ve Ziraat: makalelerde (1a–1d, 2a–2b, 3a–3d) tek yazarlıda tam puan; iki yazarlıda başlıca yazar 0,8, diğer yazar 0,5; üç ve daha fazla yazarlıda başlıca yazar puanın yarısını, diğer yazarlar kalan yarısını eşit paylaşır. Başlıca yazar belirtilmemişse puan eşit bölünür. Bildiri, kitap ve patentlerde puan eşit bölünür.
  - Atıf, proje, danışmanlık, ödül, editörlük ve 13. madde faaliyetleri hiçbir alanda bölünmez (ÜAK SSS 26).
- **Toplam puan:** Madde tavanları uygulandıktan sonra tüm eserlerinizin toplamıdır. Doktora öncesi puana ayrıca bir sınır konmaz.
- **Doktora sonrası puan:** Doktora unvanından sonraki çalışmalardan alınan puandır. 3. madde (tezden üretilmiş yayın) bu toplama hiç girmez.
- **Başvuru şartı:** Toplamın en az 100, doktora sonrası puanın en az 90 olması ve tüm zorunlu koşulların sağlanmasıdır.
- **Tavanı aşan maddeler:** Bir madde tavanını aşarsa, önce doktora sonrası puanlar sayılır. Bu, 90 puan şartı açısından adayın lehine olan yorumdur.
- **Eğitim-öğretim (9. madde):** 9a’da 4 farklı yarıyıl, 9b’de 2 farklı yıl 2 puan eder. Doktora sonrası 2 yıl kadrolu görev 2 puan almış sayılır ama ders puanına eklenmez. Bu maddeden en fazla 6 puan alınır.
- **Sağlık Bilimleri:** “Doktora sonrası” her yerde doktora ya da tıpta, diş hekimliğinde, eczacılıkta ve veteriner hekimlikte uzmanlık unvanından sonra demektir.

### Kontrol edilen zorunlu koşullar

Bütün alanlarda ortak olanlar:

- Toplam en az 100 puan; doktora sonrası (3. madde hariç) en az 90 puan
- **3. madde:** a–h bentlerinden en az bir yayın (unvanı Aralık 2016’dan önce alanlar için aranmaz)
- **5. madde:** Doktora sonrası yayınlara yapılan atıflardan en az 5 puan
- **8. madde:** Doktora sonrası bilimsel toplantılardan en az 5 puan
- **9. madde:** En az 2 puan

Alana göre değişenler:

| Alan | 1. madde | 2. madde | Diğer |
|---|---|---|---|
| Eğitim Bilimleri | Q1–Q3 makalelerden ≥30 puan | Biri 2a’dan en az iki yayın | 7. madde tavanı 15 |
| Fen Bilimleri ve Matematik | 1a’dan 40 (Matematik, İstatistik: 20) puan; en az bir Q1–Q3 makalede başlıca yazar | 2a’dan ≥10 puan | 7. madde tavanı 30 |
| Hukuk | Yok | 2a’dan en az altı yayın (dördü tek yazarlı, en az üç farklı dergi) ve ≥50 puan; ya da 1a–1c’den biri tek yazarlı en az iki yayın ve ≥50 puan | 4. madde: en az bir kitap zorunlu, genel tavan yok, 4c + 4d en fazla 30; 8. madde: en az bir bildiriyi kendisi sunmuş olmalı |
| Mühendislik | 1a’dan 40 puan; en az bir Q1–Q3 makalede başlıca yazar | 2a’dan ≥10 puan | 7. madde tavanı 30; 3ı 5 puan |
| Sağlık Bilimleri | 1a’dan ≥40 puan; en az üç makalede başlıca yazar | İkisi 2a’dan en az üç yayın; en az ikisinde başlıca yazar | 1f (vaka takdimi) 5 puan |
| Sosyal, Beşeri ve İdari Bilimler | 1a–1d’den ≥10 puan | Üçü tek yazarlı, farklı dergilerde en az beş TR Dizin makalesi; ya da 1a/1b’den biri tek yazarlı en az üç yayın | 4. madde: bir kitap ya da iki bölüm zorunlu; 13. madde: iletişim alanlarına ek şart |
| Ziraat, Orman ve Su Ürünleri | 1a’dan ≥30 puan; Q1–Q3 makalelerden ≥20 puan ve birinde başlıca yazar | 2a’dan ≥20 puan | 7. madde tavanı 60 |

Yabancı uyruklu ve yurt dışı denklik başvurusu yapan adaylarda, TR Dizin şartı 1a–1c yayınlarıyla karşılanabilir. Şart puan cinsindeyse istenen her 10 puan için bir yayın aranır.

### Yoruma açık noktalar

Yönetmelik metni bazı yerlerde birden fazla şekilde okunabiliyor. Araçta şu yorumlar kullanıldı:

- **5. madde:** Asgari 5 puan, doktora sonrası yayımlanmış eserlere yapılan atıflardan karşılanmalıdır; doktora öncesi eserlere yapılan atıflar da toplam puana sayılır. ÜAK SSS 28 bu yorumu doğruluyor.
- **2. madde (Sosyal, Beşeri ve İdari Bilimler):** “Farklı dergilerde beş yayın” ifadesi, beş yayının en az beş ayrı dergide olması olarak yorumlandı.
- **2. maddenin 1a/1b alternatifi (Sosyal, Beşeri ve İdari Bilimler):** Yayınların doktora sonrası olması arandı.
- **Başlıca yazar kuralının kapsamı:** Kural 1a–1d, 2a–2b ve 3a–3d makalelerine uygulandı; editöre mektup, not, özet, kitap kritiği (1e, 2c) ve vaka takdimi (1f) eşit bölündü.
- **Fen Bilimleri ve Mühendislik, 1. madde:** 40 (ya da 20) puan bütün 1a makalelerinden sayılır; en az bir Q1–Q3 makalede başlıca yazarlık ayrıca aranır.
- **Ziraat, 1. madde:** 1a’dan toplam en az 30 puan; buna ek olarak Q1–Q3 makalelerinden en az 20 puan ve bunlardan en az birinde başlıca yazarlık arandı.
- **Eğitim Bilimleri ve Sağlık Bilimleri, 2. madde:** Yayın sayısına 2c (editöre mektup vb.) de dahil edildi.
- **Hukuk, 2. madde:** 50 puan 2a makalelerinden (alternatif yolda 1a–1c makalelerinden) sayılır; “üçü farklı dergilerde” ifadesi, altı yayının en az üç ayrı dergide olması olarak yorumlandı.
- **Hukuk, 8. madde:** En az bir bildiriyi adayın kendisinin sunması şartı arandı. ÜAK SSS 31, bildirinin puan alması için yazarlardan herhangi birinin sunmasının yeterli olduğunu söyler; bu ek şart yalnızca Hukuk tablosundaki zorunlu koşul içindir.
- **Hesaplanamayan kurallar:** Eserlerin başvurulan bilim alanıyla ilgili olması, kitap bölümlerinin alanla ilgisi ve bilimsel toplantının düzenleme komitesi şartı araç tarafından kontrol edilemez. Bunları sizin kontrol etmeniz gerekir.

------------------------------------------------------------------------

## Hata bildirimi ve katkı

Yanlış hesaplandığını düşündüğünüz bir durum fark ederseniz lütfen bu repoda bir **Issue** açın ya da bana ulaşın. Mümkünse ilgili satırları (eser adları olmadan) ve beklediğiniz sonucu da ekleyin.

### Geliştiriciler için

| Dosya | İçerik |
|------------------------------------|------------------------------------|
| `index.html` | Sayfa ve stiller |
| `js/kurallar/tabloNN.js` | Her temel alanın kuralları: puanlar, tavanlar, alt tavanlar, bölme kuralı, zorunlu koşullar ve yorumlar. Kriterler değişince yalnızca ilgili dosya güncellenir. |
| `js/kurallar/ortak.js` | Tablolarda ortak kalem grupları, zorunlu koşul yapı taşları (`puan`, `sayi`, `dergi`, `ve`, `veya`, `yabanci`) ve tablo kaydı |
| `js/kurallar/hepsi.js` | Node için bütün tabloları yükler |
| `js/hesap.js` | Hesap motoru; kural dosyalarını okur, arayüzden ve temel alandan bağımsızdır, Node’da da çalışır. |
| `js/app.js` | Arayüz, Excel okuma ve yazma |
| `orcid.html` | ORCID’den yayın aktarma sayfası (beta) |
| `js/orcid-veri.js` | ORCID ve Crossref yanıtlarını ayrıştıran yardımcılar; Node’da da çalışır. |
| `js/orcid-app.js` | ORCID sayfasının arayüzü; hesaplama sayfasıyla aynı tarayıcı deposunu kullanır. |
| `sablon/` | Her temel alan için boş şablon (`tablo-NN_sablon.xlsx`) ve örnek dosya. `docentlik_sablon.xlsx`, eski bağlantılar için Tablo 11 şablonunun kopyasıdır. |
| `araclar/sablon_uret.py` | Şablonları kural dosyalarından yeniden üretir. Node ve `openpyxl` gerekir. |
| `test/` | `hesap.test.js` (Tablo 11), `tablolar.test.js` (bütün tablolar: tutarlılık, PDF değerleri, senaryolar), `orcid.test.js` |

Kriterler değiştiğinde izlenecek adımlar:

1.  İlgili `js/kurallar/tabloNN.js` dosyasını güncelleyin. Zorunlu koşullar da bu dosyadadır; motoru değiştirmeniz gerekmez.
2.  Şablonları yeniden üretin: `python3 araclar/sablon_uret.py`
3.  Testleri çalıştırın: `node --test test/hesap.test.js test/tablolar.test.js test/orcid.test.js`
4.  `test/tablolar.test.js` içindeki “PDF ile aynı” testlerinde değişen değerleri de güncelleyin; bu testler kuralların PDF’ten ikinci kez okunmuş hâlidir.

JavaScript dosyalarından birini değiştirdiğinizde `index.html` ve `orcid.html`’deki `?v=2.0` sürüm etiketini artırın (ör. `?v=2.1`). Böylece kullanıcıların tarayıcısı önbellekteki eski dosyalar yerine yenilerini yükler.

Yeni bir temel alan eklemek için mevcut bir tablo dosyasını kopyalayıp farklarını düzenleyin, dosyayı `hepsi.js`’e, `index.html` ve `orcid.html`’deki `<script>` listesine ekleyin. Kural dosyasında `beta: true` olan alanlar arayüzde Beta rozetiyle gösterilir; bir alan doğrulandığında bunu `false` yapmanız yeterlidir. Mevcut yapı taşlarıyla ifade edilemeyen bir koşul çıkarsa `hesap.js` içindeki `degerlendir` fonksiyonuna yeni bir tip eklenir.

Aracı yerelde çalıştırmak için bir web sunucusu gerekir; `index.html` dosyasını doğrudan açarsanız örnek dosya yüklenemez:

``` bash
python3 -m http.server 8000   # ardından http://localhost:8000
```

Excel işlemleri için [SheetJS](https://sheetjs.com) (0.18.5) kullanılır. ORCID sayfası anahtarsız erişilebilen [ORCID Public API](https://info.orcid.org/documentation/features/public-api/) ve [Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) kullanır.

Kaynak kodu serbestçe kullanabilir, diğer temel alanlar için uyarlayabilirsiniz.

------------------------------------------------------------------------

Claude Opus 5.5 ile yeniden yazılmıştır.
