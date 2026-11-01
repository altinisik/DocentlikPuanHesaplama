/* Tablo 11 · Sosyal, Beşeri ve İdari Bilimler Temel Alanı */
(function (root) {
  const O = typeof module !== "undefined" && module.exports ? require("./ortak.js") : root.DocentlikOrtak;
  const { kalem: K, kosul: k, standart, Q13 } = O;

  const ILETISIM = ["Görsel İletişim Tasarımı", "İletişim Çalışmaları", "Reklamcılık", "Sinema", "Halkla İlişkiler"];

  const tablo = O.tabloOlustur({
    id: "11", no: 11, ad: "Sosyal, Beşeri ve İdari Bilimler", beta: false,
    bolme: "esit",
    tavanlar: { 3: 20, 4: 20, 5: 10, 6: 10, 7: 20, 8: 10, 9: 6, 11: 25, 12: 4, 13: 20 },
    altTavanlar: [
      { bentler: ["3g", "3h"], tavan: 5, ad: "3g + 3h (diğer kitap/bölüm)" },
      { bentler: ["4c", "4d"], tavan: 5, ad: "4c + 4d (diğer kitap/bölüm)" }
    ],
    kalemler: [
      ...K.uluslararasiMakale(),
      ...K.ulusalMakale(),
      ...K.tezYayin({ g: 3, h: 2, ı: 3 }),
      ...K.kitap({ c: 5, d: 3 }),
      ...K.atif(), ...K.danismanlik(), ...K.proje(), ...K.toplanti(), ...K.ogretim(),
      ...K.patent(), ...K.odul(), ...K.editorluk(),
      ...K.digerAB(),
      K.sabit("13c", 5, "Film festivalinde jüri/yürütücü/koordinatör/danışman"),
      K.sabit("13d", 5, "Kısa/uzun metraj filmde yönetmen/yrd./danışman"),
      K.sabit("13e", 5, "Dizi/belgesel/klip/reklam filminde alanla ilgili görev")
    ],
    alanlar: {
      secenekler: [...ILETISIM, "Diğer"], varsayilan: "Diğer", zorunlu: false,
      etiketler: { "Diğer": "Diğer alanlar" },
      aciklama: "Görsel İletişim Tasarımı, İletişim Çalışmaları, Reklamcılık, Sinema veya Halkla İlişkiler alanlarında 13. maddenin c, d, e bentlerinden en az 10 puan aranır. Diğer tüm alanlar için “Diğer” seçin."
    },
    kosullar: [
      { kod: "m1", ad: "1. madde: doktora sonrası a–d bentlerinden en az 10 puan",
        kural: k.puan({ bentler: ["1a", "1b", "1c", "1d"], ds: true }, 10) },
      { kod: "m2", ad: "2. madde: ulusal makale şartı (veya alternatifi)",
        kural: k.veya(
          k.dergi({ bentler: ["2a"], ds: true }, { toplam: 5, tek: 3, farkli: 5 }, "TR Dizin"),
          k.sayi({ bentler: ["1a", "1b"], ds: true }, 3, { tekEnAz: 1 }, "Alternatif (1a/1b)"),
          k.yabanci(k.dergi({ bentler: ["2a", "1a", "1b", "1c"], ds: true }, { toplam: 5, tek: 3, farkli: 5 }, "Yabancı uyruk (2a + 1a/1b/1c)"))
        ) },
      standart.m3(),
      { kod: "m4", ad: "4. madde: doktora sonrası en az bir kitap veya iki kitap bölümü",
        aciklama: "Aynı kitaptaki bölümler tek bölüm sayılır.",
        kural: k.veya(
          k.var({ bentler: ["4a", "4c"], ds: true }, "Kitap"),
          k.sayi({ bentler: ["4b", "4d"], ds: true }, 2, {}, "İki bölüm")
        ) },
      standart.m5(), standart.m8(), standart.m9(),
      { kod: "m13",
        ad: (ay) => `13. madde: ${ay.alan} alanı için c, d, e bentlerinden en az 10 puan`,
        kural: (ay) => (ILETISIM.includes(ay.alan) ? k.puan({ bentler: ["13c", "13d", "13e"] }, 10) : null) }
    ],
    yorumlar: [
      "2. maddedeki “farklı dergilerde beş yayın” ifadesi, beş yayının en az beş ayrı dergide olması olarak yorumlandı. Bu nedenle 2a satırlarında dergi adını yazmak önemlidir.",
      "2. maddenin 1a/1b alternatifinde yayınların doktora sonrası olması arandı; bu yayınlar 1. maddenin 10 puan şartına da sayılır.",
      "Yabancı uyruk/denklik durumunda TR Dizin yayınları 1a, 1b, 1c yayınlarıyla birlikte değerlendirildi."
    ]
  });

  if (typeof module !== "undefined" && module.exports) module.exports = tablo;
  else O.kaydet(tablo);
})(typeof window !== "undefined" ? window : globalThis);
