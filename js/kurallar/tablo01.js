/* Tablo 1 · Eğitim Bilimleri Temel Alanı */
(function (root) {
  const O = typeof module !== "undefined" && module.exports ? require("./ortak.js") : root.DocentlikOrtak;
  const { kalem: K, kosul: k, standart, Q13 } = O;

  const tablo = O.tabloOlustur({
    id: "01", no: 1, ad: "Eğitim Bilimleri", beta: true,
    bolme: "esit",
    tavanlar: { 3: 20, 4: 20, 5: 10, 6: 10, 7: 15, 8: 10, 9: 6, 11: 25, 12: 4, 13: 10 },
    altTavanlar: [
      { bentler: ["3g", "3h"], tavan: 5, ad: "3g + 3h (diğer kitap/bölüm)" },
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
      { kod: "m1", ad: "1. madde: doktora sonrası Q1–Q3 SCIE/SSCI makalelerden en az 30 puan",
        kural: k.puan({ kodlar: Q13, ds: true }, 30) },
      { kod: "m2", ad: "2. madde: doktora sonrası, biri 2a’dan olmak üzere en az iki yayın",
        kural: k.veya(
          k.sayi({ bentler: ["2a", "2b", "2c"], ds: true }, 2,
            { altKume: { suzgec: { bentler: ["2a"] }, enAz: 1, ad: "2a" } }, "Ulusal makale"),
          k.yabanci(k.sayi({ bentler: ["2a", "2b", "2c", "1a", "1b", "1c"], ds: true }, 2,
            { altKume: { suzgec: { bentler: ["2a", "1a", "1b", "1c"] }, enAz: 1, ad: "2a/1a–1c" } }, "Yabancı uyruk (1a–1c ile)"))
        ) },
      standart.m3(), standart.m5(), standart.m8(), standart.m9()
    ],
    yorumlar: [
      "2. maddedeki “en az iki yayın” sayısına 2c (editöre mektup, not, özet, kitap kritiği) de dahil edildi.",
      "Yabancı uyruk/denklik durumunda 2a yayını 1a, 1b ya da 1c yayınıyla karşılanabilir."
    ],
    notlar: ["Başvurulan bilim alanıyla ilgili olmak kaydıyla, üç veya daha çok ansiklopedi maddesi bir kitap bölümü sayılır."]
  });

  if (typeof module !== "undefined" && module.exports) module.exports = tablo;
  else O.kaydet(tablo);
})(typeof window !== "undefined" ? window : globalThis);
