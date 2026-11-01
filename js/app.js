/* Arayüz: temel alan seçimi, tablo düzenleme, Excel okuma/yazma ve sonuçların gösterimi. */
(function () {
  const H = window.Hesap;
  const TABLOLAR = H.tablolar();
  const DEPO = "docentlik-puan-v1";
  const $ = (s) => document.querySelector(s);
  const esc = (x) => String(x ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = H.fmt;
  const ilkBuyuk = (s) => s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);
  const MADDESIZ = "Madde seçilmedi; bu satır madde seçilene kadar puana girmez.";
  // Madde seçilmemiş ama içinde bilgi olan satır (ör. ORCID'den aktarılan). Yeni eklenmiş boş satır sayılmaz.
  const maddesiz = (e) => !e.madde && !!(String(e.eserId || "").trim() || String(e.kaynak || "").trim());
  const YAZARLIK = [["baslica", "Başlıca yazar benim"], ["diger", "Başlıca yazar başkası"], ["belirtilmemis", "Başlıca yazar belirtilmemiş"]];
  const tabloAdi = (t) => `Tablo ${t.no} · ${t.ad}`;

  // ---------- durum ----------
  let durum = { ayarlar: { tablo: "11", alan: "Diğer", yabanci: false, kadrolu: false, once2016: false }, eserler: [] };
  let sonuc = null;
  let T = H.tabloBul("11");
  let kalemByKod = new Map();

  function yukle() {
    try {
      const v = JSON.parse(localStorage.getItem(DEPO) || "null");
      if (v && Array.isArray(v.eserler)) durum = { ayarlar: Object.assign(durum.ayarlar, v.ayarlar), eserler: v.eserler };
    } catch (e) { /* depo kullanılamıyor: boş başla */ }
    const m = location.hash.match(/^#tablo-(\d{1,2})$/);
    if (m && H.tablolar().some((t) => t.no === +m[1])) durum.ayarlar.tablo = m[1].padStart(2, "0");
  }
  let kayitZaman;
  function kaydet() {
    clearTimeout(kayitZaman);
    kayitZaman = setTimeout(() => {
      try { localStorage.setItem(DEPO, JSON.stringify(durum)); } catch (e) { /* yoksay */ }
    }, 250);
  }

  const bosEser = () => ({ eserId: "", madde: "", doktoraSonrasi: null, yazarSayisi: null, yazarlik: null, adet: null,
                           kaynak: "", kendisiSundu: null, tezKaynakli: null, not: "" });

  function bildir(mesaj) {
    const d = document.createElement("div");
    d.className = "bildirim"; d.setAttribute("role", "status"); d.textContent = mesaj;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3600);
  }

  // ---------- temel alan ----------
  const ekVar = (ad) => T.ekSutunlar.includes(ad);
  let maddeSecenekleri = "";

  function tabloyuUygula() {
    T = H.tabloBul(durum.ayarlar.tablo);
    durum.ayarlar.tablo = T.id;
    kalemByKod = new Map(T.kalemler.map((k) => [k.kod, k]));
    if (T.alanlar && !T.alanlar.secenekler.includes(durum.ayarlar.alan)) durum.ayarlar.alan = T.alanlar.varsayilan;

    let html = '<option value="">Seçin…</option>';
    for (const [no, b] of Object.entries(T.bolumler)) {
      html += `<optgroup label="${no}. ${esc(b.ad)}">` + T.kalemler.filter((k) => k.bolum === +no)
        .map((k) => `<option value="${esc(k.kod)}">${esc(k.kod)} · ${esc(k.ad)}</option>`).join("") + "</optgroup>";
    }
    maddeSecenekleri = html;

    $("#tablo").value = T.id;
    $("#tablo-beta").hidden = !T.beta;
    $("#beta-kutu").hidden = !T.beta;
    $("#altbaslik").textContent = `ÜAK ${tabloAdi(T)} temel alanı. Puanlar, madde tavanları ve zorunlu koşullar eser listenize göre anında hesaplanır.`;
    $("#sablon-link").href = `sablon/tablo-${T.id}_sablon.xlsx`;
    document.title = `Doçentlik Puan Hesaplama · ${T.ad}`;
    try { history.replaceState(null, "", `#tablo-${T.id}`); } catch (e) { /* yoksay */ }

    // ayarlar
    $("#ay-alan-kutu").hidden = !T.alanlar;
    if (T.alanlar) {
      $("#ay-alan").innerHTML = (T.alanlar.zorunlu ? '<option value="">Seçin…</option>' : "") + T.alanlar.secenekler
        .map((a) => `<option value="${esc(a)}">${esc((T.alanlar.etiketler || {})[a] || a)}</option>`).join("");
      $("#ay-alan").value = durum.ayarlar.alan || "";
      $("#ay-alan-kutu").title = T.alanlar.aciklama || "";
    }
    $("#ay-kadrolu-metin").textContent = `${ilkBuyuk(T.tarihAdi)} sonrası en az 2 yıl kadrolu öğretim elemanıyım`;
    $("#ay-once2016-metin").textContent = `${ilkBuyuk(T.tarihAdi)} unvanımı Aralık 2016’dan önce aldım`;
    $("#ay-kadrolu").checked = !!durum.ayarlar.kadrolu;
    $("#ay-yabanci").checked = !!durum.ayarlar.yabanci;
    $("#ay-once2016").checked = !!durum.ayarlar.once2016;

    basligiCiz();
    tabloyuCiz();
    kurallariCiz();
  }

  // ---------- eser tablosu ----------
  function sutunSayisi() { return 11 + (ekVar("yazarlik") ? 1 : 0) + (ekVar("kendisiSundu") ? 1 : 0); }

  function basligiCiz() {
    const ds = ilkBuyuk(T.tarihAdi);
    $("#baslik-satiri").innerHTML = `<tr>
      <th class="no">#</th>
      <th>Eser / faaliyet</th>
      <th>Madde</th>
      <th title="${ds} unvanından sonra mı? Atıflarda: atıf alan eser ${T.tarihAdi} sonrası mı?">${ds} sonrası</th>
      <th title="Yayın, bildiri ve patentlerde puan bu sayıya göre bölünür">Yazar / kişi</th>
      ${ekVar("yazarlik") ? `<th title="${esc("Başlıca yazar: " + (T.baslicaTanimi || ""))}">Başlıca yazar</th>` : ""}
      <th title="Atıf sayısı (5) ya da farklı yarıyıl/yıl sayısı (9)">Adet</th>
      <th title="2a'da dergi, 4b/4d'de kitap, 8'de toplantı adı">Dergi / kitap / toplantı</th>
      ${ekVar("kendisiSundu") ? '<th title="8. madde: bildiriyi kendiniz sunduysanız E">Kendim sundum</th>' : ""}
      <th>Tezden</th>
      <th class="puan">Puan</th>
      <th class="puan">Sayılan</th>
      <th><span class="gorunmez">Sil</span></th>
    </tr>`;
    $("#govde-bos td").colSpan = sutunSayisi();
  }

  const ehSecim = (deger, f) => `<select data-f="${f}" class="c-eh">
      <option value=""${deger == null ? " selected" : ""}>–</option>
      <option value="E"${deger === true ? " selected" : ""}>E</option>
      <option value="H"${deger === false ? " selected" : ""}>H</option></select>`;

  function satirHTML(e, i) {
    const rol = H.yazarlikCoz(e.yazarlik);
    return `<tbody data-i="${i}">
      <tr class="eser">
        <td class="no">${i + 1}</td>
        <td class="c-eser"><input data-f="eserId" value="${esc(e.eserId)}" title="${esc(e.eserId)}" aria-label="Eser ${i + 1} adı"></td>
        <td class="c-madde"><select data-f="madde" aria-label="Eser ${i + 1} maddesi">${maddeSecenekleri}</select></td>
        <td class="c-eh">${ehSecim(e.doktoraSonrasi, "doktoraSonrasi")}</td>
        <td class="c-sayi"><input type="number" min="1" step="1" inputmode="numeric" data-f="yazarSayisi" value="${esc(e.yazarSayisi)}" aria-label="Yazar veya kişi sayısı"></td>
        ${ekVar("yazarlik") ? `<td class="c-yazarlik"><select data-f="yazarlik" aria-label="Başlıca yazar">
            <option value="">–</option>${YAZARLIK.map(([v, a]) => `<option value="${v}"${rol === v ? " selected" : ""}>${a}</option>`).join("")}
          </select></td>` : ""}
        <td class="c-sayi"><input type="number" min="0" step="1" inputmode="numeric" data-f="adet" value="${esc(e.adet)}" aria-label="Adet"></td>
        <td class="c-kaynak"><input data-f="kaynak" value="${esc(e.kaynak)}" aria-label="Dergi, kitap veya toplantı adı"></td>
        ${ekVar("kendisiSundu") ? `<td class="c-eh">${ehSecim(e.kendisiSundu, "kendisiSundu")}</td>` : ""}
        <td class="c-eh">${ehSecim(e.tezKaynakli, "tezKaynakli")}</td>
        <td class="puan" data-o="puan"></td>
        <td class="puan sayilan" data-o="sayilan"></td>
        <td><button class="sil" type="button" aria-label="${i + 1}. satırı sil" title="Satırı sil">×</button></td>
      </tr>
      <tr class="notlar" hidden><td></td><td colspan="${sutunSayisi() - 1}" data-o="notlar"></td></tr>
    </tbody>`;
  }

  function maddeAyarla(tb, e) {
    const sel = tb.querySelector('select[data-f="madde"]');
    if (e.madde && !kalemByKod.has(e.madde)) {
      const o = document.createElement("option");
      o.value = e.madde; o.textContent = `Bu tabloda yok: ${e.madde}`;
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
    adet.placeholder = adet.disabled ? "" : k && k.tip === "ogretim" ? (k.birim === 4 ? "yarıyıl" : "yıl") : "atıf";
    const yz = tb.querySelector('[data-f="yazarlik"]');
    if (yz) yz.disabled = !!k && !(k.tip === "yayin" && T.baslicaBentleri.includes(k.bent));
    const ks = tb.querySelector('[data-f="kendisiSundu"]');
    if (ks) ks.disabled = !!k && k.bolum !== 8;
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
    sonuc = H.hesapla(durum, T);
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
      const eksikMadde = maddesiz(e);
      tb.querySelector('[data-o="puan"]').textContent = s.gecerli ? fmt(s.puan) : "–";
      tb.querySelector('[data-o="sayilan"]').textContent = s.gecerli ? fmt(s.sayilan) : "–";
      tr.classList.toggle("kirpildi", s.gecerli && s.puan - s.sayilan > 1e-9);
      tr.classList.toggle("hatali", (!bos && !s.gecerli) || eksikMadde);
      const notlar = eksikMadde ? [MADDESIZ]
        : bos ? [] : [...new Set([...(s.notlar || []), ...(satirUyari.get(i + 1) || [])])];
      tb.querySelector("tr.notlar").hidden = notlar.length === 0;
      tb.querySelector('[data-o="notlar"]').textContent = notlar.join(" ");
    });
  }

  function kararCiz() {
    const el = $("#karar");
    const eksik = sonuc.kosullar.filter((k) => !k.gecti).length;
    const maddesizSayi = durum.eserler.filter(maddesiz).length;
    const ek = maddesizSayi === 1 ? " 1 satırda madde seçilmediği için bu satır hesaba girmedi."
      : maddesizSayi > 1 ? ` ${maddesizSayi} satırda madde seçilmediği için bu satırlar hesaba girmedi.` : "";
    const ozet = `toplam ${fmt(sonuc.toplam)}, ${T.tarihAdi} sonrası ${fmt(sonuc.doksan)} puan.`;
    el.className = "karar";
    if (!durum.eserler.length) {
      el.textContent = "Eser ekledikçe puanınız ve eksik koşullarınız burada görünür.";
    } else if (sonuc.gecti) {
      el.classList.add("gecti");
      el.textContent = `Başvuru şartlarını sağlıyorsunuz: ${ozet}${ek}`;
    } else {
      el.classList.add("kaldi");
      el.textContent = `${eksik} koşul henüz sağlanmıyor. ${ilkBuyuk(ozet)}${ek}`;
    }
  }

  function cetvelCiz() {
    const maks = Math.max(150, Math.ceil((sonuc.toplam + 1) / 25) * 25);
    const yuzde = (x) => `${(100 * x) / maks}%`;
    const seritler = [
      { ad: "Toplam puan", deger: sonuc.toplam, hedef: T.esikToplam, alan: "sayilan" },
      { ad: `${ilkBuyuk(T.tarihAdi)} sonrası (3. madde hariç)`, deger: sonuc.doksan, hedef: T.esikDoktoraSonrasi, alan: "doksana" }
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
        <th class="n">${ilkBuyuk(T.tarihAdi)} sonrası</th><th class="n">Sayılmayan</th></tr></thead>
      <tbody>${sonuc.bolumler.map(satir).join("")}</tbody>
      <tfoot><tr><td>Toplam</td><td class="n">${t("ham")}</td><td></td><td class="n">${fmt(sonuc.toplam)}</td>
        <td class="n">${fmt(sonuc.doksan)}</td><td class="n">${t("kirpilan")}</td></tr></tfoot>`;
  }

  function uyarilariCiz() {
    const liste = [];
    for (const u of sonuc.uyarilar) {
      const e = u.satir == null ? null : durum.eserler[u.satir - 1];
      if (!e || e.madde) liste.push(u);
    }
    durum.eserler.forEach((e, i) => { if (maddesiz(e)) liste.push({ satir: i + 1, mesaj: MADDESIZ }); });
    liste.sort((a, b) => (a.satir ?? 1e9) - (b.satir ?? 1e9));
    $("#uyarilar-bolum").hidden = liste.length === 0;
    $("#uyarilar").innerHTML = liste.map((u) => `<li>${u.satir ? `<button type="button" data-git="${u.satir}">Satır ${u.satir}</button>: ` : ""}${esc(u.mesaj)}</li>`).join("");
  }

  // ---------- "Hesaplama nasıl yapılıyor?" — kural dosyasından üretilir ----------
  function kurallariCiz() {
    const du = T.tarihAdi;
    const li = (x) => `<li>${esc(x)}</li>`;
    const kurallar = [
      T.bolme === "baslica"
        ? "Makalelerde (1a–1d, 2a–2b, 3a–3d) puan başlıca yazara göre bölünür: tek yazarlıda tam puan; iki yazarlıda başlıca yazar 0,8, diğer yazar 0,5; üç ve daha fazla yazarlıda başlıca yazar puanın yarısını, diğer yazarlar kalan yarısını eşit paylaşır. Başlıca yazar belirtilmemişse puan eşit bölünür. Diğer yayınlarda (bildiri, kitap, editöre mektup vb.) ve patentlerde puan kişi sayısına eşit bölünür."
        : "Yayın, bildiri ve patentlerde puan yazar/kişi sayısına eşit bölünür.",
      "Atıf, proje, danışmanlık, ödül, editörlük ve diğer faaliyetler bölünmez (ÜAK SSS 26).",
      `Toplam puan, madde tavanları uygulandıktan sonra tüm eserlerin toplamıdır. ${ilkBuyuk(du)} öncesi puana ayrıca sınır konmaz (ÜAK SSS 28).`,
      `${ilkBuyuk(du)} sonrası puan, ${du} unvanından sonraki çalışmalardan alınan puandır; 3. madde (tezden üretilmiş yayın) bu toplama hiç girmez.`,
      `Bir madde tavanı aşıldığında önce ${du} sonrası puanlar sayılır. Bu, ${T.esikDoktoraSonrasi} puan şartı açısından adayın lehine olan yorumdur.`,
      "Aynı kitaptan yalnızca bir bölüm, aynı toplantıdan yalnızca bir çalışma puanlanır; en yüksek puanlı olan seçilir.",
      `9a’da 4 farklı yarıyıl, 9b’de 2 farklı yıl 2 puan eder. ${ilkBuyuk(du)} sonrası 2 yıl kadrolu görev 2 puan almış sayılır ama ders puanına eklenmez.`,
      `${ilkBuyuk(du)} unvanını Aralık 2016’dan önce alanlar için 3. maddedeki “en az bir yayın” şartı aranmaz (ÜAK SSS 59).`
    ];
    if (T.baslicaTanimi) kurallar.push(`Başlıca yazar: ${T.baslicaTanimi}`);

    let puanTablosu = '<table class="puan-tablosu"><thead><tr><th>Kod</th><th>Kalem</th><th class="n">Puan</th></tr></thead><tbody>';
    for (const [no, b] of Object.entries(T.bolumler)) {
      const alt = T.altTavanlar.filter((a) => +a.bentler[0].match(/^\d+/)[0] === +no)
        .map((a) => `${a.bentler.join(" + ")} en fazla ${a.tavan}`).join("; ");
      const tavan = b.tavan != null ? `en fazla ${b.tavan} puan` : "tavan yok";
      puanTablosu += `<tr class="bolum"><td colspan="2">${no}. ${esc(b.ad)}</td><td class="n">${tavan}${alt ? `; ${esc(alt)}` : ""}</td></tr>`;
      for (const k of T.kalemler.filter((k) => k.bolum === +no)) {
        const birim = k.tip === "adet" ? " / atıf" : k.tip === "ogretim" ? ` / ${k.birim} ${k.birim === 4 ? "yarıyıl" : "yıl"}` : "";
        puanTablosu += `<tr><td class="kod">${esc(k.kod)}</td><td>${esc(k.ad)}</td><td class="n">${fmt(k.puan)}${birim}</td></tr>`;
      }
    }
    puanTablosu += "</tbody></table>";

    const yorumlar = [
      "5. maddedeki asgari puan, doktora sonrası yayımlanmış eserlere yapılan atıflardan karşılanmalıdır; doktora öncesi eserlere yapılan atıflar da toplam puana sayılır (ÜAK SSS 28).",
      ...T.yorumlar,
      "Eserlerin başvurulan bilim alanıyla ilgili olması, kitap bölümlerinin alanla ilgisi, bilimsel toplantının düzenleme komitesi şartı ve kendinize yaptığınız atıfların ayıklanması hesaplanamaz; bunları sizin kontrol etmeniz gerekir."
    ];
    const sss = [
      "“Early access”, “online first”, “gelecek sayılar” gibi henüz bir sayıda yayımlanmamış makaleler sayılmaz; DOI almış olmak yeterli değildir (ÜAK SSS 16, 17).",
      "Yayın ücreti alan Q4 dergiler, belirli istisnalar dışında beyannamede kullanılamaz (ÜAK SSS 19).",
      "Derginin indeks durumu, makalenin yayımlandığı tarihteki duruma göre değerlendirilir (ÜAK SSS 22).",
      "Bir esere aynı yayında yapılan birden fazla atıf tek atıf sayılır (ÜAK SSS 25).",
      "Çeviriler kitap bölümü sayılmaz (ÜAK SSS 36).",
      ...T.notlar
    ];
    $("#kurallar-aciklama").innerHTML = `
      <details><summary>Puanlama kuralları</summary><ul>${kurallar.map(li).join("")}</ul></details>
      <details><summary>${esc(tabloAdi(T))}: puan tablosu</summary>
        <p class="alt">ÜAK’ın yayımladığı tabloyla karşılaştırabilmeniz için kural dosyasından otomatik üretilmiştir.</p>
        <div class="kaydir">${puanTablosu}</div></details>
      <details><summary>Yoruma açık noktalar</summary><ul>${yorumlar.map(li).join("")}</ul></details>
      <details><summary>ÜAK sıkça sorulan sorulardan notlar</summary><ul>${sss.map(li).join("")}</ul></details>`;
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
    if (["doktoraSonrasi", "tezKaynakli", "kendisiSundu"].includes(f)) return el.value === "" ? null : el.value === "E";
    if (f === "yazarSayisi" || f === "adet") return el.value === "" ? null : Number(el.value);
    if (f === "yazarlik") return el.value || null;
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
    durum.eserler.splice(+b.closest("tbody[data-i]").dataset.i, 1);
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

  // temel alan seçimi
  $("#tablo").innerHTML = TABLOLAR.map((t) => `<option value="${t.id}">${esc(tabloAdi(t))}${t.beta ? " (beta)" : ""}</option>`).join("");
  $("#tablo").addEventListener("change", (ev) => {
    durum.ayarlar.tablo = ev.target.value;
    tabloyuUygula();
    degisti(0);
    if (durum.eserler.length) bildir(`${tabloAdi(T)} kurallarına geçildi. Bu tabloda olmayan maddeler uyarı olarak gösterilir.`);
  });

  // ayarlar
  $("#ay-alan").addEventListener("change", (e) => { durum.ayarlar.alan = e.target.value; degisti(0); });
  $("#ay-kadrolu").addEventListener("change", (e) => { durum.ayarlar.kadrolu = e.target.checked; degisti(0); });
  $("#ay-yabanci").addEventListener("change", (e) => { durum.ayarlar.yabanci = e.target.checked; degisti(0); });
  $("#ay-once2016").addEventListener("change", (e) => { durum.ayarlar.once2016 = e.target.checked; degisti(0); });

  // ---------- Excel okuma ----------
  const anahtar = (x) => H.ascii(H.norm(x));
  function sutunHaritasi(baslik) {
    const h = {};
    baslik.forEach((b, j) => {
      const s = anahtar(b);
      if (!s) return;
      if (s.includes("madde")) h.madde ??= j;
      else if (s.includes("baslica")) h.yazarlik ??= j;
      else if (s.includes("sundum") || s.includes("kendi")) h.kendisiSundu ??= j;
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

  function tabloCoz(x) {
    const m = String(x ?? "").match(/(\d{1,2})/);
    if (m) { const t = TABLOLAR.find((t) => t.no === +m[1]); if (t) return t; }
    return TABLOLAR.find((t) => anahtar(x).includes(anahtar(t.ad))) || null;
  }

  function excelOku(veri) {
    const wb = XLSX.read(veri, { type: "array" });
    const sayfa = (a) => wb.SheetNames.find((n) => anahtar(n).includes(a));
    const ayarlar = Object.assign({}, durum.ayarlar, { yabanci: false, kadrolu: false, once2016: false });
    let tabloDosyada = null;
    const aAd = sayfa("ayar");
    if (aAd) {
      for (const r of XLSX.utils.sheet_to_json(wb.Sheets[aAd], { header: 1, defval: null })) {
        const a = anahtar(r[0]);
        if (a.includes("temel alan")) tabloDosyada = tabloCoz(r[1]);
        else if (a.includes("alan")) ayarlar.alan = String(r[1] ?? "").trim();
        else if (a.includes("yabanc")) ayarlar.yabanci = H.ehCoz(r[1]) === true;
        else if (a.includes("kadro")) ayarlar.kadrolu = H.ehCoz(r[1]) === true;
        else if (a.includes("2016")) ayarlar.once2016 = H.ehCoz(r[1]) === true;
      }
    }
    if (tabloDosyada) ayarlar.tablo = tabloDosyada.id;
    const hedef = H.tabloBul(ayarlar.tablo);
    if (hedef.alanlar) ayarlar.alan = hedef.alanlar.secenekler.find((x) => anahtar(x) === anahtar(ayarlar.alan)) ?? hedef.alanlar.varsayilan;

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
      const c = H.kodCoz(hamMadde, hedef);
      eserler.push({
        eserId: metin(al(r, "eserId")),
        madde: c.kalem ? c.kalem.kod : hamMadde,
        doktoraSonrasi: H.ehCoz(al(r, "doktoraSonrasi")),
        yazarSayisi: sayiVeyaBos(al(r, "yazarSayisi")),
        yazarlik: H.yazarlikCoz(al(r, "yazarlik")),
        adet: sayiVeyaBos(al(r, "adet")),
        kaynak: metin(al(r, "kaynak")),
        kendisiSundu: H.ehCoz(al(r, "kendisiSundu")),
        tezKaynakli: H.ehCoz(al(r, "tezKaynakli")),
        not: metin(al(r, "not"))
      });
    }
    return { ayarlar, eserler, tabloDegisti: !!tabloDosyada && tabloDosyada.id !== durum.ayarlar.tablo };
  }

  function veriAl(yeni, kaynakAdi) {
    if (durum.eserler.length && !confirm(`Mevcut ${durum.eserler.length} satır, ${kaynakAdi} içeriğiyle değiştirilsin mi?`)) return;
    durum = { ayarlar: yeni.ayarlar, eserler: yeni.eserler };
    tabloyuUygula(); degisti(0);
    bildir(`${yeni.eserler.length} satır yüklendi.` + (yeni.tabloDegisti ? ` Dosyadaki temel alana geçildi: ${tabloAdi(T)}.` : ""));
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
    const yazarlikMetni = (x) => (YAZARLIK.find(([v]) => v === H.yazarlikCoz(x)) || [, ""])[1];
    const maddeMetni = (kod) => (kalemByKod.has(kod) ? `${kod} · ${kalemByKod.get(kod).ad}` : kod);
    const du = ilkBuyuk(T.tarihAdi);
    const sutunlar = [
      ["Eser / Faaliyet", (e) => e.eserId, 42], ["Madde", (e) => maddeMetni(e.madde), 58],
      [`${du} Sonrası (E/H)`, (e) => eh(e.doktoraSonrasi), 16], ["Yazar / Kişi Sayısı", (e) => e.yazarSayisi ?? "", 12],
      ...(ekVar("yazarlik") ? [["Başlıca Yazar", (e) => yazarlikMetni(e.yazarlik), 26]] : []),
      ["Adet", (e) => e.adet ?? "", 9], ["Dergi / Kitap / Toplantı Adı", (e) => e.kaynak, 34],
      ...(ekVar("kendisiSundu") ? [["Kendim Sundum (E/H)", (e) => eh(e.kendisiSundu), 13]] : []),
      ["Tezden Üretildi (E/H)", (e) => eh(e.tezKaynakli), 13], ["Not", (e) => e.not, 30]
    ];
    const wb = XLSX.utils.book_new();
    const ekle = (ad, satirlar, genislik) => {
      const ws = XLSX.utils.aoa_to_sheet(satirlar);
      if (genislik) ws["!cols"] = genislik.map((w) => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, ad);
    };
    ekle("Eserler", [sutunlar.map((s) => s[0]), ...durum.eserler.map((e) => sutunlar.map((s) => s[1](e)))], sutunlar.map((s) => s[2]));
    ekle("Ayarlar", [["Ayar", "Değer"], ["Temel alan", tabloAdi(T)],
      ...(T.alanlar ? [["Bilim alanı", durum.ayarlar.alan || ""]] : []),
      ["Yabancı uyruk / yurt dışı doçentlik denkliği", eh(durum.ayarlar.yabanci)],
      [`${du} sonrası en az 2 yıl kadrolu öğretim elemanı`, eh(durum.ayarlar.kadrolu)],
      [`${du} unvanı Aralık 2016’dan önce alındı`, eh(durum.ayarlar.once2016)]], [50, 34]);
    const iki = (x) => Math.round(x * 100) / 100;
    ekle("Özet", [["Temel alan", tabloAdi(T) + (T.beta ? " (beta)" : "")], ["Toplam puan", iki(sonuc.toplam)],
      [`${du} sonrası puan (3. madde hariç)`, iki(sonuc.doksan)],
      ["Tüm koşullar sağlanıyor mu?", sonuc.gecti ? "Evet" : "Hayır"],
      ["Oluşturma tarihi", new Date().toLocaleString("tr-TR")]], [40, 40]);
    ekle("Koşullar", [["Koşul", "Durum", "Değer", "Açıklama"],
      ...sonuc.kosullar.map((k) => [k.ad, k.gecti ? "Sağlanıyor" : "Sağlanmıyor", k.deger, k.aciklama || ""])], [60, 14, 30, 80]);
    ekle("Madde Dökümü", [["Madde", "Ham", "Tavan", "Sayılan", `${du} sonrası`, "Sayılmayan"],
      ...sonuc.bolumler.map((b) => [`${b.no}. ${b.ad}`, iki(b.ham), b.tavan ?? "", iki(b.sayilan), iki(b.ds), iki(b.kirpilan)])],
      [40, 10, 8, 10, 18, 12]);
    ekle("Eser Puanları", [["#", "Eser / Faaliyet", "Madde", "Puan", "Sayılan", "Notlar"],
      ...sonuc.satirlar.map((s) => [s.no ?? "", s.eser.eserId, s.kalem ? s.kalem.kod : s.eser.madde,
        iki(s.puan), iki(s.sayilan), s.notlar.join(" ")])], [5, 42, 14, 8, 8, 80]);
    XLSX.writeFile(wb, `docentlik_puan_tablo${T.no}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  });

  window.addEventListener("hashchange", () => {
    const m = location.hash.match(/^#tablo-(\d{1,2})$/);
    if (!m) return;
    const t = TABLOLAR.find((t) => t.no === +m[1]);
    if (t && t.id !== T.id) { durum.ayarlar.tablo = t.id; tabloyuUygula(); degisti(0); }
  });

  // ---------- başlat ----------
  yukle();
  tabloyuUygula();
  hesaplaVeGoster();
})();
