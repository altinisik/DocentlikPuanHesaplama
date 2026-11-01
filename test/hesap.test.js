// Çalıştırmak için: node --test test/
const test = require("node:test");
const assert = require("node:assert/strict");
const { hesapla, kodCoz, ehCoz } = require("../js/hesap.js");
const ornek = require("./ornek.js");

const yakin = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} ≠ ${b}`);
const satir = (madde, ds, ek = {}) =>
  Object.assign({ eserId: "", madde, doktoraSonrasi: ds, yazarSayisi: 1, adet: null, kaynak: "", tezKaynakli: null }, ek);
const kos = (r, kod) => r.kosullar.find((k) => k.kod === kod);
const bol = (r, no) => r.bolumler.find((b) => b.no === no);

test("örnek aday: toplam ve doktora sonrası puan elle hesapla aynı", () => {
  const r = hesapla(ornek);
  yakin(r.toplam, 148 + 1 / 3, "toplam");
  yakin(r.doksan, 113 + 1 / 3, "doksan");
  yakin(bol(r, 3).sayilan, 20, "3. madde tavanı");
  yakin(bol(r, 4).sayilan, 15, "4. madde: tekilleştirme + 4c/4d alt tavanı");
  yakin(bol(r, 5).sayilan, 10, "atıf tavanı");
  yakin(bol(r, 8).sayilan, 5.5, "aynı toplantıdan tek bildiri");
  assert.equal(r.gecti, true);
});

test("doktora öncesi puan sınırlanmaz", () => {
  const eserler = [];
  for (let i = 0; i < 5; i++) eserler.push(satir("1a-Q1", false));        // 150 doktora öncesi
  for (let i = 0; i < 9; i++) eserler.push(satir("2a", true, { kaynak: "D" + i })); // 90 doktora sonrası
  const r = hesapla({ eserler });
  yakin(r.toplam, 240, "toplam");
  yakin(r.doksan, 90, "doksan");
  assert.equal(kos(r, "toplam").gecti, true);
  assert.equal(kos(r, "doksan").gecti, true);
});

test("doktora sonrası 89 ise 90 şartı sağlanmaz, toplam ne olursa olsun", () => {
  const eserler = [satir("1a-Q1", false), satir("1a-Q1", false)];
  for (let i = 0; i < 8; i++) eserler.push(satir("2a", true));
  eserler.push(satir("8b", true, { kaynak: "T1" }), satir("12b", true), satir("12a", true), satir("12a", true));
  const r = hesapla({ eserler }); // 80 + 3 + 4 (12. madde tavanı) = 87
  assert.ok(r.doksan < 90);
  assert.equal(kos(r, "doksan").gecti, false);
  assert.equal(kos(r, "toplam").gecti, true);
});

test("3. madde doktora sonrası olsa da 90 şartına sayılmaz", () => {
  const eserler = [satir("3a", true, { tezKaynakli: true })];
  for (let i = 0; i < 8; i++) eserler.push(satir("2a", true));
  const r = hesapla({ eserler });
  yakin(r.toplam, 100, "toplam");
  yakin(r.doksan, 80, "doksan");
});

test("3ı (CPCI) kodu okunur ve toplama girer; 3i ayrı bent", () => {
  assert.equal(kodCoz("3ı").kalem.kod, "3ı");
  assert.equal(kodCoz("3i").kalem.kod, "3i");
  assert.equal(kodCoz("3I").kalem.kod, "3ı"); // Türkçe büyük I → ı
  const r = hesapla({ eserler: [satir("3ı", true), satir("3i", true)] });
  yakin(bol(r, 3).sayilan, 5, "3ı + 3i");
});

test("kod yazım varyantları", () => {
  assert.equal(kodCoz("1a-Q1 · SCIE/SSCI dergide makale, Q1").kalem.kod, "1a-Q1");
  assert.equal(kodCoz("1a q3").kalem.kod, "1a-Q3");
  assert.equal(kodCoz("6a eş danışman").kalem.kod, "6a-Eş");
  assert.equal(kodCoz("6b asıl").kalem.kod, "6b-Asıl");
  assert.equal(kodCoz("7a koordinatör").kalem.kod, "7a-Yürütücü");
  assert.equal(kodCoz("1a").kalem, null);
  assert.equal(kodCoz("14a").kalem, null);
});

test("9a dönemlik: 4 yarıyıl = 2 puan; 9b yıllık: 2 yıl = 2 puan; tavan 6", () => {
  yakin(hesapla({ eserler: [satir("9a", true, { adet: 3 })] }).bolumler[8].sayilan, 0, "3 yarıyıl");
  yakin(hesapla({ eserler: [satir("9a", true, { adet: 8 })] }).bolumler[8].sayilan, 4, "8 yarıyıl");
  yakin(hesapla({ eserler: [satir("9b", true, { adet: 2 })] }).bolumler[8].sayilan, 2, "2 yıl");
  yakin(hesapla({ eserler: [satir("9a", true, { adet: 20 })] }).bolumler[8].sayilan, 6, "tavan");
  yakin(hesapla({ eserler: [satir("9a", false, { adet: 8 })] }).bolumler[8].sayilan, 0, "doktora öncesi");
});

test("kadrolu 2 yıl: 2 puan sayılır ama ders puanına eklenmez", () => {
  yakin(hesapla({ ayarlar: { kadrolu: true }, eserler: [] }).bolumler[8].sayilan, 2, "ders yok");
  yakin(hesapla({ ayarlar: { kadrolu: true }, eserler: [satir("9a", true, { adet: 8 })] }).bolumler[8].sayilan, 4, "8 yarıyıl");
  assert.equal(kos(hesapla({ ayarlar: { kadrolu: true }, eserler: [] }), "m9").gecti, true);
});

test("atıf adet ile çarpılır, yazar sayısına bölünmez, tavan 10", () => {
  const r = hesapla({ eserler: [satir("5a", true, { adet: 20, yazarSayisi: 4 })] });
  yakin(bol(r, 5).ham, 60, "ham");
  yakin(bol(r, 5).sayilan, 10, "sayılan");
});

test("tavan aşılınca önce doktora sonrası puanlar sayılır", () => {
  const r = hesapla({ eserler: [satir("5a", false, { adet: 4 }), satir("5a", true, { adet: 3 })] });
  yakin(bol(r, 5).sayilan, 10, "toplam");
  yakin(bol(r, 5).ds, 9, "doktora sonrası");
});

test("alt tavan: 4c + 4d en fazla 5", () => {
  const r = hesapla({ eserler: [satir("4c", true), satir("4c", true), satir("4d", true, { kaynak: "K" })] });
  yakin(bol(r, 4).sayilan, 5, "4c+4d");
});

test("aynı kitaptan tek bölüm, aynı toplantıdan tek bildiri", () => {
  const r = hesapla({ eserler: [
    satir("4b", true, { kaynak: "Kitap X" }), satir("4b", true, { kaynak: "kitap x " }),
    satir("8a", true, { kaynak: "Kongre" }), satir("8b", true, { kaynak: "Kongre" })
  ] });
  yakin(bol(r, 4).sayilan, 10, "kitap");
  yakin(bol(r, 8).sayilan, 5, "toplantı");
  assert.equal(kos(r, "m4").gecti, false, "iki bölüm aynı kitaptan → tek bölüm");
});

test("2. madde: 5 TR Dizin, 3'ü tek yazarlı, farklı dergilerde", () => {
  const tr = (yazar, d) => satir("2a", true, { yazarSayisi: yazar, kaynak: d });
  const gecen = [tr(1, "A"), tr(1, "B"), tr(1, "C"), tr(2, "D"), tr(3, "E")];
  assert.equal(kos(hesapla({ eserler: gecen }), "m2").gecti, true);
  const ayniDergi = [tr(1, "A"), tr(1, "A"), tr(1, "C"), tr(2, "D"), tr(3, "E")];
  assert.equal(kos(hesapla({ eserler: ayniDergi }), "m2").gecti, false);
  const azTek = [tr(1, "A"), tr(1, "B"), tr(2, "C"), tr(2, "D"), tr(3, "E")];
  assert.equal(kos(hesapla({ eserler: azTek }), "m2").gecti, false);
});

test("2. madde alternatifi: 1a/1b'den biri tek yazarlı en az 3 yayın", () => {
  const e = [satir("1a-Q4", true, { yazarSayisi: 2 }), satir("1b", true, { yazarSayisi: 3 }), satir("1a-Q1", true)];
  assert.equal(kos(hesapla({ eserler: e }), "m2").gecti, true);
  e[2].yazarSayisi = 2;
  assert.equal(kos(hesapla({ eserler: e }), "m2").gecti, false);
});

test("2. madde yabancı uyruk: eksik TR Dizin 1a/1b/1c ile tamamlanır", () => {
  const e = [
    satir("2a", true, { kaynak: "A" }), satir("2a", true, { kaynak: "B" }),
    satir("1c", true, { kaynak: "C" }), satir("1c", true, { kaynak: "D", yazarSayisi: 2 }),
    satir("1c", true, { kaynak: "E", yazarSayisi: 2 })
  ];
  assert.equal(kos(hesapla({ eserler: e }), "m2").gecti, false);
  assert.equal(kos(hesapla({ ayarlar: { yabanci: true }, eserler: e }), "m2").gecti, true);
});

test("13. madde özel şartı yalnızca iletişim alanlarında aranır", () => {
  assert.equal(kos(hesapla({ eserler: [] }), "m13"), undefined);
  const r = hesapla({ ayarlar: { alan: "Sinema" }, eserler: [satir("13c", true), satir("13d", true)] });
  assert.equal(kos(r, "m13").gecti, true);
});

test("E/H okuma", () => {
  assert.equal(ehCoz("Evet"), true);
  assert.equal(ehCoz("h"), false);
  assert.equal(ehCoz("Hayır"), false);
  assert.equal(ehCoz(""), null);
});
