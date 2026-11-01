/* Tablo 9 · Mühendislik Temel Alanı */
(function (root) {
  const O = typeof module !== "undefined" && module.exports ? require("./ortak.js") : root.DocentlikOrtak;
  const { kalem: K, kosul: k, standart, Q13 } = O;

  const tablo = O.tabloOlustur({
    id: "09", no: 9, ad: "Mühendislik", beta: true,
    bolme: "baslica",
    baslicaTanimi: "Tek yazarlı makaleler ile danışmanlığını yaptığınız lisansüstü öğrenci(ler)le birlikte yazdığınız makaleler. İkinci danışman başlıca yazar sayılmaz.",
    tavanlar: { 3: 20, 4: 20, 5: 10, 6: 10, 7: 30, 8: 10, 9: 6, 11: 25, 12: 4, 13: 10 },
    altTavanlar: [
      { bentler: ["4c", "4d"], tavan: 5, ad: "4c + 4d (diğer kitap/bölüm)" }
    ],
    kalemler: [
      ...K.uluslararasiMakale(),
      ...K.ulusalMakale(),
      ...K.tezYayin({ g: 5, h: 3, ı: 5 }),
      ...K.kitap({ c: 5, d: 3 }),
      ...K.atif(), ...K.danismanlik(), ...K.proje(), ...K.toplanti(), ...K.ogretim(),
      ...K.patent("Değerlendirmeye alınmış kişisel patent başvurusu"),
      ...K.odul(), ...K.editorluk(), ...K.digerAB()
    ],
    kosullar: [
      { kod: "m1", ad: "1. madde: doktora sonrası 1a’dan 40 puan; en az bir Q1–Q3 makalede başlıca yazar",
        kural: k.ve(
          k.puan({ bentler: ["1a"], ds: true }, 40),
          k.sayi({ kodlar: Q13, ds: true }, 1, { baslicaEnAz: 1 })) },
      { kod: "m2", ad: "2. madde: doktora sonrası 2a’dan en az 10 puan",
        kural: k.veya(
          k.puan({ bentler: ["2a"], ds: true }, 10, "TR Dizin"),
          k.yabanci(k.sayi({ bentler: ["1a", "1b", "1c"], ds: true }, 1, {}, "Yabancı uyruk (1a–1c’den 1 yayın)"))
        ) },
      standart.m3(), standart.m5(), standart.m8(), standart.m9()
    ],
    yorumlar: [
      "1. maddedeki 40 puan bütün 1a makalelerinden sayılır; en az bir Q1–Q3 makalede başlıca yazar olma şartı ayrıca aranır.",
      "Yabancı uyruk/denklik durumunda 2a’dan istenen 10 puan yerine 1a–1c’den bir yayın aranır."
    ]
  });

  if (typeof module !== "undefined" && module.exports) module.exports = tablo;
  else O.kaydet(tablo);
})(typeof window !== "undefined" ? window : globalThis);
