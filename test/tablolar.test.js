// Çalıştırmak için: node --test test/tablolar.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const H = require("../js/hesap.js");
const TABLOLAR = H.tablolar();
const T = Object.fromEntries(TABLOLAR.map((t) => [t.id, t]));

const yakin = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} ≠ ${b}`);
const satir = (madde, ds = true, ek = {}) =>
  Object.assign({ eserId: "", madde, doktoraSonrasi: ds, yazarSayisi: 1, adet: null, kaynak: "", tezKaynakli: null }, ek);
const hes = (tablo, eserler, ayarlar = {}) => H.hesapla({ ayarlar: Object.assign({ tablo }, ayarlar), eserler });
const kos = (r, kod) => r.kosullar.find((k) => k.kod === kod);
const bol = (r, no) => r.bolumler.find((b) => b.no === no);
const puan = (tablo, kod) => T[tablo].kalemler.find((k) => k.kod === kod)?.puan;

// ---------- 1) Tutarlılık ----------
test("yedi tablo yüklü", () => {
  assert.deepEqual(TABLOLAR.map((t) => t.no), [1, 2, 5, 9, 10, 11, 12]);
});

for (const t of TABLOLAR) {
  test(`Tablo ${t.no}: kural dosyası tutarlı`, () => {
    const kodlar = t.kalemler.map((k) => k.kod);
    assert.equal(new Set(kodlar).size, kodlar.length, "kalem kodları tekil olmalı");
    const bentler = new Set(t.kalemler.map((k) => k.bent));
    for (const k of t.kalemler) {
      assert.ok(typeof k.puan === "number" && k.puan > 0, `${k.kod} puanı`);
      assert.ok(["yayin", "adet", "sabit", "ogretim"].includes(k.tip), `${k.kod} tipi`);
      assert.ok(k.bolum >= 1 && k.bolum <= 13, `${k.kod} bölümü`);
      assert.ok(k.ad, `${k.kod} adı`);
    }
    for (let no = 1; no <= 13; no++) assert.ok(t.kalemler.some((k) => k.bolum === no), `${no}. maddede kalem`);
    for (const at of t.altTavanlar) for (const b of at.bentler) assert.ok(bentler.has(b), `alt tavan bendi ${b}`);
    for (const tk of t.tekillestirme) for (const b of tk.bentler || []) assert.ok(bentler.has(b), `tekilleştirme bendi ${b}`);
    for (const b of t.baslicaBentleri) assert.ok(bentler.has(b), `başlıca bendi ${b}`);
    // Koşullardaki bütün süzgeçler tabloda var olan kalemlere işaret etmeli
    const ayarlar = { alan: t.alanlar ? t.alanlar.secenekler[0] : "", yabanci: true };
    const gez = (ifade) => {
      if (!ifade) return;
      if (ifade.parcalar) return ifade.parcalar.forEach(gez);
      const z = ifade.suzgec;
      if (!z) return;
      for (const kd of z.kodlar || []) assert.ok(kodlar.includes(kd), `koşuldaki kod ${kd}`);
      for (const b of z.bentler || []) assert.ok(bentler.has(b), `koşuldaki bent ${b}`);
      if (ifade.altKume) for (const b of ifade.altKume.suzgec.bentler || []) assert.ok(bentler.has(b), `alt küme bendi ${b}`);
    };
    const kodSet = new Set();
    for (const kd of t.kosullar) {
      assert.ok(!kodSet.has(kd.kod), `koşul kodu tekil: ${kd.kod}`);
      kodSet.add(kd.kod);
      gez(typeof kd.kural === "function" ? kd.kural(ayarlar) : kd.kural);
    }
    // Boş dosya hata vermeden hesaplanmalı
    const r = hes(t.id, []);
    assert.equal(r.toplam, 0);
    assert.equal(r.gecti, false);
  });
}

// ---------- 2) PDF'lerden ikinci kez okunan değerler ----------
test("tablolar arasında farklı olan puanlar PDF ile aynı", () => {
  const beklenen = {
    //      3g 3h 3ı  4c  4d  7tavan 13tavan 4tavan
    "01": [5, 3, 3, 5, 3, 15, 10, 20],
    "02": [5, 3, 3, 5, 3, 30, 10, 20],
    "05": [5, 3, 3, 20, 10, 20, 10, null],
    "09": [5, 3, 5, 5, 3, 30, 10, 20],
    "10": [5, 3, 3, 5, 3, 20, 10, 20],
    "11": [3, 2, 3, 5, 3, 20, 20, 20],
    "12": [5, 3, 3, 5, 3, 60, 10, 20]
  };
  for (const [id, [g, h, ı, c, d, t7, t13, t4]] of Object.entries(beklenen)) {
    assert.deepEqual(
      [puan(id, "3g"), puan(id, "3h"), puan(id, "3ı"), puan(id, "4c"), puan(id, "4d"),
       T[id].bolumler[7].tavan, T[id].bolumler[13].tavan, T[id].bolumler[4].tavan],
      [g, h, ı, c, d, t7, t13, t4], `Tablo ${id}`);
  }
});

test("alt tavanlar ve bölme kuralları PDF ile aynı", () => {
  const alt = (id) => Object.fromEntries(T[id].altTavanlar.map((a) => [a.bentler.join("+"), a.tavan]));
  assert.deepEqual(alt("01"), { "3g+3h": 5, "4c+4d": 5 });
  assert.deepEqual(alt("02"), { "4c+4d": 5 });
  assert.deepEqual(alt("05"), { "3g+3h": 10, "4c+4d": 30 });
  assert.deepEqual(alt("09"), { "4c+4d": 5 });
  assert.deepEqual(alt("10"), { "3g+3h": 5, "4c+4d": 5 });
  assert.deepEqual(alt("11"), { "3g+3h": 5, "4c+4d": 5 });
  assert.deepEqual(alt("12"), { "4c+4d": 5 });
  assert.deepEqual(TABLOLAR.map((t) => [t.no, t.bolme]),
    [[1, "esit"], [2, "baslica"], [5, "esit"], [9, "baslica"], [10, "baslica"], [11, "esit"], [12, "baslica"]]);
  assert.equal(puan("10", "1f"), 5);
  assert.equal(puan("11", "1f"), undefined);
  assert.equal(puan("11", "13c"), 5);
  assert.equal(puan("01", "13c"), undefined);
  for (const t of TABLOLAR) {
    // Ortak bölümlerin tavanları her tabloda aynı
    assert.deepEqual([3, 5, 6, 8, 9, 11, 12].map((n) => t.bolumler[n].tavan), [20, 10, 10, 10, 6, 25, 4], `Tablo ${t.no}`);
    assert.deepEqual([1, 2, 10].map((n) => t.bolumler[n].tavan), [null, null, null]);
  }
});

// ---------- 3) Başlıca yazar ----------
test("başlıca yazar payları", () => {
  yakin(H.baslicaPayi(1, null), 1, "tek yazar");
  yakin(H.baslicaPayi(2, "baslica"), 0.8, "2 yazar, başlıca");
  yakin(H.baslicaPayi(2, "diger"), 0.5, "2 yazar, diğer");
  yakin(H.baslicaPayi(3, "baslica"), 0.5, "3 yazar, başlıca");
  yakin(H.baslicaPayi(3, "diger"), 0.25, "3 yazar, diğer");
  yakin(H.baslicaPayi(5, "diger"), 0.125, "5 yazar, diğer");
  yakin(H.baslicaPayi(4, "belirtilmemis"), 0.25, "belirtilmemiş");
  yakin(H.baslicaPayi(4, null), 0.25, "boş");
});

test("başlıca yazar kuralı yalnızca makalelere uygulanır", () => {
  const e = [
    satir("1a-Q1", true, { yazarSayisi: 3, yazarlik: "baslica" }),
    satir("4a", true, { yazarSayisi: 3, yazarlik: "baslica" }),
    satir("8a", true, { yazarSayisi: 2, yazarlik: "baslica", kaynak: "K" })
  ];
  const fen = hes("02", e).satirlar.map((s) => s.puan);
  yakin(fen[0], 15, "makale: başlıca yazar yarısını alır");
  yakin(fen[1], 20 / 3, "kitap: eşit bölünür");
  yakin(fen[2], 2.5, "bildiri: eşit bölünür");
  const egitim = hes("01", e).satirlar.map((s) => s.puan);
  yakin(egitim[0], 10, "eşit bölme tablosunda başlıca bilgisi yok sayılır");
  // Sağlık: 1f (vaka takdimi) eşit bölünür
  yakin(hes("10", [satir("1f", true, { yazarSayisi: 4, yazarlik: "baslica" })]).satirlar[0].puan, 1.25, "1f");
});

test("başlıca yazar bilgisi boşsa eşit bölünür ve uyarı verilir", () => {
  const r = hes("09", [satir("2a", true, { yazarSayisi: 2, kaynak: "D" })]);
  yakin(r.satirlar[0].puan, 5, "eşit bölme");
  assert.ok(r.uyarilar.some((u) => /Başlıca yazar bilgisi girilmemiş/.test(u.mesaj)));
  assert.equal(hes("09", [satir("2a", true, { yazarSayisi: 1 })]).uyarilar.length, 0, "tek yazarlıda uyarı yok");
});

test("yazarlık metinleri okunur", () => {
  assert.equal(H.yazarlikCoz("Başlıca yazar benim"), "baslica");
  assert.equal(H.yazarlikCoz("Başlıca yazar başkası"), "diger");
  assert.equal(H.yazarlikCoz("Başlıca yazar belirtilmemiş"), "belirtilmemis");
  assert.equal(H.yazarlikCoz(""), null);
});

// ---------- 4) Ortak yeni kural: Aralık 2016 öncesi unvan (ÜAK SSS 59) ----------
test("Aralık 2016 öncesi unvan alanlarda 3. madde şartı aranmaz", () => {
  for (const t of TABLOLAR) {
    assert.equal(kos(hes(t.id, []), "m3").gecti, false, `Tablo ${t.no}`);
    const r = hes(t.id, [], { once2016: true });
    assert.equal(kos(r, "m3").gecti, true, `Tablo ${t.no}`);
    assert.equal(kos(r, "m3").deger, "Aranmaz");
  }
});

test("bir tabloda olmayan kod açıklamalı hata verir", () => {
  const r = hes("01", [satir("13c")]);
  assert.equal(r.satirlar[0].gecerli, false);
  assert.match(r.satirlar[0].notlar[0], /Tablo 1/);
});

// ---------- 5) Tablo bazında senaryolar ----------
test("Tablo 1: Q1–Q3’ten 30 puan; Q4 sayılmaz", () => {
  assert.equal(kos(hes("01", [satir("1a-Q4"), satir("1a-Q4"), satir("1a-Q4")]), "m1").gecti, false);
  assert.equal(kos(hes("01", [satir("1a-Q1")]), "m1").gecti, true);
  assert.equal(kos(hes("01", [satir("1a-Q1", false)]), "m1").gecti, false, "doktora öncesi");
});

test("Tablo 1: 2. madde biri 2a’dan iki yayın; 7. madde tavanı 15", () => {
  assert.equal(kos(hes("01", [satir("2b"), satir("2c")]), "m2").gecti, false);
  assert.equal(kos(hes("01", [satir("2a"), satir("2c")]), "m2").gecti, true);
  assert.equal(kos(hes("01", [satir("1c"), satir("2b")], { yabanci: true }), "m2").gecti, true, "yabancı uyruk");
  yakin(bol(hes("01", [satir("7a-Yürütücü"), satir("7b")]), 7).sayilan, 15, "7. madde");
});

test("Tablo 2: eşik bilim alanına göre; alan seçilmezse koşul belirlenemez", () => {
  const e = [satir("1a-Q2")]; // tek yazarlı → başlıca, 20 puan
  const bos = kos(hes("02", e), "m1");
  assert.equal(bos.gecti, false);
  assert.equal(bos.deger, "Alan seçilmedi");
  assert.equal(kos(hes("02", e, { alan: "Matematik" }), "m1").gecti, true);
  assert.equal(kos(hes("02", e, { alan: "Fizik" }), "m1").gecti, false);
  const iki = (rol) => [satir("1a-Q1", true, { yazarSayisi: 2, yazarlik: rol }), satir("1a-Q1", true, { yazarSayisi: 2, yazarlik: rol })];
  assert.equal(kos(hes("02", iki("baslica"), { alan: "Fizik" }), "m1").gecti, true, "24 + 24");
  assert.equal(kos(hes("02", iki("diger"), { alan: "Fizik" }), "m1").gecti, false, "15 + 15");
  // 40 puan var ama Q1–Q3 makalede başlıca yazarlık yok
  const q4 = [satir("1a-Q4"), satir("1a-Q4"), satir("1a-Q4"), satir("1a-Q4"), satir("1a-Q1", true, { yazarSayisi: 3, yazarlik: "diger" })];
  assert.equal(kos(hes("02", q4, { alan: "Kimya" }), "m1").gecti, false);
});

test("Tablo 2, 9, 12: 2a puan şartı ve yabancı uyruk alternatifi", () => {
  assert.equal(kos(hes("02", [satir("2a")]), "m2").gecti, true);
  assert.equal(kos(hes("02", [satir("1c")]), "m2").gecti, false);
  assert.equal(kos(hes("02", [satir("1c")], { yabanci: true }), "m2").gecti, true);
  assert.equal(kos(hes("12", [satir("2a")]), "m2").gecti, false, "Ziraat 20 puan ister");
  assert.equal(kos(hes("12", [satir("2a"), satir("2a")]), "m2").gecti, true);
  assert.equal(kos(hes("12", [satir("1c")], { yabanci: true }), "m2").gecti, false, "20 puan = 2 yayın");
  assert.equal(kos(hes("12", [satir("1c"), satir("1b")], { yabanci: true }), "m2").gecti, true);
  assert.equal(kos(hes("09", [satir("2a", true, { yazarSayisi: 2, yazarlik: "diger" })]), "m2").gecti, false, "5 puan");
});

test("Tablo 5: 2. madde (altı TR Dizin, dördü tek yazarlı, üç dergi, 50 puan)", () => {
  const tr = (y, d) => satir("2a", true, { yazarSayisi: y, kaynak: d });
  const gecen = [tr(1, "A"), tr(1, "A"), tr(1, "B"), tr(1, "C"), tr(2, "C"), tr(2, "C")]; // 40 + 10 = 50
  assert.equal(kos(hes("05", gecen), "m2").gecti, true);
  assert.equal(kos(hes("05", gecen.slice(0, 5)), "m2").gecti, false, "beş yayın");
  const ikiDergi = gecen.map((e) => Object.assign({}, e, { kaynak: e.kaynak === "C" ? "B" : e.kaynak }));
  assert.equal(kos(hes("05", ikiDergi), "m2").gecti, false, "iki dergi");
  const azPuan = [tr(1, "A"), tr(1, "A"), tr(1, "B"), tr(1, "C"), tr(3, "C"), tr(3, "C")]; // 40 + 6,67
  assert.equal(kos(hes("05", azPuan), "m2").gecti, false, "50 puanın altında");
  // Alternatif: 1a–1c'den biri tek yazarlı en az iki yayın ve 50 puan
  assert.equal(kos(hes("05", [satir("1a-Q1"), satir("1b", true, { yazarSayisi: 2 })]), "m2").gecti, false, "40 puan");
  assert.equal(kos(hes("05", [satir("1a-Q1"), satir("1b", true, { yazarSayisi: 2 }), satir("1c")]), "m2").gecti, true);
});

test("Tablo 5: 4. madde genel tavansız, c + d en fazla 30, kitap zorunlu", () => {
  yakin(bol(hes("05", [satir("4a"), satir("4a")]), 4).sayilan, 40, "genel tavan yok");
  yakin(bol(hes("05", [satir("4c"), satir("4c")]), 4).sayilan, 30, "c + d tavanı");
  assert.equal(kos(hes("05", [satir("4b", true, { kaynak: "K1" }), satir("4b", true, { kaynak: "K2" })]), "m4").gecti, false);
  assert.equal(kos(hes("05", [satir("4c")]), "m4").gecti, true);
});

test("Tablo 5: 8. maddede en az bir bildiriyi kendisi sunmuş olmalı", () => {
  const e = [satir("8a", true, { kaynak: "T1" }), satir("8b", true, { kaynak: "T2" })];
  assert.equal(kos(hes("05", e), "m8").gecti, false);
  e[1].kendisiSundu = true;
  assert.equal(kos(hes("05", e), "m8").gecti, true);
  assert.equal(kos(hes("11", [satir("8a", true, { kaynak: "T1" })]), "m8").gecti, true, "Tablo 11'de bu şart yok");
});

test("Tablo 9: 3ı 5 puan; 1. madde 40 puan ve Q1–Q3 başlıca", () => {
  yakin(hes("09", [satir("3ı")]).satirlar[0].puan, 5, "3ı");
  const e = [satir("1a-Q1", true, { yazarSayisi: 3, yazarlik: "baslica" }), // 15
             satir("1a-Q2", true, { yazarSayisi: 2, yazarlik: "diger" }),   // 10
             satir("1a-Q4"), satir("1a-Q4")];                              // 20
  assert.equal(kos(hes("09", e), "m1").gecti, true);
  assert.equal(kos(hes("09", e.slice(1)), "m1").gecti, false, "Q1–Q3 başlıca yok");
});

test("Tablo 10: 1. madde üç başlıca makale, 2. madde ikisi 2a’dan üç yayın", () => {
  const m = (rol) => satir("1a-Q2", true, { yazarSayisi: 2, yazarlik: rol }); // başlıca 16
  assert.equal(kos(hes("10", [m("baslica"), m("baslica"), m("baslica")]), "m1").gecti, true);
  assert.equal(kos(hes("10", [m("baslica"), m("baslica"), m("diger"), m("baslica")]), "m1").gecti, true);
  assert.equal(kos(hes("10", [m("baslica"), m("baslica"), m("diger"), m("diger")]), "m1").gecti, false, "iki başlıca");
  const u = (b, rol) => satir(b, true, { yazarSayisi: 2, yazarlik: rol, kaynak: "D" });
  assert.equal(kos(hes("10", [u("2a", "baslica"), u("2a", "baslica"), u("2c", "diger")]), "m2").gecti, true);
  assert.equal(kos(hes("10", [u("2a", "baslica"), u("2b", "baslica"), u("2c", "diger")]), "m2").gecti, false, "tek 2a");
  assert.equal(kos(hes("10", [u("2a", "baslica"), u("2a", "diger"), u("2c", "diger")]), "m2").gecti, false, "tek başlıca");
  assert.match(kos(hes("10", []), "doksan").ad, /Doktora\/uzmanlık sonrası/);
});

test("Tablo 12: 1. madde ve 7. madde tavanı 60", () => {
  assert.equal(kos(hes("12", [satir("1a-Q4"), satir("1a-Q4"), satir("1a-Q4")]), "m1").gecti, false, "Q1–Q3 yok");
  assert.equal(kos(hes("12", [satir("1a-Q2"), satir("1a-Q4")]), "m1").gecti, true, "30 puan, 20'si Q2, başlıca");
  assert.equal(kos(hes("12", [satir("1a-Q2", true, { yazarSayisi: 3, yazarlik: "diger" }), satir("1a-Q1")]), "m1").gecti, true);
  const p = Array.from({ length: 5 }, () => satir("7a-Yürütücü"));
  yakin(bol(hes("12", p), 7).sayilan, 60, "7. madde");
});
