/*
 * Doçentlik puan hesap motoru (arayüzden bağımsız).
 * Tarayıcıda window.Hesap, Node'da require("./hesap.js") olarak kullanılır.
 *
 * Girdi:
 *   {
 *     ayarlar: { alan: "Diğer", yabanci: false, kadrolu: false },
 *     eserler: [{ eserId, madde, doktoraSonrasi, yazarSayisi, adet, kaynak, tezKaynakli, not }]
 *   }
 *   doktoraSonrasi / tezKaynakli: true | false | null
 */
(function (root) {
  const KURALLAR_VARSAYILAN =
    typeof module !== "undefined" && module.exports ? require("./kurallar.js") : root.KURALLAR;

  const EPS = 1e-9;

  // ---------- yardımcılar ----------
  const trKucuk = (x) => String(x ?? "").toLocaleLowerCase("tr-TR");
  const norm = (x) => trKucuk(x).replace(/\s+/g, " ").trim();
  const ascii = (x) =>
    x.replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
     .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u");
  const toplamla = (dizi, f) => dizi.reduce((t, x) => t + f(x), 0);

  function sayi(x) {
    if (typeof x === "number") return x;
    if (x === null || x === undefined) return NaN;
    const s = String(x).trim().replace(",", ".");
    return s === "" ? NaN : Number(s);
  }

  function fmt(x) {
    const r = Math.round(x * 100) / 100;
    return r.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  }

  /** "E", "Evet", "1", "x", true → true · "H", "Hayır", "0", false → false · diğer → null */
  function ehCoz(x) {
    if (x === true || x === false) return x;
    if (typeof x === "number") return x === 1 ? true : x === 0 ? false : null;
    const s = ascii(norm(x));
    if (["e", "evet", "x", "1", "var", "true"].includes(s)) return true;
    if (["h", "hayir", "0", "yok", "false"].includes(s)) return false;
    return null;
  }

  /**
   * Madde hücresini kaleme çevirir. Kabul edilen yazımlar:
   * "1a-Q1 · SCIE/SSCI ...", "1a Q1", "1aq1", "6a eş danışman", "7a yürütücü", "3ı"
   */
  function kodCoz(metin, K = KURALLAR_VARSAYILAN) {
    const ham = String(metin ?? "").trim();
    if (!ham) return { kalem: null, hata: "Madde kodu boş." };
    const kodKismi = ham.split(/\s+[·—–|:]\s*|·/)[0];
    const sik = trKucuk(kodKismi).replace(/[\s\-_.()/]/g, "");
    const m = sik.match(/^(\d{1,2})([a-zçğıöşü])(.*)$/);
    if (!m) return { kalem: null, hata: `"${ham}" madde kodu olarak okunamadı.` };
    const bent = m[1] + m[2];
    const ek = ascii(m[3]);
    const adaylar = K.kalemler.filter((k) => k.bent === bent);
    if (!adaylar.length) return { kalem: null, hata: `"${ham}": ${bent} diye bir bent yok.` };
    if (adaylar.length === 1) return { kalem: adaylar[0] };

    let kod = null;
    if (bent === "1a") {
      const q = ek.match(/q([1-4])/);
      if (q) kod = "1a-Q" + q[1];
      else return { kalem: null, hata: `"${ham}": 1a için çeyreklik (Q1–Q4) belirtilmeli.` };
    } else if (bent === "6a" || bent === "6b") {
      if (ek.includes("asil")) kod = bent + "-Asıl";
      else if (ek.includes("es") || ek.includes("ikinci")) kod = bent + "-Eş";
      else return { kalem: null, hata: `"${ham}": ${bent} için asıl veya eş danışman belirtilmeli.` };
    } else if (bent === "7a") {
      if (ek.includes("yurut") || ek.includes("koord")) kod = "7a-Yürütücü";
      else if (ek.includes("arast")) kod = "7a-Araştırmacı";
      else if (ek.includes("danis")) kod = "7a-Danışman";
      else return { kalem: null, hata: `"${ham}": 7a için görev (yürütücü/araştırmacı/danışman) belirtilmeli.` };
    }
    const kalem = adaylar.find((k) => k.kod === kod);
    return kalem ? { kalem } : { kalem: null, hata: `"${ham}" çözümlenemedi.` };
  }

  // ---------- ana hesap ----------
  function hesapla(girdi, K = KURALLAR_VARSAYILAN) {
    const ay = Object.assign({ alan: "Diğer", yabanci: false, kadrolu: false }, (girdi && girdi.ayarlar) || {});
    const uyarilar = [];
    const uyar = (no, mesaj) => uyarilar.push({ satir: no, mesaj });
    const satirlar = [];

    // 1) Satır puanları
    ((girdi && girdi.eserler) || []).forEach((e, i) => {
      const s = { no: i + 1, eser: e, kalem: null, bent: null, bolum: null, ds: false,
                  puan: 0, sayilan: 0, bolen: null, elendi: false, gecerli: false, notlar: [] };
      satirlar.push(s);

      const c = kodCoz(e.madde, K);
      if (!c.kalem) { s.notlar.push(c.hata); uyar(s.no, c.hata); return; }
      const k = c.kalem;
      Object.assign(s, { kalem: k, bent: k.bent, bolum: k.bolum, gecerli: true });

      if (e.doktoraSonrasi === true || e.doktoraSonrasi === false) s.ds = e.doktoraSonrasi;
      else uyar(s.no, "Doktora sonrası (E/H) girilmemiş; doktora öncesi kabul edildi.");

      const adet = sayi(e.adet);
      if (k.tip === "yayin") {
        let n = sayi(e.yazarSayisi);
        if (!(n >= 1)) { n = 1; uyar(s.no, "Yazar/kişi sayısı girilmemiş; 1 kabul edildi."); }
        s.bolen = n;
        s.puan = k.puan / n;
      } else if (k.tip === "adet") {
        let a = adet;
        if (!(a >= 0)) { a = 1; uyar(s.no, "Atıf adedi girilmemiş; 1 kabul edildi."); }
        s.puan = k.puan * a;
      } else if (k.tip === "sabit") {
        s.puan = k.puan;
      }
      if ((k.tip === "yayin" || k.tip === "sabit") && adet > 1) {
        uyar(s.no, "Adet sütunu yalnızca atıf (5) ve eğitim-öğretim (9) satırlarında kullanılır; bu satırda dikkate alınmadı. Her eseri ayrı satıra girin.");
      }

      if (e.tezKaynakli === true && [1, 2, 4, 8].includes(s.bolum)) {
        uyar(s.no, "Tezden üretildi olarak işaretli. Tezden üretilen yayınlar yalnızca 3. maddede puanlanabilir.");
      }
      if (e.tezKaynakli === false && s.bolum === 3) {
        uyar(s.no, "3. madde tezden üretilen yayınlar içindir, ama satır tezden üretilmedi olarak işaretli.");
      }
    });

    // 2) Bölüm 9: yarıyıl/yıl sayıları toplanır, birim başına puan verilir
    let puan9 = 0;
    for (const bent of ["9a", "9b"]) {
      const rs = satirlar.filter((s) => s.gecerli && s.bent === bent);
      if (!rs.length) continue;
      const k = rs[0].kalem;
      let toplamAdet = 0;
      for (const s of rs) {
        let a = sayi(s.eser.adet);
        if (!(a >= 0)) { a = 1; uyar(s.no, "Adet girilmemiş; 1 kabul edildi."); }
        if (!s.ds) { s.adet9 = 0; s.notlar.push("Ders verme doktora sonrası olmalı; sayılmadı."); continue; }
        s.adet9 = a;
        toplamAdet += a;
      }
      const p = Math.floor(toplamAdet / k.birim + EPS) * k.puan;
      for (const s of rs) s.puan = toplamAdet ? (p * s.adet9) / toplamAdet : 0;
      const artan = toplamAdet % k.birim;
      if (artan && rs.length) {
        const birimAd = bent === "9a" ? "yarıyıl" : "yıl";
        rs[rs.length - 1].notlar.push(`${bent}: ${artan} ${birimAd} puana dönüşmedi (${k.birim} ${birimAd} = ${k.puan} puan).`);
      }
      puan9 += p;
    }
    if (ay.kadrolu && puan9 < 2) {
      satirlar.push({
        no: null, sanal: true, gecerli: true, elendi: false, ds: true, bolum: 9, bent: "9",
        kalem: { kod: "9", bent: "9", ad: "Doktora sonrası en az 2 yıl kadrolu görev: 2 puan almış sayılır" },
        eser: { eserId: "Ayarlar: en az 2 yıl kadrolu öğretim elemanı" },
        puan: 2 - puan9, sayilan: 0, notlar: []
      });
      puan9 = 2;
    }

    // 3) Tekilleştirme
    function tekillestir(filtre, mesaj, eksikMesaj) {
      const gruplar = new Map();
      for (const s of satirlar.filter(filtre)) {
        const key = norm(s.eser.kaynak);
        if (!key) { uyar(s.no, eksikMesaj); continue; }
        if (!gruplar.has(key)) gruplar.set(key, []);
        gruplar.get(key).push(s);
      }
      for (const rs of gruplar.values()) {
        if (rs.length < 2) continue;
        rs.sort((a, b) => b.puan - a.puan || b.ds - a.ds);
        for (const s of rs.slice(1)) {
          s.elendi = true;
          s.notlar.push(`${mesaj} (${rs[0].no}. satır puanlandı).`);
        }
      }
    }
    tekillestir((s) => s.gecerli && (s.bent === "4b" || s.bent === "4d"),
      "Aynı kitaptan yalnızca bir bölüm puanlanır",
      "Kitap adı girilmemiş; aynı kitaptan tek bölüm kuralı kontrol edilemedi.");
    tekillestir((s) => s.gecerli && s.bolum === 8,
      "Aynı toplantıdan yalnızca bir çalışma puanlanır",
      "Toplantı adı girilmemiş; aynı toplantıdan tek çalışma kuralı kontrol edilemedi.");

    // 4) Tavanlar — tavan aşılırsa önce doktora sonrası puanlar sayılır (90 şartı için adayın lehine)
    for (const s of satirlar) s.sayilan = s.gecerli && !s.elendi ? s.puan : 0;
    function kirp(rs, tavan, mesaj) {
      const sirali = rs.slice().sort((a, b) => b.ds - a.ds || b.sayilan - a.sayilan);
      let kalan = tavan;
      for (const s of sirali) {
        const once = s.sayilan;
        s.sayilan = Math.min(once, Math.max(0, kalan));
        kalan -= s.sayilan;
        if (once - s.sayilan > EPS) s.notlar.push(`${mesaj}: ${fmt(once - s.sayilan)} puan sayılmadı.`);
      }
    }
    for (const at of K.altTavanlar) {
      kirp(satirlar.filter((s) => s.sayilan > 0 && at.bentler.includes(s.bent)), at.tavan,
        `${at.ad} için en fazla ${at.tavan} puan`);
    }
    for (const [no, b] of Object.entries(K.bolumler)) {
      if (b.tavan == null) continue;
      kirp(satirlar.filter((s) => s.sayilan > 0 && s.bolum === +no), b.tavan,
        `${no}. madde tavanı ${b.tavan} puan`);
    }

    // 5) Bölüm özetleri ve toplamlar
    const bolumler = Object.entries(K.bolumler).map(([no, b]) => {
      const rs = satirlar.filter((s) => s.gecerli && s.bolum === +no);
      const ham = toplamla(rs, (s) => s.puan);
      const sayilan = toplamla(rs, (s) => s.sayilan);
      const ds = toplamla(rs.filter((s) => s.ds), (s) => s.sayilan);
      return { no: +no, ad: b.ad, tavan: b.tavan, satirSayisi: rs.length, ham, sayilan,
               ds, do: sayilan - ds, kirpilan: ham - sayilan, doksana: b.doksanaSayilmaz ? 0 : ds };
    });
    const toplam = toplamla(bolumler, (b) => b.sayilan);
    const doksan = toplamla(bolumler, (b) => b.doksana);

    // 6) Zorunlu koşullar
    const dsGecerli = (s) => s.gecerli && s.ds && !s.elendi && !s.sanal;
    const bentte = (s, liste) => liste.includes(s.bent);
    const kosullar = [];
    const kosul = (o) => kosullar.push(o);

    kosul({ kod: "toplam", ad: "Toplam en az 100 puan", gecti: toplam >= K.esikToplam - EPS,
            deger: `${fmt(toplam)} / ${K.esikToplam}` });
    kosul({ kod: "doksan", ad: "Doktora sonrası çalışmalardan en az 90 puan (3. madde hariç)",
            gecti: doksan >= K.esikDoktoraSonrasi - EPS, deger: `${fmt(doksan)} / ${K.esikDoktoraSonrasi}` });

    const p1 = toplamla(satirlar.filter((s) => dsGecerli(s) && bentte(s, ["1a", "1b", "1c", "1d"])), (s) => s.puan);
    kosul({ kod: "m1", ad: "1. madde: doktora sonrası a–d bentlerinden en az 10 puan",
            gecti: p1 >= 10 - EPS, deger: `${fmt(p1)} / 10` });

    // 2. madde
    function dergiKontrol(rs) {
      const dergi = (s) => norm(s.eser.kaynak) || `__satir${s.no}`;
      const tum = new Set(rs.map(dergi));
      const tek = new Set(rs.filter((s) => s.bolen === 1).map(dergi));
      return { yayin: rs.length, dergi: tum.size, tekDergi: tek.size, gecti: tek.size >= 3 && tum.size >= 5 };
    }
    const tr = satirlar.filter((s) => dsGecerli(s) && s.bent === "2a");
    tr.filter((s) => !norm(s.eser.kaynak)).forEach((s) =>
      uyar(s.no, "Dergi adı girilmemiş; 2. maddedeki farklı dergi şartında ayrı dergi kabul edildi."));
    const d2 = dergiKontrol(tr);
    const altA = satirlar.filter((s) => dsGecerli(s) && bentte(s, ["1a", "1b"]));
    const altATek = altA.filter((s) => s.bolen === 1).length;
    const altAGecti = altA.length >= 3 && altATek >= 1;
    let yab = null;
    if (ay.yabanci) yab = dergiKontrol(satirlar.filter((s) => dsGecerli(s) && bentte(s, ["2a", "1a", "1b", "1c"])));
    let yol = null;
    if (d2.gecti) yol = "TR Dizin şartı sağlanıyor.";
    else if (altAGecti) yol = "TR Dizin şartı yerine 1a/1b alternatifi sağlanıyor.";
    else if (yab && yab.gecti) yol = "Yabancı uyruk/denklik alternatifi (1a/1b/1c ile tamamlama) sağlanıyor.";
    const ayrinti2 = [
      `TR Dizin (2a): ${d2.yayin} yayın, ${d2.dergi}/5 farklı dergi, tek yazarlı ${d2.tekDergi}/3 farklı dergide`,
      `Alternatif (1a/1b): ${altA.length}/3 yayın, ${Math.min(altATek, 1)}/1 tek yazarlı`
    ];
    if (yab) ayrinti2.push(`Yabancı uyruk (2a+1a/1b/1c): ${yab.dergi}/5 farklı dergi, tek yazarlı ${yab.tekDergi}/3`);
    kosul({ kod: "m2", ad: "2. madde: ulusal makale şartı (veya alternatifi)", gecti: !!yol,
            deger: d2.gecti ? "TR Dizin" : altAGecti ? "1a/1b" : yab && yab.gecti ? "Yabancı uyruk" : "Sağlanmıyor",
            aciklama: d2.gecti ? ayrinti2[0] : (yol ? yol + " " : "") + ayrinti2.join(" · ") });

    const n3 = satirlar.filter((s) => s.gecerli && bentte(s, ["3a", "3b", "3c", "3d", "3e", "3f", "3g", "3h"])).length;
    kosul({ kod: "m3", ad: "3. madde: a–h bentlerinden en az bir yayın", gecti: n3 >= 1, deger: `${n3} yayın` });

    const kitap = satirlar.filter((s) => dsGecerli(s) && bentte(s, ["4a", "4c"])).length;
    const bolum = satirlar.filter((s) => dsGecerli(s) && bentte(s, ["4b", "4d"])).length;
    kosul({ kod: "m4", ad: "4. madde: doktora sonrası en az bir kitap veya iki kitap bölümü",
            gecti: kitap >= 1 || bolum >= 2, deger: `${kitap} kitap, ${bolum} bölüm`,
            aciklama: "Aynı kitaptaki bölümler tek bölüm sayılır." });

    const p5 = toplamla(satirlar.filter((s) => dsGecerli(s) && s.bolum === 5), (s) => s.puan);
    kosul({ kod: "m5", ad: "5. madde: doktora sonrası yayınlara yapılan atıflardan en az 5 puan",
            gecti: p5 >= 5 - EPS, deger: `${fmt(p5)} / 5` });

    const p8 = toplamla(satirlar.filter((s) => dsGecerli(s) && s.bolum === 8), (s) => s.puan);
    kosul({ kod: "m8", ad: "8. madde: doktora sonrası bilimsel toplantılardan en az 5 puan",
            gecti: p8 >= 5 - EPS, deger: `${fmt(p8)} / 5` });

    kosul({ kod: "m9", ad: "9. madde: eğitim-öğretimden en az 2 puan", gecti: puan9 >= 2 - EPS,
            deger: `${fmt(puan9)} / 2` });

    if (K.iletisimAlanlari.includes(ay.alan)) {
      const p13 = toplamla(satirlar.filter((s) => s.gecerli && bentte(s, ["13c", "13d", "13e"])), (s) => s.puan);
      kosul({ kod: "m13", ad: `13. madde: ${ay.alan} alanı için c, d, e bentlerinden en az 10 puan`,
              gecti: p13 >= 10 - EPS, deger: `${fmt(p13)} / 10` });
    }

    // 7) Aynı eserin birden fazla satırda kullanılması
    const yayinBolumleri = [1, 2, 3, 4, 8, 10];
    const idGrup = new Map();
    for (const s of satirlar.filter((s) => s.gecerli && yayinBolumleri.includes(s.bolum))) {
      const id = norm(s.eser.eserId);
      if (!id) continue;
      if (!idGrup.has(id)) idGrup.set(id, []);
      idGrup.get(id).push(s);
    }
    for (const rs of idGrup.values()) {
      if (rs.length < 2) continue;
      const nolar = rs.map((s) => s.no).join(", ");
      uyar(rs[0].no, `Aynı eser adı ${nolar}. satırlarda tekrar ediyor. Her çalışma tabloda yalnızca bir bölümde puanlanır.`);
    }

    uyarilar.sort((a, b) => (a.satir ?? 1e9) - (b.satir ?? 1e9));
    const gecti = kosullar.every((k) => k.gecti);
    return { satirlar, bolumler, toplam, doksan, kosullar, uyarilar, gecti, ayarlar: ay };
  }

  const Hesap = { hesapla, kodCoz, ehCoz, sayi, fmt, norm, ascii };
  if (typeof module !== "undefined" && module.exports) module.exports = Hesap;
  else root.Hesap = Hesap;
})(typeof window !== "undefined" ? window : globalThis);
