// Python şablon üreticisi için tabloları ve örnek veriyi JSON olarak yazar.
const H = require("../js/hesap.js");
const ornek = require("../test/ornek.js");
const tablolar = H.tablolar().map((t) => ({
  id: t.id, no: t.no, ad: t.ad, beta: t.beta, bolme: t.bolme, tarihAdi: t.tarihAdi,
  baslicaTanimi: t.baslicaTanimi || null, alanlar: t.alanlar, ekSutunlar: t.ekSutunlar, notlar: t.notlar,
  kalemler: t.kalemler.map(({ kod, ad, puan, tip, birim, bent }) => ({ kod, ad, puan, tip, birim: birim || null, bent })),
  baslicaBentleri: t.baslicaBentleri
}));
process.stdout.write(JSON.stringify({ tablolar, ornek }));
