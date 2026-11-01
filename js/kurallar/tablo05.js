/* Tablo 5 · Hukuk Temel Alanı */
(function (root) {
  const O = typeof module !== "undefined" && module.exports ? require("./ortak.js") : root.DocentlikOrtak;
  const { kalem: K, kosul: k, standart, Q13 } = O;

  const tablo = O.tabloOlustur({
    id: "05", no: 5, ad: "Hukuk", beta: true,
    bolme: "esit",
    // 4. madde için genel tavan yoktur; yalnızca c + d toplamı sınırlıdır.
    tavanlar: { 3: 20, 4: null, 5: 10, 6: 10, 7: 20, 8: 10, 9: 6, 11: 25, 12: 4, 13: 10 },
    altTavanlar: [
      { bentler: ["3g", "3h"], tavan: 10, ad: "3g + 3h (diğer kitap/bölüm)" },
      { bentler: ["4c", "4d"], tavan: 30, ad: "4c + 4d (diğer kitap/bölüm)" }
    ],
    ekSutunlar: ["kendisiSundu"],
    kalemler: [
      ...K.uluslararasiMakale(),
      ...K.ulusalMakale(),
      ...K.tezYayin({ g: 5, h: 3, ı: 3 }),
      ...K.kitap({ c: 20, d: 10 }),
      ...K.atif(), ...K.danismanlik(), ...K.proje(), ...K.toplanti(), ...K.ogretim(),
      ...K.patent(), ...K.odul(), ...K.editorluk(), ...K.digerAB()
    ],
    kosullar: [
      { kod: "m2", ad: "2. madde: ulusal makale şartı (veya alternatifi)",
        kural: k.veya(
          k.etiketle("TR Dizin", k.ve(
            k.dergi({ bentler: ["2a"], ds: true }, { toplam: 6, tek: 4, farkli: 3 }),
            k.puan({ bentler: ["2a"], ds: true }, 50))),
          k.etiketle("Alternatif (1a–1c)", k.ve(
            k.sayi({ bentler: ["1a", "1b", "1c"], ds: true }, 2, { tekEnAz: 1 }),
            k.puan({ bentler: ["1a", "1b", "1c"], ds: true }, 50))),
          k.yabanci(k.etiketle("Yabancı uyruk (2a + 1a–1c)", k.ve(
            k.dergi({ bentler: ["2a", "1a", "1b", "1c"], ds: true }, { toplam: 6, tek: 4, farkli: 3 }),
            k.puan({ bentler: ["2a", "1a", "1b", "1c"], ds: true }, 50))))
        ) },
      standart.m3(),
      { kod: "m4", ad: "4. madde: doktora sonrası 4a ya da 4c’den en az bir kitap",
        kural: k.var({ bentler: ["4a", "4c"], ds: true }) },
      standart.m5(),
      { kod: "m8", ad: "8. madde: doktora sonrası toplantılardan en az 5 puan, en az birini kendisi sunmuş",
        aciklama: "“Kendim sundum” sütununu doldurun.",
        kural: k.ve(
          k.puan({ bolum: 8, ds: true }, 5),
          k.sayi({ bolum: 8, ds: true }, 1, { kendisiSunduEnAz: 1 })) },
      standart.m9()
    ],
    yorumlar: [
      "2. maddede 50 puan 2a makalelerinden sayılır; “üçü farklı dergilerde” ifadesi, altı yayının en az üç ayrı dergide olması olarak yorumlandı.",
      "2. maddenin alternatifinde 50 puan 1a–1c makalelerinden sayılır.",
      "4. madde için genel bir tavan yoktur; yalnızca 4c + 4d toplamı 30 puanla sınırlıdır.",
      "8. maddede en az bir bildiriyi adayın kendisinin sunması şartı arandı. ÜAK SSS 31, bildirinin puan alması için yazarlardan herhangi birinin sunmasının yeterli olduğunu söyler; bu ek şart yalnızca Hukuk tablosundaki zorunlu koşul içindir."
    ],
    notlar: [
      "Başvurulan bilim alanıyla ilgili olmak kaydıyla, üç veya daha çok ansiklopedi maddesi bir kitap bölümü sayılır.",
      "TR Dizin’deki bir derginin sayısı olarak çıkmayan Armağan ve Anma kitaplarındaki hakemli makaleler 4. maddede kitap bölümü olarak puanlanabilir."
    ]
  });

  if (typeof module !== "undefined" && module.exports) module.exports = tablo;
  else O.kaydet(tablo);
})(typeof window !== "undefined" ? window : globalThis);
