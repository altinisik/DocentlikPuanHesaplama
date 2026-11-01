# Doçentlik Puan Hesaplama Aracı

**Sosyal, Beşeri ve İdari Bilimler temel alanı · ÜAK Tablo 11**

Doçentlik başvurusu için eser ve faaliyetlerinizden aldığınız puanı, madde tavanlarını ve zorunlu koşulları hesaplayan bir araç. Excel şablonunu doldurup yüklemeniz ya da eserlerinizi doğrudan sayfaya girmeniz yeterli. Şu an yalnızca sosyal bilimler alanları için çalışıyor.

👉 **Araca buradan ulaşabilirsiniz:** [https://altinisik.ezgilab.com/DocentlikPuanHesaplama/](https://altinisik.github.io/DocentlikPuanHesaplama/){.uri}

> Bu araç bilgilendirme amaçlıdır. Resmî değerlendirme ÜAK jürisi tarafından yapılır. Başvurudan önce kriterlerin güncel metnini [uak.gov.tr](https://www.uak.gov.tr) adresinden kontrol edin.

------------------------------------------------------------------------

## Bu sürümde neler değişti?

Önceki sürüm R/Shiny ile yazılmıştı ve shinyapps.io üzerinde çalışıyordu. O sürümde puanlamayla ilgili bazı hatalar vardı. Ayrıca sunucu sık sık yavaşlıyor ya da çöküyordu. Ayrıca shinyapps artık desteklenmeyecek, o yüzden taşımak gerekiyordu.

Araç, kolay erişim için **Claude Opus 5.5 ile baştan yeniden yazıldı**. Artık sunucu gerektirmiyor: doğrudan tarayıcınızda çalışıyor, hızlı açılıyor ve verileriniz yine hiçbir yere gönderilmiyor. Yaptığım kontrollerde hesap hatası görünmüyor. Ancak gözünüze çarpan bir hata olursa lütfen bilgilendirin.

## Nasıl kullanılır?

1.  Araç sayfasında **Boş şablonu indir** düğmesine tıklayın.
2.  Şablonu aşağıdaki açıklamalara göre doldurup kaydedin.
3.  **Excel dosyası yükle** düğmesiyle dosyayı yükleyin ya da dosyayı sayfaya sürükleyip bırakın.
4.  Sonuçlarınız anında görünür:
    - toplam puanınız ve doktora sonrası puanınız (100 ve 90 çizgileriyle birlikte),
    - zorunlu koşulların listesi ve her birinin durumu,
    - madde bazında döküm,
    - eksik ya da tutarsız bilgi içeren satırlar için uyarılar.

Şablon kullanmadan **Satır ekle** düğmesiyle eserlerinizi doğrudan sayfaya da girebilirsiniz. Yaptığınız değişiklikler tarayıcınızda otomatik saklanır, sayfayı kapatıp açtığınızda kaldığınız yerden devam edersiniz. Ancak, arkaplanda bir sunucu çalışmadığından verileriniz yalnızca kendi tarayıcınızda kalır. **Excel olarak kaydet** düğmesi listenizi ve hesap sonuçlarınızı bir Excel dosyasına indirir. Bu dosyayı daha sonra tekrar yükleyebilirsiniz.

Aracı önce denemek isterseniz **Örnek veriyle dene** düğmesi kurgusal bir adayın dosyasını yükler.

### Gizlilik

Eser listeniz hiçbir sunucuya gönderilmez. Tüm hesaplama tarayıcınızda yapılır ve veriler yalnızca sizin tarayıcınızda saklanır. Ortak kullanılan bir bilgisayardaysanız, işiniz bitince **Listeyi temizle** düğmesini kullanın.

------------------------------------------------------------------------

## Şablon nasıl doldurulur?

Şablonda üç sayfa vardır. **Eserler** sayfasına eserlerinizi, **Ayarlar** sayfasına kişisel durumunuzu girersiniz. **Kılavuz** sayfasında tüm maddelerin listesi ve puanları bulunur. Sarı hücreler girdi alanıdır.

### Ayarlar sayfası

| Ayar | Ne seçmeli? |
|------------------------------------|------------------------------------|
| **Bilim alanı** | Görsel İletişim Tasarımı, İletişim Çalışmaları, Reklamcılık, Sinema veya Halkla İlişkiler alanından başvuruyorsanız alanınızı seçin; bu alanlarda 13. maddeden ek bir şart aranır. Diğer herkes **Diğer** seçer. |
| **Yabancı uyruk / yurt dışı denklik** | Yabancı uyrukluysanız ya da yurt dışı doçentlik denkliği için başvuruyorsanız **E** seçin. |
| **2 yıl kadrolu görev** | Doktoradan sonra yükseköğretim kurumunda en az 2 yıl kadrolu öğretim elemanı olarak çalıştıysanız **E** seçin. Bu durumda 9. maddeden 2 puan almış sayılırsınız. |

### Eserler sayfası

Her eser ya da faaliyet için bir satır doldurun.

| Sütun | Açıklama |
|------------------------------------|------------------------------------|
| **Eser / Faaliyet** | Eserin kısa adı. Kendinizin tanıyacağı bir ad yeterli. Aynı eseri iki ayrı satıra yazmayın; her çalışma yalnızca bir maddede puanlanır. |
| **Madde** | Açılır listeden seçin. Listede madde kodu ve açıklaması birlikte yer alır. Çeyreklik dilimi (Q1–Q4), danışmanlık türü ve projedeki rol de bu listede ayrı seçenekler olarak bulunur. |
| **Doktora Sonrası (E/H)** | Eser doktora unvanını aldıktan sonra yayımlandıysa ya da faaliyet doktoradan sonra yapıldıysa **E**, önceyse **H**. Boş bırakırsanız doktora öncesi kabul edilir. |
| **Yazar / Kişi Sayısı** | Makale, kitap, bölüm, bildiri ve patentlerde toplam yazar sayısı. Puan bu sayıya eşit bölünür. Tek yazarlıysanız **1** yazın. |
| **Adet** | Yalnızca iki yerde kullanılır: atıflarda (5. madde) atıf sayısı, eğitim-öğretimde (9. madde) farklı yarıyıl ya da yıl sayısı. Diğer satırlarda boş bırakın. |
| **Dergi / Kitap / Toplantı Adı** | Bazı kurallar bu sütuna göre kontrol edilir; ayrıntılar aşağıda. Aynı dergi, kitap ya da toplantı için her satırda **aynı adı** yazın. |
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

- Yayın, bildiri ve patentlerde puan yazar ya da kişi sayısına eşit bölünür. Atıf, proje, danışmanlık, ödül, editörlük ve 13. madde faaliyetleri bölünmez.
- **Toplam puan:** Madde tavanları uygulandıktan sonra tüm eserlerinizin toplamıdır. Doktora öncesi puana ayrıca bir sınır konmaz.
- **Doktora sonrası puan:** Doktora unvanından sonraki çalışmalardan alınan puandır. 3. madde (tezden üretilmiş yayın) bu toplama hiç girmez.
- **Başvuru şartı:** Toplamın en az 100, doktora sonrası puanın en az 90 olması ve tüm zorunlu koşulların sağlanmasıdır.
- **Tavanı aşan maddeler:** Bir madde tavanını aşarsa, önce doktora sonrası puanlar sayılır. Bu, 90 puan şartı açısından adayın lehine olan yorumdur.
- **Eğitim-öğretim (9. madde):** 9a’da 4 farklı yarıyıl, 9b’de 2 farklı yıl 2 puan eder. Doktora sonrası 2 yıl kadrolu görev 2 puan almış sayılır ama ders puanına eklenmez. Bu maddeden en fazla 6 puan alınır.

### Kontrol edilen zorunlu koşullar

- Toplam en az 100 puan; doktora sonrası (3. madde hariç) en az 90 puan
- **1. madde:** Doktora sonrası a–d bentlerinden en az 10 puan
- **2. madde:** Doktora sonrası, üçü tek yazarlı ve farklı dergilerde en az beş TR Dizin makalesi. Bu sağlanmazsa alternatifi aranır: 1a/1b’den biri tek yazarlı en az üç yayın. Yabancı uyruklu adaylarda 1a/1b/1c yayınlarıyla tamamlama da kabul edilir.
- **3. madde:** a–h bentlerinden en az bir yayın
- **4. madde:** Doktora sonrası en az bir kitap ya da iki kitap bölümü
- **5. madde:** Doktora sonrası yayınlara yapılan atıflardan en az 5 puan
- **8. madde:** Doktora sonrası bilimsel toplantılardan en az 5 puan
- **9. madde:** En az 2 puan
- **13. madde:** İletişim alanlarından başvuranlar için c, d, e bentlerinden en az 10 puan

### Yoruma açık noktalar

Yönetmelik metni bazı yerlerde birden fazla şekilde okunabiliyor. Araçta şu yorumlar kullanıldı:

- **5. madde:** Doktora sonrası şartı, atıf alan eserin doktora sonrası yayımlanmış olması olarak yorumlandı.
- **2. madde:** “Farklı dergilerde beş yayın” ifadesi, beş yayının en az beş ayrı dergide olması olarak yorumlandı.
- **2. maddenin 1a/1b alternatifi:** Yayınların doktora sonrası olması arandı.
- **Hesaplanamayan kurallar:** Eserlerin başvurulan bilim alanıyla ilgili olması, kitap bölümlerinin alanla ilgisi ve bilimsel toplantının düzenleme komitesi şartı araç tarafından kontrol edilemez. Bunları sizin kontrol etmeniz gerekir.

------------------------------------------------------------------------

## Hata bildirimi ve katkı

Yanlış hesaplandığını düşündüğünüz bir durum fark ederseniz lütfen bu repoda bir **Issue** açın ya da bana ulaşın. Mümkünse ilgili satırları (eser adları olmadan) ve beklediğiniz sonucu da ekleyin.

### Geliştiriciler için

| Dosya | İçerik |
|------------------------------------|------------------------------------|
| `index.html` | Sayfa ve stiller |
| `js/kurallar.js` | Puanlar, tavanlar ve alt tavanlar. Kriterler değişince yalnızca bu dosya güncellenir. |
| `js/hesap.js` | Hesap motoru; arayüzden bağımsızdır, Node’da da çalışır. |
| `js/app.js` | Arayüz, Excel okuma ve yazma |
| `sablon/` | Boş şablon ve örnek dosya |
| `araclar/sablon_uret.py` | Şablonu `kurallar.js`’ten yeniden üretir. Node ve `openpyxl` gerekir. |
| `test/` | Hesap motoru testleri |

Kriterler değiştiğinde izlenecek adımlar:

1.  `js/kurallar.js` dosyasını güncelleyin.
2.  Şablonu yeniden üretin: `python3 araclar/sablon_uret.py`
3.  Testleri çalıştırın: `node --test test/hesap.test.js`

Zorunlu koşulların mantığı `hesap.js` içinde madde numaralarına bağlıdır. Maddelerin yapısı değişirse o bölümü de kontrol edin.

Aracı yerelde çalıştırmak için bir web sunucusu gerekir; `index.html` dosyasını doğrudan açarsanız örnek dosya yüklenemez:

``` bash
python3 -m http.server 8000   # ardından http://localhost:8000
```

Excel işlemleri için [SheetJS](https://sheetjs.com) (0.18.5) kullanılır.

Kaynak kodu serbestçe kullanabilir, diğer temel alanlar için uyarlayabilirsiniz.

------------------------------------------------------------------------

Claude Opus 5.5 ile yeniden yazılmıştır.
