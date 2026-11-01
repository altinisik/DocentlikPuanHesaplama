/*
 * ORCID içe aktarma (beta): arayüzden bağımsız yardımcılar.
 * Tarayıcıda window.OrcidVeri, Node'da require("./orcid-veri.js").
 */
(function (root) {
  const ORCID_API = "https://pub.orcid.org/v3.0/";
  const CROSSREF_API = "https://api.crossref.org/works/";

  const deger = (o) => (o && typeof o === "object" && "value" in o ? o.value : o ?? null);
  const norm = (x) => String(x ?? "").toLocaleLowerCase("tr-TR").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

  /** "https://orcid.org/0000-0002-1825-0097", "0000000218250097" → "0000-0002-1825-0097" */
  function orcidTemizle(x) {
    const m = String(x || "").toUpperCase().match(/(\d{4})-?(\d{4})-?(\d{4})-?(\d{3}[\dX])/);
    return m ? `${m[1]}-${m[2]}-${m[3]}-${m[4]}` : null;
  }

  /** ISO 7064 11-2 kontrol basamağı */
  function orcidGecerli(id) {
    const d = String(id || "").replace(/-/g, "");
    if (!/^\d{15}[\dX]$/.test(d)) return false;
    let t = 0;
    for (let i = 0; i < 15; i++) t = (t + Number(d[i])) * 2;
    const c = (12 - (t % 11)) % 11;
    return (c === 10 ? "X" : String(c)) === d[15];
  }

  function doiTemizle(x) {
    if (!x) return null;
    const s = String(x).trim().toLowerCase()
      .replace(/^https?:\/\/(dx\.)?doi\.org\//, "").replace(/^doi:\s*/, "");
    return s.startsWith("10.") ? s : null;
  }

  /** ORCID /works yanıtını sade kayıtlara çevirir (her grup = bir eser, tercih edilen sürüm ilk sıradadır). */
  function eserleriAyikla(json) {
    const gruplar = (json && json.group) || [];
    return gruplar.map((g) => {
      const w = (g["work-summary"] || [])[0];
      if (!w) return null;
      const idler = [
        ...(((w["external-ids"] || {})["external-id"]) || []),
        ...(((g["external-ids"] || {})["external-id"]) || [])
      ].filter((i) => i && i["external-id-type"] === "doi");
      const doiId = idler.find((i) => i["external-id-relationship"] === "self") || idler[0];
      const doi = doiId
        ? doiTemizle(deger(doiId["external-id-normalized"]) || doiId["external-id-value"])
        : null;
      const yil = parseInt(deger(w["publication-date"] && w["publication-date"].year), 10);
      return {
        putCode: w["put-code"],
        baslik: String(deger(w.title && w.title.title) || "(başlıksız)").trim(),
        tur: w.type || "other",
        yil: Number.isFinite(yil) ? yil : null,
        kaynak: String(deger(w["journal-title"]) || "").trim(),
        doi
      };
    }).filter(Boolean);
  }

  /** Crossref /works/{doi} yanıtından yazar sayısı ve dergi/kitap adı */
  function crossrefAyikla(json) {
    const m = (json && json.message) || {};
    const yazar = Array.isArray(m.author) && m.author.length ? m.author.length
      : Array.isArray(m.editor) && m.editor.length ? m.editor.length : null;
    const kaynak = Array.isArray(m["container-title"]) && m["container-title"][0] ? m["container-title"][0] : "";
    return { yazar, kaynak };
  }

  /** Yayın yılı ile doktora yılını karşılaştırır. Aynı yıl ya da eksik bilgi → null (kullanıcı seçer). */
  function doktoraSonrasiMi(yil, doktoraYili) {
    if (!yil || !doktoraYili) return null;
    if (yil > doktoraYili) return true;
    if (yil < doktoraYili) return false;
    return null;
  }

  // ORCID türü → önerilen maddeler. Kesin atama yapılmaz; kullanıcı seçer.
  const TURLER = {
    "journal-article": { ad: "Makale", secili: true,
      oneri: ["1a-Q1", "1a-Q2", "1a-Q3", "1a-Q4", "1b", "1c", "1d", "1f", "2a", "2b", "3a", "3b", "3c", "3d"],
      ipucu: "İndeksine göre 1. ya da 2. madde; tezden üretildiyse 3. madde" },
    "book": { ad: "Kitap", secili: true, oneri: ["4a", "4c", "3e", "3g"],
      ipucu: "BKCI'daysa 4a, değilse 4c; tezden üretildiyse 3e/3g" },
    "book-chapter": { ad: "Kitap bölümü", secili: true, oneri: ["4b", "4d", "3f", "3h"],
      ipucu: "BKCI'daysa 4b, değilse 4d; tezden üretildiyse 3f/3h" },
    "conference-paper": { ad: "Bildiri", secili: true, oneri: ["8a", "8b", "3ı", "3i"],
      ipucu: "CPCI'daysa 8a, değilse 8b; tezden üretildiyse 3ı/3i" },
    "conference-abstract": { ad: "Bildiri özeti", secili: true, oneri: ["8a", "8b", "3ı", "3i"],
      ipucu: "CPCI'daysa 8a, değilse 8b; tezden üretildiyse 3ı/3i" },
    "conference-poster": { ad: "Poster", secili: true, oneri: ["8a", "8b", "3ı", "3i"],
      ipucu: "Tam metni/özeti yayımlandıysa 8. madde" },
    "book-review": { ad: "Kitap kritiği", secili: true, oneri: ["1e", "2c"],
      ipucu: "Uluslararası indeksli dergideyse 1e, değilse 2c" },
    "edited-book": { ad: "Editörlü kitap", secili: true, oneri: ["12b"],
      ipucu: "BKCI ya da Scopus'taysa 12b (editörlük)" },
    "dissertation-thesis": { ad: "Tez", secili: false, oneri: [], ipucu: "Tezin kendisi puanlanmaz" },
    "preprint": { ad: "Ön baskı", secili: false, oneri: [], ipucu: "Yayımlanmamış çalışma puanlanmaz" }
  };
  const turBilgisi = (tur) => TURLER[tur] ||
    { ad: tur.replace(/-/g, " "), secili: false, oneri: [], ipucu: "Bu tür genellikle puanlanmaz" };

  /** Mevcut listede aynı eser var mı? DOI ya da başlıkla karşılaştırır. */
  function anahtarlar(e) {
    const a = [];
    const doi = doiTemizle(e.doi);
    if (doi) a.push("doi:" + doi);
    const b = norm(e.baslik ?? e.eserId);
    if (b) a.push("t:" + b);
    return a;
  }
  function mevcutAnahtarlar(eserler) {
    const s = new Set();
    for (const e of eserler || []) anahtarlar(e).forEach((k) => s.add(k));
    return s;
  }
  const listedeVar = (kayit, kume) => anahtarlar(kayit).some((k) => kume.has(k));

  /** Hesaplama sayfasının satır biçimine çevirir */
  function esereCevir(k) {
    return {
      eserId: k.baslik,
      madde: k.madde || "",
      doktoraSonrasi: k.doktoraSonrasi ?? null,
      yazarSayisi: k.yazar ?? null,
      adet: null,
      kaynak: k.kaynak || "",
      tezKaynakli: null,
      not: k.doi ? `ORCID'den aktarıldı · DOI: ${k.doi}` : "ORCID'den aktarıldı",
      doi: k.doi || null
    };
  }

  const OrcidVeri = { ORCID_API, CROSSREF_API, orcidTemizle, orcidGecerli, doiTemizle, eserleriAyikla,
    crossrefAyikla, doktoraSonrasiMi, TURLER, turBilgisi, mevcutAnahtarlar, listedeVar, esereCevir };
  if (typeof module !== "undefined" && module.exports) module.exports = OrcidVeri;
  else root.OrcidVeri = OrcidVeri;
})(typeof window !== "undefined" ? window : globalThis);
