/*
 * ÜAK Doçentlik Başvuru Şartları — Tablo 11
 * Sosyal, Beşeri ve İdari Bilimler Temel Alanı
 *
 * Kriterler değiştiğinde yalnızca bu dosyayı güncellemek yeterlidir.
 *
 * Kalem tipleri:
 *   "yayin"   : puan yazar/kişi sayısına eşit bölünür
 *   "adet"    : puan × adet (atıflar)
 *   "sabit"   : puan olduğu gibi alınır
 *   "ogretim" : bölüm 9 — "birim" kadar yarıyıl/yıl için "puan" verilir
 */
(function (root) {
  const KURALLAR = {
    surum: "ÜAK Tablo 11 · Sosyal, Beşeri ve İdari Bilimler",
    esikToplam: 100,
    esikDoktoraSonrasi: 90,

    bolumler: {
      1: { ad: "Uluslararası Makale", tavan: null },
      2: { ad: "Ulusal Makale", tavan: null },
      3: { ad: "Lisansüstü Tezlerden Üretilmiş Yayın", tavan: 20, doksanaSayilmaz: true },
      4: { ad: "Kitap", tavan: 20 },
      5: { ad: "Atıf", tavan: 10 },
      6: { ad: "Lisansüstü Tez Danışmanlığı", tavan: 10 },
      7: { ad: "Bilimsel Araştırma Projesi", tavan: 20 },
      8: { ad: "Bilimsel Toplantı", tavan: 10 },
      9: { ad: "Eğitim-Öğretim", tavan: 6 },
      10: { ad: "Patent/Faydalı Model", tavan: null },
      11: { ad: "Ödül", tavan: 25 },
      12: { ad: "Editörlük", tavan: 4 },
      13: { ad: "Diğer", tavan: 20 }
    },

    altTavanlar: [
      { bolum: 3, bentler: ["3g", "3h"], tavan: 5, ad: "3g + 3h (diğer kitap/bölüm)" },
      { bolum: 4, bentler: ["4c", "4d"], tavan: 5, ad: "4c + 4d (diğer kitap/bölüm)" }
    ],

    // 13. madde özel şartı (c, d, e bentlerinden en az 10 puan) bu alanlar için aranır
    iletisimAlanlari: [
      "Görsel İletişim Tasarımı",
      "İletişim Çalışmaları",
      "Reklamcılık",
      "Sinema",
      "Halkla İlişkiler"
    ],

    kalemler: [
      { kod: "1a-Q1", bent: "1a", puan: 30, tip: "yayin", ad: "SCIE/SSCI dergide makale, Q1" },
      { kod: "1a-Q2", bent: "1a", puan: 20, tip: "yayin", ad: "SCIE/SSCI dergide makale, Q2" },
      { kod: "1a-Q3", bent: "1a", puan: 15, tip: "yayin", ad: "SCIE/SSCI dergide makale, Q3" },
      { kod: "1a-Q4", bent: "1a", puan: 10, tip: "yayin", ad: "SCIE/SSCI dergide makale, Q4" },
      { kod: "1b", bent: "1b", puan: 20, tip: "yayin", ad: "AHCI dergide makale" },
      { kod: "1c", bent: "1c", puan: 10, tip: "yayin", ad: "ESCI veya Scopus dergide makale" },
      { kod: "1d", bent: "1d", puan: 5, tip: "yayin", ad: "Diğer uluslararası indeksli dergide makale" },
      { kod: "1e", bent: "1e", puan: 3, tip: "yayin", ad: "Editöre mektup, araştırma notu, özet, kitap kritiği (1a–1d dergisinde)" },

      { kod: "2a", bent: "2a", puan: 10, tip: "yayin", ad: "TR Dizin dergide makale" },
      { kod: "2b", bent: "2b", puan: 4, tip: "yayin", ad: "Diğer hakemli dergide makale" },
      { kod: "2c", bent: "2c", puan: 2, tip: "yayin", ad: "Hakemli dergide editöre mektup, not, özet, kitap kritiği" },

      { kod: "3a", bent: "3a", puan: 20, tip: "yayin", ad: "Tezden: SCIE/SSCI/AHCI dergide makale" },
      { kod: "3b", bent: "3b", puan: 10, tip: "yayin", ad: "Tezden: ESCI/Scopus dergide makale" },
      { kod: "3c", bent: "3c", puan: 5, tip: "yayin", ad: "Tezden: diğer uluslararası indeksli dergide makale" },
      { kod: "3d", bent: "3d", puan: 8, tip: "yayin", ad: "Tezden: TR Dizin dergide makale" },
      { kod: "3e", bent: "3e", puan: 20, tip: "yayin", ad: "Tezden: BKCI kitap" },
      { kod: "3f", bent: "3f", puan: 10, tip: "yayin", ad: "Tezden: BKCI kitapta bölüm" },
      { kod: "3g", bent: "3g", puan: 3, tip: "yayin", ad: "Tezden: diğer uluslararası/ulusal kitap" },
      { kod: "3h", bent: "3h", puan: 2, tip: "yayin", ad: "Tezden: diğer uluslararası/ulusal kitapta bölüm" },
      { kod: "3ı", bent: "3ı", puan: 3, tip: "yayin", ad: "Tezden: CPCI'da yayımlanmış bildiri" },
      { kod: "3i", bent: "3i", puan: 2, tip: "yayin", ad: "Tezden: diğer bilimsel toplantı bildirisi" },

      { kod: "4a", bent: "4a", puan: 20, tip: "yayin", ad: "BKCI kitap" },
      { kod: "4b", bent: "4b", puan: 10, tip: "yayin", ad: "BKCI kitapta bölüm" },
      { kod: "4c", bent: "4c", puan: 5, tip: "yayin", ad: "Diğer uluslararası/ulusal kitap" },
      { kod: "4d", bent: "4d", puan: 3, tip: "yayin", ad: "Diğer uluslararası/ulusal kitapta bölüm" },

      { kod: "5a", bent: "5a", puan: 3, tip: "adet", ad: "Atıf: SCIE/SSCI/AHCI/ESCI/Scopus" },
      { kod: "5b", bent: "5b", puan: 2, tip: "adet", ad: "Atıf: BKCI kitapta" },
      { kod: "5c", bent: "5c", puan: 2, tip: "adet", ad: "Atıf: TR Dizin dergide" },
      { kod: "5d", bent: "5d", puan: 1, tip: "adet", ad: "Atıf: diğer kitap veya dergide" },

      { kod: "6a-Asıl", bent: "6a", puan: 5, tip: "sabit", ad: "Tamamlanmış doktora tezi, asıl danışman" },
      { kod: "6a-Eş", bent: "6a", puan: 2.5, tip: "sabit", ad: "Tamamlanmış doktora tezi, ikinci/eş danışman" },
      { kod: "6b-Asıl", bent: "6b", puan: 3, tip: "sabit", ad: "Tamamlanmış yüksek lisans tezi, asıl danışman" },
      { kod: "6b-Eş", bent: "6b", puan: 1.5, tip: "sabit", ad: "Tamamlanmış yüksek lisans tezi, ikinci/eş danışman" },

      { kod: "7a-Yürütücü", bent: "7a", puan: 15, tip: "sabit", ad: "AB Çerçeve/TÜBİTAK projesi, koordinatör/yürütücü" },
      { kod: "7a-Araştırmacı", bent: "7a", puan: 10, tip: "sabit", ad: "AB Çerçeve/TÜBİTAK projesi, araştırmacı" },
      { kod: "7a-Danışman", bent: "7a", puan: 5, tip: "sabit", ad: "AB Çerçeve/TÜBİTAK projesi, danışman" },
      { kod: "7b", bent: "7b", puan: 10, tip: "sabit", ad: "Uluslararası destekli proje" },
      { kod: "7c", bent: "7c", puan: 5, tip: "sabit", ad: "Kamu kurumu/özel kuruluşla Ar-Ge projesi" },
      { kod: "7d", bent: "7d", puan: 3, tip: "sabit", ad: "BAP projesi yürütücülüğü" },

      { kod: "8a", bent: "8a", puan: 5, tip: "yayin", ad: "CPCI'da yayımlanmış bildiri" },
      { kod: "8b", bent: "8b", puan: 3, tip: "yayin", ad: "Diğer uluslararası/ulusal toplantı bildirisi" },

      { kod: "9a", bent: "9a", puan: 2, birim: 4, tip: "ogretim", ad: "Dönemlik programda ders (adet = farklı yarıyıl sayısı)" },
      { kod: "9b", bent: "9b", puan: 2, birim: 2, tip: "ogretim", ad: "Yıllık programda ders (adet = farklı yıl sayısı)" },

      { kod: "10a", bent: "10a", puan: 20, tip: "yayin", ad: "Tescilli uluslararası patent" },
      { kod: "10b", bent: "10b", puan: 10, tip: "yayin", ad: "Tescilli ulusal patent" },
      { kod: "10c", bent: "10c", puan: 5, tip: "yayin", ad: "Tescilli faydalı model" },
      { kod: "10d", bent: "10d", puan: 2, tip: "yayin", ad: "Kişisel patent başvurusu" },

      { kod: "11a", bent: "11a", puan: 25, tip: "sabit", ad: "YÖK Yılın Doktora Tezi Ödülü" },
      { kod: "11b", bent: "11b", puan: 25, tip: "sabit", ad: "YÖK Üstün Başarı Ödülü" },
      { kod: "11c", bent: "11c", puan: 25, tip: "sabit", ad: "TÜBİTAK Bilim Ödülü" },
      { kod: "11d", bent: "11d", puan: 25, tip: "sabit", ad: "TÜBİTAK Teşvik Ödülü" },
      { kod: "11e", bent: "11e", puan: 25, tip: "sabit", ad: "TÜBA GEBİP Ödülü" },
      { kod: "11f", bent: "11f", puan: 25, tip: "sabit", ad: "TÜBA TESEP Ödülü" },

      { kod: "12a", bent: "12a", puan: 2, tip: "sabit", ad: "SCIE/SSCI/AHCI/ESCI/Scopus dergide editörlük" },
      { kod: "12b", bent: "12b", puan: 1, tip: "sabit", ad: "BKCI veya Scopus kitapta editörlük" },
      { kod: "12c", bent: "12c", puan: 1, tip: "sabit", ad: "TR Dizin dergide editörlük" },

      { kod: "13a", bent: "13a", puan: 5, tip: "sabit", ad: "WoS h-indeksi en az 5" },
      { kod: "13b", bent: "13b", puan: 5, tip: "sabit", ad: "İlk 300 üniversitede en az 6 ay yurt dışı faaliyet" },
      { kod: "13c", bent: "13c", puan: 5, tip: "sabit", ad: "Film festivalinde jüri/yürütücü/koordinatör/danışman" },
      { kod: "13d", bent: "13d", puan: 5, tip: "sabit", ad: "Kısa/uzun metraj filmde yönetmen/yrd./danışman" },
      { kod: "13e", bent: "13e", puan: 5, tip: "sabit", ad: "Dizi/belgesel/klip/reklam filminde alanla ilgili görev" }
    ]
  };

  // Her kaleme bölüm numarasını ekle
  for (const k of KURALLAR.kalemler) k.bolum = parseInt(k.bent, 10);

  if (typeof module !== "undefined" && module.exports) module.exports = KURALLAR;
  else root.KURALLAR = KURALLAR;
})(typeof window !== "undefined" ? window : globalThis);
