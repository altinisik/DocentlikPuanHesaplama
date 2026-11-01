/* Arayüz: durum, tablo düzenleme, Excel okuma/yazma ve sonuçların gösterimi. */
(function () {
  const K = window.KURALLAR;
  const H = window.Hesap;
  const DEPO = "docentlik-puan-v1";
  const $ = (s) => document.querySelector(s);
  const esc = (x) => String(x ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = H.fmt;

  const SUTUNLAR = ["Eser / Faaliyet", "Madde", "Doktora Sonrası (E/H)", "Yazar / Kişi Sayısı", "Adet",
                    "Dergi / Kitap / Toplantı Adı", "Tezden Üretildi (E/H)", "Not"];
  const kalemByKod = new Map(K.kalemler.map((k) => [k.kod, k]));
  const maddeMetni = (kod) => (kalemByKod.has(kod) ? `${kod} · ${kalemByKod.get(kod).ad}` : kod);

  // ---------- durum ----------
  let durum = { ayarlar: { alan: "Diğer", yabanci: false, kadrolu: false }, eserler: [] };
  let sonuc = null;

  function yukle() {
    try {
      const v = JSON.parse(localStorage.getItem(DEPO) || "null");
      if (v && Array.isArray(v.eserler)) durum = { ayarlar: Object.assign(durum.ayarlar, v.ayarlar), eserler: v.eserler };
    } catch (e) { /* depo kullanılamıyor: boş başla */ }
  }
  let kayitZaman;
  function kaydet() {
    clearTimeout(kayitZaman);
    kayitZaman = setTimeout(() => {
      try { localStorage.setItem(DEPO, JSON.stringify(durum)); } catch (e) { /* yoksay */ }
    }, 250);
  }

  const bosEser = () => ({ eserId: "", madde: "", doktoraSonrasi: null, yazarSayisi: null, adet: null,
                           kaynak: "", tezKaynakli: null, not: "" });

  function bildir(mesaj) {
    const d = document.createElement("div");
    d.className = "bildirim"; d.setAttribute("role", "status"); d.textContent = mesaj;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3200);
  }

  // ---------- madde seçenekleri ----------
  const maddeSecenekleri = (() => {
    let html = '<option value="">Seçin…</option>';
    for (const [no, b] of Object.entries(K.bolumler)) {
      html += `<optgroup label="${no}. ${esc(b.ad)}">`;
      for (const k of K.kalemler.filter((k) => k.bolum === +no)) {
        html += `<option value="${esc(k.kod)}">${esc(k.kod)} · ${esc(k.ad)}</option>`;
      }
      html += "</optgroup>";
    }
    return html;
  })();

  const ehSecim = (deger, f) => `<select data-f="${f}" class="c-eh">
      <option value=""${deger == null ? " selected" : ""}>–</option>
      <option value="E"${deger === true ? " selected" : ""}>E</option>
      <option value="H"${deger === false ? " selected" : ""}>H</option></select>`;

  function satirHTML(e, i) {
    return `<tbody data-i="${i}">
      <tr class="eser">
        <td class="no">${i + 1}</td>
        <td class="c-eser"><input data-f="eserId" value="${esc(e.eserId)}" title="${esc(e.eserId)}" aria-label="Eser ${i + 1} adı"></td>
        <td class="c-madde"><select data-f="madde" aria-label="Eser ${i + 1} maddesi">${maddeSecenekleri}</select></td>
        <td class="c-eh">${ehSecim(e.doktoraSonrasi, "doktoraSonrasi")}</td>
        <td class="c-sayi"><input type="number" min="1" step="1" inputmode="numeric" data-f="yazarSayisi" value="${esc(e.yazarSayisi)}" aria-label="Yazar veya kişi sayısı"></td>
        <td class="c-sayi"><input type="number" min="0" step="1" inputmode="numeric" data-f="adet" value="${esc(e.adet)}" aria-label="Adet"></td>
        <td class="c-kaynak"><input data-f="kaynak" value="${esc(e.kaynak)}" aria-label="Dergi, kitap veya toplantı adı"></td>
        <td class="c-eh">${ehSecim(e.tezKaynakli, "tezKaynakli")}</td>
        <td class="puan" data-o="puan"></td>
        <td class="puan sayilan" data-o="sayilan"></td>
        <td><button class="sil" type="button" aria-label="${i + 1}. satırı sil" title="Satırı sil">×</button></td>
      </tr>
      <tr class="notlar" hidden><td></td><td colspan="10" data-o="notlar"></td></tr>
    </tbody>`;
  }

  function maddeAyarla(tb, e) {
    const sel = tb.querySelector('select[data-f="madde"]');
    if (e.madde && !kalemByKod.has(e.madde)) {
      const o = document.createElement("option");
      o.value = e.madde; o.textContent = `Tanınmadı: ${e.madde}`;
      sel.prepend(o);
    }
    sel.value = e.madde || "";
    alanlariEtkinlestir(tb, e);
  }

  function alanlariEtkinlestir(tb, e) {
    const k = kalemByKod.get(e.madde);
    const yazar = tb.querySelector('[data-f="yazarSayisi"]');
    const adet = tb.querySelector('[data-f="adet"]');
    yazar.disabled = !!k && k.tip !== "yayin";
    adet.disabled = !!k && k.tip !== "adet" && k.tip !== "ogretim";
    yazar.placeholder = yazar.disabled ? "" : "1";
    adet.placeholder = adet.disabled ? "" : k && k.tip === "ogretim" ? (k.bent === "9a" ? "yarıyıl" : "yıl") : "atıf";
  }

  function tabloyuCiz() {
    const tablo = document.querySelector("table.eserler");
    tablo.querySelectorAll("tbody[data-i]").forEach((t) => t.remove());
    $("#govde-bos").hidden = durum.eserler.length > 0;
    tablo.insertAdjacentHTML("beforeend", durum.eserler.map(satirHTML).join(""));
    tablo.querySelectorAll("tbody[data-i]").forEach((tb) => maddeAyarla(tb, durum.eserler[+tb.dataset.i]));
  }

  // ---------- hesap ve sonuçlar ----------
  function hesaplaVeGoster() {
    sonuc = H.hesapla(durum, K);
    satirCiktilari();
    kararCiz();
    cetvelCiz();
    kosullariCiz();
    bolumleriCiz();
    uyarilariCiz();
  }

  function satirCiktilari() {
    const satirUyari = new Map();
    for (const u of sonuc.uyarilar) {
      if (u.satir == null) continue;
      if (!satirUyari.has(u.satir)) satirUyari.set(u.satir, []);
      satirUyari.get(u.satir).push(u.mesaj);
    }
    document.querySelectorAll("table.eserler tbody[data-i]").forEach((tb) => {
      const i = +tb.dataset.i;
      const s = sonuc.satirlar[i];
      const e = durum.eserler[i];
      const tr = tb.querySelector("tr.eser");
      const bos = !e.madde;
      tb.querySelector('[data-o="puan"]').textContent = s.gecerli ? fmt(s.puan) : "–";
      tb.querySelector('[data-o="sayilan"]').textContent = s.gecerli ? fmt(s.sayilan) : "–";
      tr.classList.toggle("kirpildi", s.gecerli && s.puan - s.sayilan > 1e-9);
      tr.classList.toggle("hatali", !bos && !s.gecerli);
      const notlar = bos ? [] : [...new Set([...(s.notlar || []), ...(satirUyari.get(i + 1) || [])])];
      const nTr = tb.querySelector("tr.notlar");
      nTr.hidden = notlar.length === 0;
      tb.querySelector('[data-o="notlar"]').textContent = notlar.join(" ");
    });
  }

  function kararCiz() {
    const el = $("#karar");
    const eksik = sonuc.kosullar.filter((k) => !k.gecti).length;
    el.className = "karar";
    if (!durum.eserler.length) {
      el.textContent = "Eser ekledikçe puanınız ve eksik koşullarınız burada görünür.";
    } else if (sonuc.gecti) {
      el.classList.add("gecti");
      el.textContent = `Başvuru şartlarını sağlıyorsunuz: toplam ${fmt(sonuc.toplam)}, doktora sonrası ${fmt(sonuc.doksan)} puan.`;
    } else {
      el.classList.add("kaldi");
      el.textContent = `${eksik} koşul henüz sağlanmıyor. Toplam ${fmt(sonuc.toplam)}, doktora sonrası ${fmt(sonuc.doksan)} puan.`;
    }
  }

  function cetvelCiz() {
    const maks = Math.max(150, Math.ceil((sonuc.toplam + 1) / 25) * 25);
    const yuzde = (x) => `${(100 * x) / maks}%`;
    const seritler = [
      { ad: "Toplam puan", deger: sonuc.toplam, hedef: K.esikToplam, alan: "sayilan" },
      { ad: "Doktora sonrası (3. madde hariç)", deger: sonuc.doksan, hedef: K.esikDoktoraSonrasi, alan: "doksana" }
    ];
    $("#cetvel").innerHTML = seritler.map((s) => {
      const parcalar = sonuc.bolumler.filter((b) => b[s.alan] > 0).map((b) =>
        `<div class="parca" style="width:${(100 * b[s.alan]) / Math.max(s.deger, 1e-9)}%;background:var(--b${b.no})" title="${b.no}. ${esc(b.ad)}: ${fmt(b[s.alan])}"></div>`).join("");
      return `<div class="serit">
        <div class="ad">${s.ad}</div>
        <div class="ray" role="img" aria-label="${s.ad}: ${fmt(s.deger)}, hedef ${s.hedef}">
          <div class="dolgu" style="width:${yuzde(Math.min(s.deger, maks))}">${parcalar}</div>
          <div class="hedef" style="left:${yuzde(s.hedef)}"><span>${s.hedef}</span></div>
        </div>
        <div class="deger">${fmt(s.deger)} <small>/ ${s.hedef}</small></div>
      </div>`;
    }).join("") + `<div class="olcek" aria-hidden="true">${
      Array.from({ length: maks / 25 + 1 }, (_, j) => `<span style="left:${yuzde(j * 25)}">${j * 25}</span>`).join("")}</div>`;

    $("#lejant").innerHTML = sonuc.bolumler.filter((b) => b.sayilan > 0)
      .map((b) => `<li><i style="background:var(--b${b.no})"></i>${b.no}. ${esc(b.ad)} ${fmt(b.sayilan)}</li>`).join("");
  }

  function kosullariCiz() {
    const n = sonuc.kosullar.length;
    const tamam = sonuc.kosullar.filter((k) => k.gecti).length;
    $("#kosul-ozet").textContent = `${n} koşuldan ${tamam} tanesi sağlanıyor.`;
    $("#kosullar").innerHTML = sonuc.kosullar.map((k) => `
      <li class="${k.gecti ? "ok" : "yok"}">
        <span class="isaret" aria-label="${k.gecti ? "Sağlanıyor" : "Sağlanmıyor"}">${k.gecti ? "✓" : "✗"}</span>
        <span>${esc(k.ad)}</span>
        <span class="dgr">${esc(k.deger)}</span>
        ${k.aciklama ? `<span class="acik">${esc(k.aciklama)}</span>` : ""}
      </li>`).join("");
  }

  function bolumleriCiz() {
    const satir = (b) => `<tr class="${b.ham > 0 ? "" : "sifir"}">
      <td><i style="background:var(--b${b.no})"></i>${b.no}. ${esc(b.ad)}</td>
      <td class="n">${fmt(b.ham)}</td>
      <td class="n">${b.tavan ?? "–"}</td>
      <td class="n">${fmt(b.sayilan)}</td>
      <td class="n">${b.no === 3 ? "<span title='90 puan şartına sayılmaz'>sayılmaz</span>" : fmt(b.ds)}</td>
      <td class="n${b.kirpilan > 1e-9 ? " kirp" : ""}">${b.kirpilan > 1e-9 ? fmt(b.kirpilan) : "–"}</td>
    </tr>`;
    const t = (f) => fmt(sonuc.bolumler.reduce((a, b) => a + b[f], 0));
    $("#bolumler").innerHTML = `
      <thead><tr><th>Madde</th><th class="n">Ham</th><th class="n">Tavan</th><th class="n">Sayılan</th>
        <th class="n">Doktora sonrası</th><th class="n">Sayılmayan</th></tr></thead>
      <tbody>${sonuc.bolumler.map(satir).join("")}</tbody>
      <tfoot><tr><td>Toplam</td><td class="n">${t("ham")}</td><td></td><td class="n">${fmt(sonuc.toplam)}</td>
        <td class="n">${fmt(sonuc.doksan)}</td><td class="n">${t("kirpilan")}</td></tr></tfoot>`;
  }

  function uyarilariCiz() {
    const liste = sonuc.uyarilar.filter((u) => u.satir == null || durum.eserler[u.satir - 1]?.madde);
    $("#uyarilar-bolum").hidden = liste.length === 0;
    $("#uyarilar").innerHTML = liste.map((u) => `<li>${u.satir ? `<button type="button" data-git="${u.satir}">Satır ${u.satir}</button>: ` : ""}${esc(u.mesaj)}</li>`).join("");
  }

  // ---------- olaylar ----------
  let hesapZaman;
  function degisti(gecikme = 120) {
    kaydet();
    clearTimeout(hesapZaman);
    hesapZaman = setTimeout(hesaplaVeGoster, gecikme);
  }

  function alanDegeri(el) {
    const f = el.dataset.f;
    if (f === "doktoraSonrasi" || f === "tezKaynakli") return el.value === "" ? null : el.value === "E";
    if (f === "yazarSayisi" || f === "adet") return el.value === "" ? null : Number(el.value);
    return el.value;
  }

  const tablo = document.querySelector("table.eserler");
  tablo.addEventListener("input", (ev) => {
    const el = ev.target.closest("[data-f]");
    if (!el) return;
    const tb = el.closest("tbody[data-i]");
    const e = durum.eserler[+tb.dataset.i];
    e[el.dataset.f] = alanDegeri(el);
    if (el.dataset.f === "madde") alanlariEtkinlestir(tb, e);
    degisti(el.tagName === "SELECT" ? 0 : 150);
  });
  tablo.addEventListener("click", (ev) => {
    const b = ev.target.closest("button.sil");
    if (!b) return;
    const i = +b.closest("tbody[data-i]").dataset.i;
    durum.eserler.splice(i, 1);
    tabloyuCiz(); degisti(0);
  });

  $("#ekle").addEventListener("click", () => {
    durum.eserler.push(bosEser());
    tabloyuCiz(); degisti(0);
    const son = document.querySelector("table.eserler tbody[data-i]:last-of-type input");
    if (son) son.focus();
  });

  $("#uyarilar").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-git]");
    if (!b) return;
    const tb = document.querySelector(`tbody[data-i="${+b.dataset.git - 1}"]`);
    if (tb) { tb.scrollIntoView({ block: "center", behavior: "smooth" }); tb.querySelector("select,input").focus({ preventScroll: true }); }
  });

  $("#temizle").addEventListener("click", () => {
    if (!durum.eserler.length) return;
    if (!confirm("Tüm satırlar silinsin mi? Önce Excel olarak kaydetmek isteyebilirsiniz.")) return;
    durum.eserler = [];
    tabloyuCiz(); degisti(0);
  });

  // ayarlar
  const alanSec = $("#ay-alan");
  alanSec.innerHTML = [...K.iletisimAlanlari, "Diğer"]
    .map((a) => `<option value="${esc(a)}">${a === "Diğer" ? "Diğer alanlar" : esc(a)}</option>`).join("");
  function ayarlariCiz() {
    alanSec.value = K.iletisimAlanlari.includes(durum.ayarlar.alan) ? durum.ayarlar.alan : "Diğer";
    $("#ay-kadrolu").checked = !!durum.ayarlar.kadrolu;
    $("#ay-yabanci").checked = !!durum.ayarlar.yabanci;
  }
  alanSec.addEventListener("change", () => { durum.ayarlar.alan = alanSec.value; degisti(0); });
  $("#ay-kadrolu").addEventListener("change", (e) => { durum.ayarlar.kadrolu = e.target.checked; degisti(0); });
  $("#ay-yabanci").addEventListener("change", (e) => { durum.ayarlar.yabanci = e.target.checked; degisti(0); });

  // ---------- Excel okuma ----------
  const anahtar = (x) => H.ascii(H.norm(x));
  function sutunHaritasi(baslik) {
    const h = {};
    baslik.forEach((b, j) => {
      const s = anahtar(b);
      if (!s) return;
      if (s.includes("madde")) h.madde ??= j;
      else if (s.includes("doktora")) h.doktoraSonrasi ??= j;
      else if (s.includes("yazar") || s.includes("kisi")) h.yazarSayisi ??= j;
      else if (s.includes("adet")) h.adet ??= j;
      else if (s.includes("tez")) h.tezKaynakli ??= j;
      else if (s.includes("dergi") || s.includes("kitap") || s.includes("toplanti") || s.includes("kaynak")) h.kaynak ??= j;
      else if (s.includes("eser") || s.includes("faaliyet")) h.eserId ??= j;
      else if (s.startsWith("not")) h.not ??= j;
    });
    return h;
  }

  function excelOku(veri) {
    const wb = XLSX.read(veri, { type: "array" });
    const sayfa = (a) => wb.SheetNames.find((n) => anahtar(n).includes(a));
    const eAd = sayfa("eser") || wb.SheetNames[0];
    const satirlar = XLSX.utils.sheet_to_json(wb.Sheets[eAd], { header: 1, defval: null, blankrows: false });
    const bi = satirlar.findIndex((r) => r.some((c) => anahtar(c).includes("madde")));
    if (bi < 0) throw new Error("Eserler sayfasında “Madde” başlıklı sütun bulunamadı. Şablondaki başlıkları değiştirmeden kullanın.");
    const h = sutunHaritasi(satirlar[bi]);
    const al = (r, f) => (h[f] == null ? null : r[h[f]]);
    const metin = (x) => (x == null ? "" : String(x).trim());
    const sayiVeyaBos = (x) => { const n = H.sayi(x); return Number.isFinite(n) ? n : null; };

    const eserler = [];
    for (const r of satirlar.slice(bi + 1)) {
      if (!r.some((c) => metin(c) !== "")) continue;
      const hamMadde = metin(al(r, "madde"));
      const c = H.kodCoz(hamMadde, K);
      eserler.push({
        eserId: metin(al(r, "eserId")),
        madde: c.kalem ? c.kalem.kod : hamMadde,
        doktoraSonrasi: H.ehCoz(al(r, "doktoraSonrasi")),
        yazarSayisi: sayiVeyaBos(al(r, "yazarSayisi")),
        adet: sayiVeyaBos(al(r, "adet")),
        kaynak: metin(al(r, "kaynak")),
        tezKaynakli: H.ehCoz(al(r, "tezKaynakli")),
        not: metin(al(r, "not"))
      });
    }

    const ayarlar = { alan: "Diğer", yabanci: false, kadrolu: false };
    const aAd = sayfa("ayar");
    if (aAd) {
      for (const r of XLSX.utils.sheet_to_json(wb.Sheets[aAd], { header: 1, defval: null })) {
        const a = anahtar(r[0]);
        if (a.includes("alan")) {
          const v = metin(r[1]);
          ayarlar.alan = K.iletisimAlanlari.find((x) => anahtar(x) === anahtar(v)) || "Diğer";
        } else if (a.includes("yabanc")) ayarlar.yabanci = H.ehCoz(r[1]) === true;
        else if (a.includes("kadro")) ayarlar.kadrolu = H.ehCoz(r[1]) === true;
      }
    }
    return { ayarlar, eserler };
  }

  function veriAl(yeni, kaynakAdi) {
    if (durum.eserler.length && !confirm(`Mevcut ${durum.eserler.length} satır, ${kaynakAdi} içeriğiyle değiştirilsin mi?`)) return;
    durum = yeni;
    ayarlariCiz(); tabloyuCiz(); degisti(0);
    bildir(`${yeni.eserler.length} satır yüklendi.`);
  }

  async function dosyaIsle(dosya) {
    if (!dosya) return;
    if (typeof XLSX === "undefined") { bildir("Excel kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin."); return; }
    try {
      veriAl(excelOku(new Uint8Array(await dosya.arrayBuffer())), dosya.name);
    } catch (err) {
      bildir(err.message || "Dosya okunamadı.");
    }
  }
  $("#dosya").addEventListener("change", (e) => { dosyaIsle(e.target.files[0]); e.target.value = ""; });

  // sürükle-bırak
  let surukSay = 0;
  document.addEventListener("dragenter", (e) => { e.preventDefault(); surukSay++; document.querySelector(".kaydir").classList.add("surukle"); });
  document.addEventListener("dragleave", () => { if (--surukSay <= 0) { surukSay = 0; document.querySelector(".kaydir").classList.remove("surukle"); } });
  document.addEventListener("dragover", (e) => e.preventDefault());
  document.addEventListener("drop", (e) => {
    e.preventDefault(); surukSay = 0;
    document.querySelector(".kaydir").classList.remove("surukle");
    dosyaIsle(e.dataTransfer.files[0]);
  });

  $("#ornek").addEventListener("click", async () => {
    try {
      const yanit = await fetch("sablon/ornek_eserler.xlsx");
      if (!yanit.ok) throw new Error();
      veriAl(excelOku(new Uint8Array(await yanit.arrayBuffer())), "örnek dosya");
    } catch (e) {
      bildir("Örnek dosya açılamadı. Sayfa bir web sunucusu üzerinden (ör. GitHub Pages) açılmalı.");
    }
  });

  // ---------- Excel yazma ----------
  $("#kaydet").addEventListener("click", () => {
    if (typeof XLSX === "undefined") { bildir("Excel kütüphanesi yüklenemedi."); return; }
    const eh = (x) => (x == null ? "" : x ? "E" : "H");
    const wb = XLSX.utils.book_new();
    const ekle = (ad, satirlar, genislik) => {
      const ws = XLSX.utils.aoa_to_sheet(satirlar);
      if (genislik) ws["!cols"] = genislik.map((w) => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, ad);
    };
    ekle("Eserler", [SUTUNLAR, ...durum.eserler.map((e) => [e.eserId, maddeMetni(e.madde), eh(e.doktoraSonrasi),
      e.yazarSayisi ?? "", e.adet ?? "", e.kaynak, eh(e.tezKaynakli), e.not])], [42, 58, 14, 12, 9, 34, 13, 30]);
    ekle("Ayarlar", [["Ayar", "Değer"], ["Bilim alanı", durum.ayarlar.alan],
      ["Yabancı uyruk / yurt dışı doçentlik denkliği", eh(durum.ayarlar.yabanci)],
      ["Doktora sonrası en az 2 yıl kadrolu öğretim elemanı", eh(durum.ayarlar.kadrolu)]], [46, 26]);
    const r = Math.round;
    const iki = (x) => r(x * 100) / 100;
    ekle("Özet", [["Toplam puan", iki(sonuc.toplam)], ["Doktora sonrası puan (3. madde hariç)", iki(sonuc.doksan)],
      ["Tüm koşullar sağlanıyor mu?", sonuc.gecti ? "Evet" : "Hayır"], ["Kural seti", K.surum],
      ["Oluşturma tarihi", new Date().toLocaleString("tr-TR")]], [40, 40]);
    ekle("Koşullar", [["Koşul", "Durum", "Değer", "Açıklama"],
      ...sonuc.kosullar.map((k) => [k.ad, k.gecti ? "Sağlanıyor" : "Sağlanmıyor", k.deger, k.aciklama || ""])], [60, 14, 18, 80]);
    ekle("Madde Dökümü", [["Madde", "Ham", "Tavan", "Sayılan", "Doktora sonrası", "Sayılmayan"],
      ...sonuc.bolumler.map((b) => [`${b.no}. ${b.ad}`, iki(b.ham), b.tavan ?? "", iki(b.sayilan), iki(b.ds), iki(b.kirpilan)])],
      [40, 10, 8, 10, 16, 12]);
    ekle("Eser Puanları", [["#", "Eser / Faaliyet", "Madde", "Puan", "Sayılan", "Notlar"],
      ...sonuc.satirlar.map((s) => [s.no ?? "", s.eser.eserId, s.kalem ? s.kalem.kod : s.eser.madde,
        iki(s.puan), iki(s.sayilan), s.notlar.join(" ")])], [5, 42, 14, 8, 8, 80]);
    XLSX.writeFile(wb, `docentlik_puan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  });

  // ---------- başlat ----------
  yukle();
  ayarlariCiz();
  tabloyuCiz();
  hesaplaVeGoster();
})();
