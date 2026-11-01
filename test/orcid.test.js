// Çalıştırmak için: node --test test/orcid.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const O = require("../js/orcid-veri.js");
const ornek = require("./orcid-ornek.js");

test("ORCID numarası temizlenir ve kontrol basamağı doğrulanır", () => {
  assert.equal(O.orcidTemizle("https://orcid.org/0000-0002-1825-0097"), "0000-0002-1825-0097");
  assert.equal(O.orcidTemizle("0000000218250097"), "0000-0002-1825-0097");
  assert.equal(O.orcidGecerli("0000-0002-1825-0097"), true);
  assert.equal(O.orcidGecerli("0000-0002-1694-233X"), true);
  assert.equal(O.orcidGecerli("0000-0002-1825-0098"), false);
  assert.equal(O.orcidTemizle("abc"), null);
});

test("DOI biçimleri", () => {
  assert.equal(O.doiTemizle("https://doi.org/10.1000/ABC"), "10.1000/abc");
  assert.equal(O.doiTemizle("doi:10.1/x"), "10.1/x");
  assert.equal(O.doiTemizle("abc"), null);
});

test("ORCID yanıtı: her grup tek eser, tercih edilen sürüm alınır", () => {
  const e = O.eserleriAyikla(ornek);
  assert.equal(e.length, 6);
  assert.deepEqual(e[0], { putCode: 1, baslik: "Kamu politikasında ağ yönetişimi", tur: "journal-article",
    yil: 2021, kaynak: "Public Policy Review", doi: "10.1000/ssci.2021" });
  assert.equal(e[1].doi, null);
  assert.equal(e[2].doi, "10.1000/bolum.2018");
  assert.equal(e[5].yil, null);
  assert.deepEqual(O.eserleriAyikla({}), []);
});

test("Crossref: yazar sayısı ve dergi adı", () => {
  assert.deepEqual(O.crossrefAyikla({ message: { author: [{}, {}, {}], "container-title": ["Kitap X"] } }),
    { yazar: 3, kaynak: "Kitap X" });
  assert.deepEqual(O.crossrefAyikla({ message: { editor: [{}] } }), { yazar: 1, kaynak: "" });
  assert.deepEqual(O.crossrefAyikla({ message: {} }), { yazar: null, kaynak: "" });
});

test("doktora öncesi/sonrası: aynı yıl ve eksik bilgi belirsiz kalır", () => {
  assert.equal(O.doktoraSonrasiMi(2020, 2018), true);
  assert.equal(O.doktoraSonrasiMi(2017, 2018), false);
  assert.equal(O.doktoraSonrasiMi(2018, 2018), null);
  assert.equal(O.doktoraSonrasiMi(null, 2018), null);
  assert.equal(O.doktoraSonrasiMi(2020, null), null);
});

test("tür önerileri", () => {
  assert.ok(O.turBilgisi("book-chapter").oneri.includes("4d"));
  assert.equal(O.turBilgisi("dissertation-thesis").secili, false);
  assert.equal(O.turBilgisi("data-set").secili, false);
});

test("listede var mı: DOI ya da başlık (büyük/küçük harf ve noktalama duyarsız)", () => {
  const kume = O.mevcutAnahtarlar([
    { eserId: "Belediye Hizmetlerinde Memnuniyet.", madde: "2a" },
    { eserId: "Başka", doi: "10.1000/SSCI.2021" }
  ]);
  assert.equal(O.listedeVar({ baslik: "belediye hizmetlerinde memnuniyet", doi: null }, kume), true);
  assert.equal(O.listedeVar({ baslik: "Farklı", doi: "10.1000/ssci.2021" }, kume), true);
  assert.equal(O.listedeVar({ baslik: "Yeni", doi: null }, kume), false);
});

test("hesaplama sayfası biçimine çeviri ve motorla uyum", () => {
  const H = require("../js/hesap.js");
  const e = O.esereCevir({ baslik: "X", madde: "2a", doktoraSonrasi: true, yazar: 2, kaynak: "D", doi: "10.1/x" });
  assert.equal(e.madde, "2a");
  assert.match(e.not, /DOI: 10\.1\/x/);
  const r = H.hesapla({ eserler: [e] });
  assert.equal(r.satirlar[0].puan, 5);
});
