/* Tablo 10 · Sağlık Bilimleri Temel Alanı */
(function (root) {
  const O = typeof module !== "undefined" && module.exports ? require("./ortak.js") : root.DocentlikOrtak;
  const { kalem: K, kosul: k, standart, Q13 } = O;

  const DU = "doktora/uzmanlık";
  const tablo = O.tabloOlustur({
    id: "10", no: 10, ad: "Sağlık Bilimleri", beta: true,
    bolme: "baslica",
    tarihAdi: DU,
    baslicaTanimi: "Tek yazarlı makaleler, ilk sırada yer aldığınız makaleler ve danışmanlığını yaptığınız lisansüstü öğrenci(ler)le birlikte yazdığınız makaleler. İkinci danışman başlıca yazar sayılmaz.",
    tavanlar: { 3: 20, 4: 20, 5: 10, 6: 10, 7: 20, 8: 10, 9: 6, 11: 25, 12: 4, 13: 10 },
    altTavanlar: [
      { bentler: ["3g", "3h"], tavan: 5, ad: "3g + 3h (diğer kitap/bölüm)" },
      { bentler: ["4c", "4d"], tavan: 5, ad: "4c + 4d (diğer kitap/bölüm)" }
    ],
    kalemler: [
      ...K.uluslararasiMakale(),
      K.yayin("1f", 5, "Vaka takdimi (1a dergisinde)"),
      K.yayin("2a", 10, "TR Dizin dergide makale (editöre mektup vb. hariç)"),
      K.yayin("2b", 4, "Diğer hakemli dergide makale (editöre mektup vb. hariç)"),
      K.yayin("2c", 2, "Hakemli dergide editöre mektup, not, özet, kitap kritiği"),
      ...K.tezYayin({ g: 5, h: 3, ı: 3 }),
      ...K.kitap({ c: 5, d: 3 }),
      ...K.atif(), ...K.danismanlik(), ...K.proje(), ...K.toplanti(), ...K.ogretim(),
      ...K.patent(), ...K.odul(), ...K.editorluk(), ...K.digerAB()
    ],
    kosullar: [
      { kod: "m1", ad: `1. madde: ${DU} sonrası 1a’dan en az 40 puan; en az üç makalede başlıca yazar`,
        kural: k.ve(
          k.puan({ bentler: ["1a"], ds: true }, 40),
          k.sayi({ bentler: ["1a"], ds: true }, 3, { baslicaEnAz: 3 })) },
      { kod: "m2", ad: `2. madde: ${DU} sonrası, ikisi 2a’dan en az üç yayın; en az ikisinde başlıca yazar`,
        kural: k.veya(
          k.sayi({ bentler: ["2a", "2b", "2c"], ds: true }, 3,
            { altKume: { suzgec: { bentler: ["2a"] }, enAz: 2, ad: "2a" }, baslicaEnAz: 2 }, "Ulusal makale"),
          k.yabanci(k.sayi({ bentler: ["2a", "2b", "2c", "1a", "1b", "1c"], ds: true }, 3,
            { altKume: { suzgec: { bentler: ["2a", "1a", "1b", "1c"] }, enAz: 2, ad: "2a/1a–1c" }, baslicaEnAz: 2 }, "Yabancı uyruk (1a–1c ile)"))
        ) },
      standart.m3(DU), standart.m5(DU), standart.m8(DU), standart.m9()
    ],
    yorumlar: [
      "“Doktora sonrası” her yerde doktora ya da tıpta, diş hekimliğinde, eczacılıkta ve veteriner hekimlikte uzmanlık unvanının alınmasından sonra demektir. Yan dal uzmanlığı başvurularında ana dal uzmanlığının alındığı tarih esas alınır.",
      "2. maddedeki “en az üç yayın” sayısına 2c de dahil edildi.",
      "Başlıca yazar kuralı 1a–1d, 2a–2b ve 3a–3d makalelerine uygulandı; 1e, 1f (vaka takdimi) ve 2c eşit bölündü."
    ],
    notlar: ["Sağlık Bakanlığına bağlı hastanelerde uzman ya da başasistan olarak görev yapmak 9. madde şartını karşılamaz (ÜAK SSS 42); “2 yıl kadrolu görev” yalnızca yükseköğretim kurumlarındaki kadroyu kapsar."]
  });

  if (typeof module !== "undefined" && module.exports) module.exports = tablo;
  else O.kaydet(tablo);
})(typeof window !== "undefined" ? window : globalThis);
