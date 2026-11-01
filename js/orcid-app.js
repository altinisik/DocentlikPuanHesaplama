/* ORCID içe aktarma (beta) arayüzü. Hesaplama sayfasıyla aynı tarayıcı deposunu kullanır. */
(function () {
  const K = window.KURALLAR;
  const O = window.OrcidVeri;
  const ANA_DEPO = "docentlik-puan-v1";      // hesaplama sayfasının deposu
  const ORCID_DEPO = "docentlik-orcid-v1";   // bu sayfanın son girdileri
  const $ = (s) => document.querySelector(s);
  const esc = (x) => String(x ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const kalemByKod = new Map(K.kalemler.map((k) => [k.kod, k]));

  let kayitlar = [];

  // ---------- depo ----------
  function oku(anahtar) {
    try { return JSON.parse(localStorage.getItem(anahtar) || "null"); } catch (e) { return null; }
  }
  function yaz(anahtar, deger) {
    try { localStorage.setItem(anahtar, JSON.stringify(deger)); return true; } catch (e) { return false; }
  }
  function anaListe() {
    const v = oku(ANA_DEPO);
    return v && Array.isArray(v.eserler) ? v
      : { ayarlar: { alan: "Diğer", yabanci: false, kadrolu: false }, eserler: [] };
  }

  const son = oku(ORCID_DEPO) || {};
  if (son.orcid) $("#orcid").value = son.orcid;
  if (son.doktoraYili) $("#dryil").value = son.doktoraYili;

  function durum(mesaj, hata = false) {
    const el = $("#durum");
    el.textContent = mesaj;
    el.classList.toggle("hata", hata);
  }

  // ---------- madde seçimi ----------
  function maddeSecenekleri(tur, secili) {
    const oneri = O.turBilgisi(tur).oneri;
    const sec = (kod) => (kod === secili ? " selected" : "");
    let h = `<option value="">Seçin…</option>`;
    if (oneri.length) {
      h += `<optgroup label="Önerilen">` + oneri.map((kod) =>
        `<option value="${esc(kod)}"${sec(kod)}>${esc(kod)} · ${esc(kalemByKod.get(kod).ad)}</option>`).join("") + "</optgroup>";
    }
    for (const [no, b] of Object.entries(K.bolumler)) {
      const kalemler = K.kalemler.filter((k) => k.bolum === +no && !oneri.includes(k.kod));
      if (!kalemler.length) continue;
      h += `<optgroup label="${no}. ${esc(b.ad)}">` + kalemler.map((k) =>
        `<option value="${esc(k.kod)}"${sec(k.kod)}>${esc(k.kod)} · ${esc(k.ad)}</option>`).join("") + "</optgroup>";
    }
    return h;
  }

  const ehSecim = (v, pasif) => `<select data-f="doktoraSonrasi" aria-label="Doktora sonrası" class="${v == null && !pasif ? "eksik" : ""}" ${pasif ? "disabled" : ""}>
      <option value=""${v == null ? " selected" : ""}>?</option>
      <option value="E"${v === true ? " selected" : ""}>E</option>
      <option value="H"${v === false ? " selected" : ""}>H</option></select>`;

  // ---------- tablo ----------
  function satirHTML(k, i) {
    const t = O.turBilgisi(k.tur);
    const pasif = k.listede;
    const yazarNot = k.yazarKaynak === "crossref" ? "Crossref" : k.doi ? (k.crossrefBekliyor ? "aranıyor…" : "bulunamadı") : "DOI yok";
    return `<tr data-i="${i}" class="${pasif ? "pasif" : ""}${k.secili ? "" : " secilmedi"}">
      <td class="sec"><input type="checkbox" data-f="secili" ${k.secili ? "checked" : ""} ${pasif ? "disabled" : ""}
        aria-label="${esc(k.baslik)} aktarılsın"></td>
      <td class="baslik">${esc(k.baslik)}
        ${k.doi ? `<a class="doi" href="https://doi.org/${encodeURI(k.doi)}" target="_blank" rel="noopener">doi:${esc(k.doi)}</a>` : ""}
        ${pasif ? `<span class="etiket">Listenizde zaten var</span>` : ""}</td>
      <td class="tur">${esc(t.ad)}</td>
      <td class="yil">${k.yil ?? "–"}</td>
      <td class="kaynak"><input data-f="kaynak" value="${esc(k.kaynak)}" aria-label="Dergi, kitap ya da toplantı adı" ${pasif ? "disabled" : ""}></td>
      <td class="yazar"><input type="number" min="1" step="1" data-f="yazar" value="${k.yazar ?? ""}" placeholder="?"
        class="${k.yazar ? "" : "eksik"}" aria-label="Yazar sayısı" ${pasif ? "disabled" : ""}><small data-o="yazarNot">${yazarNot}</small></td>
      <td class="ds">${ehSecim(k.doktoraSonrasi, pasif)}</td>
      <td class="madde"><select data-f="madde" class="${k.madde ? "" : "eksik"}" aria-label="Madde" ${pasif ? "disabled" : ""}>${maddeSecenekleri(k.tur, k.madde)}</select>
        <small>${esc(t.ipucu)}</small></td>
    </tr>`;
  }

  function ciz() {
    $("#govde").innerHTML = kayitlar.map(satirHTML).join("");
    ozetGuncelle();
  }

  function ozetGuncelle() {
    const aktif = kayitlar.filter((k) => !k.listede);
    const secili = aktif.filter((k) => k.secili);
    const maddesiz = secili.filter((k) => !k.madde).length;
    const yazarsiz = secili.filter((k) => !k.yazar).length;
    const dsBelirsiz = secili.filter((k) => k.doktoraSonrasi == null).length;
    const listede = kayitlar.length - aktif.length;
    $("#ozet").textContent = `${kayitlar.length} yayın bulundu, ${secili.length} tanesi seçili` +
      (listede ? `, ${listede} tanesi listenizde zaten var.` : ".");
    const notlar = [];
    if (maddesiz) notlar.push(`${maddesiz} yayında madde seçilmedi; bunlar hesaplama sayfasında madde seçilene kadar puan almaz.`);
    if (yazarsiz) notlar.push(`${yazarsiz} yayında yazar sayısı yok; tek yazarlı kabul edilir.`);
    if (dsBelirsiz) notlar.push(`${dsBelirsiz} yayında doktora öncesi/sonrası belirsiz; doktora öncesi kabul edilir.`);
    $("#ekle-not").textContent = notlar.join(" ");
    $("#ekle").disabled = secili.length === 0;
  }

  $("#govde").addEventListener("input", (ev) => {
    const el = ev.target.closest("[data-f]");
    if (!el) return;
    const k = kayitlar[+el.closest("tr").dataset.i];
    const f = el.dataset.f;
    if (f === "secili") k.secili = el.checked;
    else if (f === "kaynak") k.kaynak = el.value;
    else if (f === "yazar") { k.yazar = el.value === "" ? null : Number(el.value); k.yazarKaynak = "elle"; }
    else if (f === "doktoraSonrasi") k.doktoraSonrasi = el.value === "" ? null : el.value === "E";
    else if (f === "madde") { k.madde = el.value; if (k.madde) k.secili = true; }
    if (f === "madde" && k.madde) el.closest("tr").querySelector('[data-f="secili"]').checked = true;
    if (f !== "secili" && f !== "kaynak") el.classList.toggle("eksik", el.value === "");
    el.closest("tr").classList.toggle("secilmedi", !k.secili);
    ozetGuncelle();
  });

  $("#hepsi").addEventListener("click", () => { kayitlar.forEach((k) => { if (!k.listede) k.secili = true; }); ciz(); });
  $("#hicbiri").addEventListener("click", () => { kayitlar.forEach((k) => { k.secili = false; }); ciz(); });

  // ---------- veri çekme ----------
  async function jsonGetir(url, zamanAsimi = 20000) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), zamanAsimi);
    try {
      const y = await fetch(url, { headers: { Accept: "application/json" }, signal: ac.signal });
      return { durum: y.status, json: y.ok ? await y.json() : null };
    } finally { clearTimeout(t); }
  }

  async function crossrefTamamla() {
    const bekleyen = kayitlar.filter((k) => k.doi && !k.yazar && !k.listede);
    if (!bekleyen.length) return;
    bekleyen.forEach((k) => { k.crossrefBekliyor = true; });
    let biten = 0;
    const toplam = bekleyen.length;
    durum(`Yazar sayıları Crossref’ten alınıyor: 0/${toplam}`);
    const kuyruk = bekleyen.slice();
    async function isci() {
      while (kuyruk.length) {
        const k = kuyruk.shift();
        try {
          const { json } = await jsonGetir(O.CROSSREF_API + encodeURIComponent(k.doi), 15000);
          if (json) {
            const c = O.crossrefAyikla(json);
            if (c.yazar && k.yazar == null) { k.yazar = c.yazar; k.yazarKaynak = "crossref"; }
            if (c.kaynak && !k.kaynak) k.kaynak = c.kaynak;
          }
        } catch (e) { /* bulunamadı; kullanıcı elle girer */ }
        k.crossrefBekliyor = false;
        biten++;
        satiriYenile(k);
        durum(`Yazar sayıları Crossref’ten alınıyor: ${biten}/${toplam}`);
        await new Promise((r) => setTimeout(r, 350)); // Crossref'e nazik davran
      }
    }
    await Promise.all([isci(), isci()]);
    const bulunan = bekleyen.filter((k) => k.yazarKaynak === "crossref").length;
    durum(`Hazır. ${toplam} DOI’li yayının ${bulunan} tanesinde yazar sayısı Crossref’ten alındı. Turuncu alanları kontrol edin.`);
  }

  function satiriYenile(k) {
    const i = kayitlar.indexOf(k);
    const tr = document.querySelector(`#govde tr[data-i="${i}"]`);
    if (!tr) return;
    const yeni = document.createElement("tbody");
    yeni.innerHTML = satirHTML(k, i);
    // kullanıcı o sırada bu satırda yazıyorsa satırı değiştirme, yalnızca yazar alanını güncelle
    if (tr.contains(document.activeElement)) {
      const inp = tr.querySelector('[data-f="yazar"]');
      if (document.activeElement !== inp && k.yazar) { inp.value = k.yazar; inp.classList.remove("eksik"); }
      tr.querySelector('[data-o="yazarNot"]').textContent = yeni.querySelector('[data-o="yazarNot"]').textContent;
    } else {
      tr.replaceWith(yeni.firstElementChild);
    }
    ozetGuncelle();
  }

  $("#form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const id = O.orcidTemizle($("#orcid").value);
    if (!id || !O.orcidGecerli(id)) {
      durum("Geçerli bir ORCID numarası girin (ör. 0000-0002-1825-0097). Numarayı ORCID profilinizden kopyalayabilirsiniz.", true);
      $("#orcid").focus();
      return;
    }
    $("#orcid").value = id;
    const drYil = parseInt($("#dryil").value, 10) || null;
    yaz(ORCID_DEPO, { orcid: id, doktoraYili: drYil });

    $("#getir").disabled = true;
    $("#basari").hidden = true;
    durum("ORCID kaydı getiriliyor…");
    try {
      const { durum: kod, json } = await jsonGetir(`${O.ORCID_API}${id}/works`);
      if (kod === 404) throw new Error("Bu numarayla bir ORCID kaydı bulunamadı. Numarayı kontrol edin.");
      if (kod === 409) throw new Error("Bu ORCID kaydı kilitli ya da devre dışı.");
      if (!json) throw new Error(`ORCID yanıt vermedi (hata ${kod}). Biraz sonra tekrar deneyin.`);
      const mevcut = O.mevcutAnahtarlar(anaListe().eserler);
      kayitlar = O.eserleriAyikla(json)
        .sort((a, b) => (b.yil || 0) - (a.yil || 0))
        .map((k) => {
          const listede = O.listedeVar(k, mevcut);
          return Object.assign(k, {
            listede,
            secili: !listede && O.turBilgisi(k.tur).secili,
            madde: "",
            yazar: null,
            yazarKaynak: null,
            doktoraSonrasi: O.doktoraSonrasiMi(k.yil, drYil)
          });
        });
      if (!kayitlar.length) {
        $("#onizleme").hidden = true;
        durum("Bu ORCID kaydında herkese açık yayın yok. ORCID’de yayınlarınızın görünürlüğünün “Herkese açık” olduğunu kontrol edin.", true);
        return;
      }
      $("#onizleme").hidden = false;
      ciz();
      durum(`${kayitlar.length} yayın bulundu.` + (drYil ? "" : " Doktora yılını girmediğiniz için doktora öncesi/sonrası bilgisi boş bırakıldı."));
      await crossrefTamamla();
    } catch (err) {
      const mesaj = err.name === "AbortError" ? "ORCID zamanında yanıt vermedi. Biraz sonra tekrar deneyin."
        : err instanceof TypeError ? "ORCID’e bağlanılamadı. İnternet bağlantınızı kontrol edin."
        : err.message;
      durum(mesaj, true);
    } finally {
      $("#getir").disabled = false;
    }
  });

  // ---------- listeye ekleme ----------
  $("#ekle").addEventListener("click", () => {
    const secilen = kayitlar.filter((k) => k.secili && !k.listede);
    if (!secilen.length) return;
    const liste = anaListe();
    const mevcut = O.mevcutAnahtarlar(liste.eserler);
    const yeni = secilen.filter((k) => !O.listedeVar(k, mevcut)).map(O.esereCevir);
    liste.eserler.push(...yeni);
    if (!yaz(ANA_DEPO, liste)) {
      durum("Tarayıcı deposuna yazılamadı. Gizli pencere kullanıyorsanız normal pencerede deneyin.", true);
      return;
    }
    secilen.forEach((k) => { k.listede = true; k.secili = false; });
    ciz();
    $("#basari-metin").textContent = `${yeni.length} yayın listenize eklendi. Listenizde artık ${liste.eserler.length} satır var.`;
    $("#basari").hidden = false;
    $("#basari").scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
})();
