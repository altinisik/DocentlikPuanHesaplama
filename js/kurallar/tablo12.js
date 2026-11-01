/* Tablo 12 · Ziraat, Orman ve Su Ürünleri Temel Alanı */
(function (root) {
  const O = typeof module !== "undefined" && module.exports ? require("./ortak.js") : root.DocentlikOrtak;
  const { kalem: K, kosul: k, standart, Q13 } = O;

  const tablo = O.tabloOlustur({
    id: "12", no: 12, ad: "Ziraat, Orman ve Su Ürünleri", beta: true,
    bolme: "baslica",
    baslicaTanimi: "Tek yazarlı makaleler ile danışmanlığını yaptığınız lisansüstü öğrenci(ler)le birlikte yazdığınız makaleler. İkinci danışman başlıca yazar sayılmaz.",
    tavanlar: { 3: 20, 4: 20, 5: 10, 6: 10, 7: 60, 8: 10, 9: 6, 11: 25, 12: 4, 13: 10 },
    altTavanlar: [
      { bentler: ["4c", "4d"], tavan: 5, ad: "4c + 4d (diğer kitap/bölüm)" }
    ],
    kalemler: [
      ...K.uluslararasiMakale(),
      ...K.ulusalMakale(),
      ...K.tezYayin({ g: 5, h: 3, ı: 3 }),
      ...K.kitap({ c: 5, d: 3 }),
      ...K.atif(), ...K.danismanlik(), ...K.proje(), ...K.toplanti(), ...K.ogretim(),
      ...K.patent(), ...K.odul(), ...K.editorluk(), ...K.digerAB()
    ],
    kosullar: [
      { kod: "m1", ad: "1. madde: doktora sonrası 1a’dan en az 30 puan; Q1–Q3 makalelerden en az 20 puan ve birinde başlıca yazar",
        kural: k.ve(
          k.puan({ bentler: ["1a"], ds: true }, 30),
          k.puan({ kodlar: Q13, ds: true }, 20),
          k.sayi({ kodlar: Q13, ds: true }, 1, { baslicaEnAz: 1 })) },
      { kod: "m2", ad: "2. madde: doktora sonrası 2a’dan en az 20 puan",
        kural: k.veya(
          k.puan({ bentler: ["2a"], ds: true }, 20, "TR Dizin"),
          k.yabanci(k.sayi({ bentler: ["1a", "1b", "1c"], ds: true }, 2, {}, "Yabancı uyruk (1a–1c’den 2 yayın)"))
        ) },
      standart.m3(), standart.m5(), standart.m8(), standart.m9()
    ],
    yorumlar: [
      "1. maddede: 1a’dan toplam en az 30 puan; buna ek olarak Q1–Q3 makalelerinden en az 20 puan ve bunlardan en az birinde başlıca yazarlık arandı.",
      "Yabancı uyruk/denklik durumunda 2a’dan istenen 20 puan yerine 1a–1c’den iki yayın aranır."
    ]
  });

  if (typeof module !== "undefined" && module.exports) module.exports = tablo;
  else O.kaydet(tablo);
})(typeof window !== "undefined" ? window : globalThis);
