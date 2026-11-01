/*
 * Doçentlik kural tabloları: ortak yapı taşları ve tablo kaydı.
 *
 * Her temel alanın kuralları kendi dosyasındadır (tablo01.js, tablo11.js …).
 * Bir tablo dosyası şunları tanımlar:
 *   - kalemler ve puanları (aşağıdaki yardımcılarla; tablolar arasında farklı olan
 *     puanlar her dosyada açıkça yazılır),
 *   - madde tavanları ve alt tavanlar,
 *   - puan bölme kuralı ("esit" ya da "baslica"),
 *   - zorunlu koşullar (aşağıdaki "kosul" yapı taşlarıyla),
 *   - ayarlar, metinler ve yoruma açık noktalar.
 *
 * Kalem tipleri:
 *   "yayin"   : puan yazar/kişi sayısına bölünür (tablonun bölme kuralına göre)
 *   "adet"    : puan × adet (atıflar)
 *   "sabit"   : puan olduğu gibi alınır
 *   "ogretim" : 9. madde — "birim" kadar yarıyıl/yıl için "puan" verilir
 */
(function (root) {
  const BOLUM_ADLARI = {
    1: "Uluslararası Makale",
    2: "Ulusal Makale",
    3: "Lisansüstü Tezlerden Üretilmiş Yayın",
    4: "Kitap",
    5: "Atıf",
    6: "Lisansüstü Tez Danışmanlığı",
    7: "Bilimsel Araştırma Projesi",
    8: "Bilimsel Toplantı",
    9: "Eğitim-Öğretim",
    10: "Patent/Faydalı Model",
    11: "Ödül",
    12: "Editörlük",
    13: "Diğer"
  };

  // ---------- kalem yardımcıları ----------
  const yayin = (kod, puan, ad) => ({ kod, bent: kod.split("-")[0], puan, tip: "yayin", ad });
  const sabit = (kod, puan, ad) => ({ kod, bent: kod.split("-")[0], puan, tip: "sabit", ad });
  const adet = (kod, puan, ad) => ({ kod, bent: kod, puan, tip: "adet", ad });

  /** 1. madde a–e: yedi tabloda da aynı */
  const uluslararasiMakale = () => [
    yayin("1a-Q1", 30, "SCIE/SSCI dergide makale, Q1"),
    yayin("1a-Q2", 20, "SCIE/SSCI dergide makale, Q2"),
    yayin("1a-Q3", 15, "SCIE/SSCI dergide makale, Q3"),
    yayin("1a-Q4", 10, "SCIE/SSCI dergide makale, Q4"),
    yayin("1b", 20, "AHCI dergide makale"),
    yayin("1c", 10, "ESCI veya Scopus dergide makale"),
    yayin("1d", 5, "Diğer uluslararası indeksli dergide makale"),
    yayin("1e", 3, "Editöre mektup, araştırma notu, özet, kitap kritiği (1a–1d dergisinde)")
  ];

  /** 2. madde: puanlar yedi tabloda da aynı */
  const ulusalMakale = () => [
    yayin("2a", 10, "TR Dizin dergide makale"),
    yayin("2b", 4, "Diğer hakemli dergide makale"),
    yayin("2c", 2, "Hakemli dergide editöre mektup, not, özet, kitap kritiği")
  ];

  /** 3. madde: g, h ve ı bentleri tablolar arasında farklı */
  const tezYayin = ({ g, h, ı }) => [
    yayin("3a", 20, "Tezden: SCIE/SSCI/AHCI dergide makale"),
    yayin("3b", 10, "Tezden: ESCI/Scopus dergide makale"),
    yayin("3c", 5, "Tezden: diğer uluslararası indeksli dergide makale"),
    yayin("3d", 8, "Tezden: TR Dizin dergide makale"),
    yayin("3e", 20, "Tezden: BKCI kitap"),
    yayin("3f", 10, "Tezden: BKCI kitapta bölüm"),
    yayin("3g", g, "Tezden: diğer uluslararası/ulusal kitap"),
    yayin("3h", h, "Tezden: diğer uluslararası/ulusal kitapta bölüm"),
    yayin("3ı", ı, "Tezden: CPCI'da yayımlanmış bildiri"),
    yayin("3i", 2, "Tezden: diğer bilimsel toplantı bildirisi")
  ];

  /** 4. madde: c ve d bentleri tablolar arasında farklı */
  const kitap = ({ c, d }) => [
    yayin("4a", 20, "BKCI kitap"),
    yayin("4b", 10, "BKCI kitapta bölüm"),
    yayin("4c", c, "Diğer uluslararası/ulusal kitap"),
    yayin("4d", d, "Diğer uluslararası/ulusal kitapta bölüm")
  ];

  /** 5. madde: yedi tabloda da aynı */
  const atif = () => [
    adet("5a", 3, "Atıf: SCIE/SSCI/AHCI/ESCI/Scopus"),
    adet("5b", 2, "Atıf: BKCI kitapta"),
    adet("5c", 2, "Atıf: TR Dizin dergide"),
    adet("5d", 1, "Atıf: diğer kitap veya dergide")
  ];

  /** 6. madde: yedi tabloda da aynı (eş danışman yarım puan) */
  const danismanlik = () => [
    sabit("6a-Asıl", 5, "Tamamlanmış doktora tezi, asıl danışman"),
    sabit("6a-Eş", 2.5, "Tamamlanmış doktora tezi, ikinci/eş danışman"),
    sabit("6b-Asıl", 3, "Tamamlanmış yüksek lisans tezi, asıl danışman"),
    sabit("6b-Eş", 1.5, "Tamamlanmış yüksek lisans tezi, ikinci/eş danışman")
  ];

  /** 7. madde: puanlar yedi tabloda da aynı (tavan farklı) */
  const proje = () => [
    sabit("7a-Yürütücü", 15, "AB Çerçeve/TÜBİTAK projesi, koordinatör/yürütücü"),
    sabit("7a-Araştırmacı", 10, "AB Çerçeve/TÜBİTAK projesi, araştırmacı"),
    sabit("7a-Danışman", 5, "AB Çerçeve/TÜBİTAK projesi, danışman"),
    sabit("7b", 10, "Uluslararası destekli proje"),
    sabit("7c", 5, "Kamu kurumu/özel kuruluşla Ar-Ge projesi"),
    sabit("7d", 3, "BAP projesi yürütücülüğü")
  ];

  /** 8. madde: puanlar yedi tabloda da aynı */
  const toplanti = () => [
    yayin("8a", 5, "CPCI'da yayımlanmış bildiri"),
    yayin("8b", 3, "Diğer uluslararası/ulusal toplantı bildirisi")
  ];

  /** 9. madde: yedi tabloda da aynı */
  const ogretim = () => [
    { kod: "9a", bent: "9a", puan: 2, birim: 4, tip: "ogretim", ad: "Dönemlik programda ders (adet = farklı yarıyıl sayısı)" },
    { kod: "9b", bent: "9b", puan: 2, birim: 2, tip: "ogretim", ad: "Yıllık programda ders (adet = farklı yıl sayısı)" }
  ];

  /** 10. madde: puanlar yedi tabloda da aynı; puan kişi sayısına bölünür */
  const patent = (basvuruAdi = "Kişisel patent başvurusu") => [
    yayin("10a", 20, "Tescilli uluslararası patent"),
    yayin("10b", 10, "Tescilli ulusal patent"),
    yayin("10c", 5, "Tescilli faydalı model"),
    yayin("10d", 2, basvuruAdi)
  ];

  /** 11. madde: yedi tabloda da aynı */
  const odul = () => [
    sabit("11a", 25, "YÖK Yılın Doktora Tezi Ödülü"),
    sabit("11b", 25, "YÖK Üstün Başarı Ödülü"),
    sabit("11c", 25, "TÜBİTAK Bilim Ödülü"),
    sabit("11d", 25, "TÜBİTAK Teşvik Ödülü"),
    sabit("11e", 25, "TÜBA GEBİP Ödülü"),
    sabit("11f", 25, "TÜBA TESEP Ödülü")
  ];

  /** 12. madde: yedi tabloda da aynı */
  const editorluk = () => [
    sabit("12a", 2, "SCIE/SSCI/AHCI/ESCI/Scopus dergide editörlük"),
    sabit("12b", 1, "BKCI veya Scopus kitapta editörlük"),
    sabit("12c", 1, "TR Dizin dergide editörlük")
  ];

  /** 13. madde a–b: yedi tabloda da var */
  const digerAB = () => [
    sabit("13a", 5, "WoS h-indeksi en az 5"),
    sabit("13b", 5, "İlk 300 üniversitede en az 6 ay yurt dışı faaliyet")
  ];

  // ---------- zorunlu koşul yapı taşları ----------
  // Süzgeç alanları: kodlar (kalem kodu), bentler, bolum; ds: true → yalnızca doktora sonrası
  const kosul = {
    /** Süzgece uyan satırların puanı (yazar bölmesi sonrası, tavan öncesi) en az enAz */
    puan: (suzgec, enAz, etiket) => ({ tip: "puan", suzgec, enAz, etiket }),
    /** Süzgece uyan satır sayısı en az enAz; ek: { tekEnAz, baslicaEnAz, kendisiSunduEnAz, altKume: { suzgec, enAz, ad } } */
    sayi: (suzgec, enAz, ek = {}, etiket) => Object.assign({ tip: "sayi", suzgec, enAz, etiket }, ek),
    /** En az bir kayıt */
    var: (suzgec, etiket) => ({ tip: "sayi", suzgec, enAz: 1, etiket }),
    /** Dergi şartı: en az "toplam" yayın, en az "tek" tek yazarlı, en az "farkli" ayrı dergi.
        farkli >= toplam ise yayınların hepsi ayrı dergilerde olmalı (tek yazarlılar da). */
    dergi: (suzgec, { toplam, tek, farkli }, etiket) => ({ tip: "dergi", suzgec, toplam, tek, farkli, etiket }),
    ve: (...parcalar) => ({ tip: "ve", parcalar }),
    veya: (...parcalar) => ({ tip: "veya", parcalar }),
    /** Bir ifadeye (ör. bir "veya" seçeneğine) ekranda görünecek ad verir */
    etiketle: (etiket, ifade) => Object.assign({}, ifade, { etiket }),
    /** Yalnızca yabancı uyruk/denklik ayarı açıkken geçerli alternatif */
    yabanci: (ifade) => Object.assign({}, ifade, { yalnizcaYabanci: true }),
    /** 9. madde puanı (kadrolu görev dahil) en az enAz */
    ogretim: (enAz) => ({ tip: "ogretim", enAz })
  };

  /** Bütün tablolarda aynı olan zorunlu koşullar */
  const standart = {
    m3: (tarihAdi = "doktora") => ({
      kod: "m3", ad: "3. madde: a–h bentlerinden en az bir yayın",
      muaf: (ay) => (ay.once2016 ? `${buyukHarf(tarihAdi)} unvanı Aralık 2016’dan önce alındığı için aranmaz.` : null),
      kural: kosul.var({ bentler: ["3a", "3b", "3c", "3d", "3e", "3f", "3g", "3h"] })
    }),
    m5: (tarihAdi = "doktora") => ({
      kod: "m5", ad: `5. madde: ${tarihAdi} sonrası yayınlara yapılan atıflardan en az 5 puan`,
      kural: kosul.puan({ bolum: 5, ds: true }, 5)
    }),
    m8: (tarihAdi = "doktora") => ({
      kod: "m8", ad: `8. madde: ${tarihAdi} sonrası bilimsel toplantılardan en az 5 puan`,
      kural: kosul.puan({ bolum: 8, ds: true }, 5)
    }),
    m9: () => ({ kod: "m9", ad: "9. madde: eğitim-öğretimden en az 2 puan", kural: kosul.ogretim(2) })
  };

  const buyukHarf = (s) => s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);

  // Q1–Q3 SCIE/SSCI makaleleri
  const Q13 = ["1a-Q1", "1a-Q2", "1a-Q3"];

  // ---------- tablo oluşturma ----------
  function tabloOlustur(t) {
    const tablo = Object.assign({
      bolme: "esit",
      // Başlıca yazar kuralının uygulandığı bentler (diğerleri eşit bölünür)
      baslicaBentleri: ["1a", "1b", "1c", "1d", "2a", "2b", "3a", "3b", "3c", "3d"],
      tarihAdi: "doktora",
      esikToplam: 100,
      esikDoktoraSonrasi: 90,
      altTavanlar: [],
      tekillestirme: [
        { bentler: ["4b", "4d"], mesaj: "Aynı kitaptan yalnızca bir bölüm puanlanır",
          eksikMesaj: "Kitap adı girilmemiş; aynı kitaptan tek bölüm kuralı kontrol edilemedi." },
        { bolum: 8, mesaj: "Aynı toplantıdan yalnızca bir çalışma puanlanır",
          eksikMesaj: "Toplantı adı girilmemiş; aynı toplantıdan tek çalışma kuralı kontrol edilemedi." }
      ],
      alanlar: null,          // { secenekler: [...], varsayilan, zorunlu, aciklama }
      ekSutunlar: [],         // "yazarlik", "kendisiSundu"
      yorumlar: [],
      notlar: []
    }, t);
    tablo.bolumler = {};
    for (const [no, ad] of Object.entries(BOLUM_ADLARI)) {
      tablo.bolumler[no] = { ad, tavan: t.tavanlar[no] ?? null, doksanaSayilmaz: +no === 3 };
    }
    delete tablo.tavanlar;
    for (const k of tablo.kalemler) k.bolum = parseInt(k.bent, 10);
    if (tablo.bolme === "baslica" && !tablo.ekSutunlar.includes("yazarlik")) tablo.ekSutunlar.unshift("yazarlik");
    return tablo;
  }

  const tablolar = {};
  const kaydet = (tablo) => { tablolar[tablo.id] = tablo; return tablo; };
  /** Kayıtlı tablolar, tablo numarasına göre sıralı */
  const sirali = () => Object.values(tablolar).sort((a, b) => a.no - b.no);

  const Ortak = {
    BOLUM_ADLARI, tabloOlustur, kaydet, tablolar, sirali, kosul, standart, Q13,
    kalem: { yayin, sabit, adet, uluslararasiMakale, ulusalMakale, tezYayin, kitap, atif, danismanlik,
             proje, toplanti, ogretim, patent, odul, editorluk, digerAB }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = Ortak;
  else root.DocentlikOrtak = Ortak;
})(typeof window !== "undefined" ? window : globalThis);
