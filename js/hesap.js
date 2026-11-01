/*
 * Doçentlik puan hesap motoru (arayüzden ve temel alandan bağımsız).
 * Kurallar js/kurallar/ altındaki tablo dosyalarından okunur.
 * Tarayıcıda window.Hesap, Node'da require("./hesap.js").
 *
 * Girdi:
 *   {
 *     ayarlar: { tablo: "11", alan, yabanci, kadrolu, once2016 },
 *     eserler: [{ eserId, madde, doktoraSonrasi, yazarSayisi, yazarlik, adet, kaynak,
 *                 tezKaynakli, kendisiSundu, not }]
 *   }
 */
(function (root) {
  const NODE = typeof module !== "undefined" && module.exports;
  if (NODE) require("./kurallar/hepsi.js");
  const Ortak = NODE ? require("./kurallar/ortak.js") : root.DocentlikOrtak;
  const VARSAYILAN_TABLO = "11";
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

  /** Başlıca yazar bilgisi: "baslica" | "diger" | "belirtilmemis" | null */
  function yazarlikCoz(x) {
    if (x === "baslica" || x === "diger" || x === "belirtilmemis") return x;
    const s = ascii(norm(x));
    if (!s) return null;
    if (s.includes("belirt") || s === "yok") return "belirtilmemis";
    if (s.includes("baska") || s.includes("diger") || s === "h" || s === "hayir") return "diger";
    if (s.includes("benim") || s === "e" || s === "evet" || s.startsWith("baslica")) return "baslica";
    return null;
  }

  /** Tablo nesnesi ya da numarası → tablo */
  function tabloBul(t) {
    if (t && typeof t === "object" && t.kalemler) return t;
    const id = String(t ?? VARSAYILAN_TABLO).padStart(2, "0");
    return Ortak.tablolar[id] || Ortak.tablolar[VARSAYILAN_TABLO];
  }

  /**
   * Madde hücresini seçili tablonun kalemine çevirir. Kabul edilen yazımlar:
   * "1a-Q1 · SCIE/SSCI ...", "1a Q1", "1aq1", "6a eş danışman", "7a yürütücü", "3ı"
   */
  function kodCoz(metin, tablo) {
    const T = tabloBul(tablo);
    const ham = String(metin ?? "").trim();
    if (!ham) return { kalem: null, hata: "Madde kodu boş." };
    const kodKismi = ham.split(/\s+[·—–|:]\s*|·/)[0];
    const sik = trKucuk(kodKismi).replace(/[\s\-_.()/]/g, "");
    const m = sik.match(/^(\d{1,2})([a-zçğıöşü])(.*)$/);
    if (!m) return { kalem: null, hata: `"${ham}" madde kodu olarak okunamadı.` };
    const bent = m[1] + m[2];
    const ek = ascii(m[3]);
    const adaylar = T.kalemler.filter((k) => k.bent === bent);
    if (!adaylar.length) {
      const herhangi = Ortak.sirali().some((t) => t.kalemler.some((k) => k.bent === bent));
      return { kalem: null, hata: herhangi
        ? `"${ham}": ${bent} bendi Tablo ${T.no} (${T.ad}) kurallarında yok.`
        : `"${ham}": ${bent} diye bir bent yok.` };
    }
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

  /** Başlıca yazar kuralına göre adayın payı */
  function baslicaPayi(n, rol) {
    if (n <= 1) return 1;
    if (rol === "baslica") return n === 2 ? 0.8 : 0.5;
    if (rol === "diger") return n === 2 ? 0.5 : 0.5 / (n - 1);
    return 1 / n; // başlıca yazar belirtilmemiş: eşit bölünür
  }

  // ---------- ana hesap ----------
  function hesapla(girdi, tablo) {
    const ay = Object.assign({ alan: "", yabanci: false, kadrolu: false, once2016: false },
      (girdi && girdi.ayarlar) || {});
    const T = tabloBul(tablo ?? ay.tablo);
    if (T.alanlar && !T.alanlar.secenekler.includes(ay.alan)) ay.alan = T.alanlar.varsayilan;
    ay.tablo = T.id;

    const uyarilar = [];
    const uyarildi = new Set();
    const uyar = (no, mesaj) => {
      const a = `${no}|${mesaj}`;
      if (uyarildi.has(a)) return;
      uyarildi.add(a);
      uyarilar.push({ satir: no, mesaj });
    };
    const satirlar = [];

    // 1) Satır puanları
    ((girdi && girdi.eserler) || []).forEach((e, i) => {
      const s = { no: i + 1, eser: e, kalem: null, bent: null, bolum: null, ds: false, puan: 0, sayilan: 0,
                  yazar: null, bolen: null, baslica: false, elendi: false, gecerli: false, notlar: [] };
      satirlar.push(s);

      const c = kodCoz(e.madde, T);
      if (!c.kalem) { s.notlar.push(c.hata); uyar(s.no, c.hata); return; }
      const k = c.kalem;
      Object.assign(s, { kalem: k, bent: k.bent, bolum: k.bolum, gecerli: true });

      if (e.doktoraSonrasi === true || e.doktoraSonrasi === false) s.ds = e.doktoraSonrasi;
      else uyar(s.no, `${ilkBuyuk(T.tarihAdi)} sonrası (E/H) girilmemiş; ${T.tarihAdi} öncesi kabul edildi.`);

      const adet = sayi(e.adet);
      if (k.tip === "yayin") {
        let n = sayi(e.yazarSayisi);
        if (!(n >= 1)) { n = 1; uyar(s.no, "Yazar/kişi sayısı girilmemiş; 1 kabul edildi."); }
        const rol = yazarlikCoz(e.yazarlik);
        s.yazar = n;
        s.bolen = n;
        s.baslica = n === 1 || rol === "baslica";
        if (T.bolme === "baslica" && T.baslicaBentleri.includes(k.bent)) {
          if (n > 1 && rol == null) uyar(s.no, "Başlıca yazar bilgisi girilmemiş; puan yazarlar arasında eşit bölündü.");
          s.puan = k.puan * baslicaPayi(n, rol);
        } else {
          s.puan = k.puan / n;
        }
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

    // 2) 9. madde: yarıyıl/yıl sayıları toplanır, birim başına puan verilir
    let puan9 = 0;
    for (const k of T.kalemler.filter((k) => k.tip === "ogretim")) {
      const rs = satirlar.filter((s) => s.gecerli && s.kalem === k);
      if (!rs.length) continue;
      let toplamAdet = 0;
      for (const s of rs) {
        let a = sayi(s.eser.adet);
        if (!(a >= 0)) { a = 1; uyar(s.no, "Adet girilmemiş; 1 kabul edildi."); }
        if (!s.ds) { s.adet9 = 0; s.notlar.push(`Ders verme ${T.tarihAdi} sonrası olmalı; sayılmadı.`); continue; }
        s.adet9 = a;
        toplamAdet += a;
      }
      const p = Math.floor(toplamAdet / k.birim + EPS) * k.puan;
      for (const s of rs) s.puan = toplamAdet ? (p * s.adet9) / toplamAdet : 0;
      const artan = toplamAdet % k.birim;
      if (artan) {
        const birimAd = k.birim === 4 ? "yarıyıl" : "yıl";
        rs[rs.length - 1].notlar.push(`${k.bent}: ${artan} ${birimAd} puana dönüşmedi (${k.birim} ${birimAd} = ${k.puan} puan).`);
      }
      puan9 += p;
    }
    if (ay.kadrolu && puan9 < 2) {
      satirlar.push({
        no: null, sanal: true, gecerli: true, elendi: false, ds: true, bolum: 9, bent: "9",
        kalem: { kod: "9", bent: "9", ad: `${ilkBuyuk(T.tarihAdi)} sonrası en az 2 yıl kadrolu görev: 2 puan almış sayılır` },
        eser: { eserId: "Ayarlar: en az 2 yıl kadrolu öğretim elemanı" },
        puan: 2 - puan9, sayilan: 0, notlar: []
      });
      puan9 = 2;
    }

    // 3) Tekilleştirme (aynı kitap/toplantı)
    for (const kural of T.tekillestirme) {
      const gruplar = new Map();
      const uyan = satirlar.filter((s) => s.gecerli && !s.sanal &&
        (kural.bentler ? kural.bentler.includes(s.bent) : s.bolum === kural.bolum));
      for (const s of uyan) {
        const key = norm(s.eser.kaynak);
        if (!key) { uyar(s.no, kural.eksikMesaj); continue; }
        if (!gruplar.has(key)) gruplar.set(key, []);
        gruplar.get(key).push(s);
      }
      for (const rs of gruplar.values()) {
        if (rs.length < 2) continue;
        rs.sort((a, b) => b.puan - a.puan || b.ds - a.ds);
        for (const s of rs.slice(1)) {
          s.elendi = true;
          s.notlar.push(`${kural.mesaj} (${rs[0].no}. satır puanlandı).`);
        }
      }
    }

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
    for (const at of T.altTavanlar) {
      kirp(satirlar.filter((s) => s.sayilan > 0 && at.bentler.includes(s.bent)), at.tavan,
        `${at.ad} için en fazla ${at.tavan} puan`);
    }
    for (const [no, b] of Object.entries(T.bolumler)) {
      if (b.tavan == null) continue;
      kirp(satirlar.filter((s) => s.sayilan > 0 && s.bolum === +no), b.tavan, `${no}. madde tavanı ${b.tavan} puan`);
    }

    // 5) Bölüm özetleri ve toplamlar
    const bolumler = Object.entries(T.bolumler).map(([no, b]) => {
      const rs = satirlar.filter((s) => s.gecerli && s.bolum === +no);
      const ham = toplamla(rs, (s) => s.puan);
      const sayilan = toplamla(rs, (s) => s.sayilan);
      const ds = toplamla(rs.filter((s) => s.ds), (s) => s.sayilan);
      return { no: +no, ad: b.ad, tavan: b.tavan, satirSayisi: rs.length, ham, sayilan,
               ds, do: sayilan - ds, kirpilan: ham - sayilan, doksana: b.doksanaSayilmaz ? 0 : ds };
    }).sort((a, b) => a.no - b.no);
    const toplam = toplamla(bolumler, (b) => b.sayilan);
    const doksan = toplamla(bolumler, (b) => b.doksana);

    // 6) Zorunlu koşullar
    const kosullar = [
      { kod: "toplam", ad: `Toplam en az ${T.esikToplam} puan`, gecti: toplam >= T.esikToplam - EPS,
        deger: `${fmt(toplam)} / ${T.esikToplam}` },
      { kod: "doksan", ad: `${ilkBuyuk(T.tarihAdi)} sonrası çalışmalardan en az ${T.esikDoktoraSonrasi} puan (3. madde hariç)`,
        gecti: doksan >= T.esikDoktoraSonrasi - EPS, deger: `${fmt(doksan)} / ${T.esikDoktoraSonrasi}` }
    ];
    const ortam = { satirlar, ay, T, puan9, uyar };
    for (const kd of T.kosullar) {
      const ad = typeof kd.ad === "function" ? kd.ad(ay) : kd.ad;
      const muaf = kd.muaf ? kd.muaf(ay) : null;
      if (muaf) { kosullar.push({ kod: kd.kod, ad, gecti: true, deger: "Aranmaz", aciklama: muaf }); continue; }
      const kural = typeof kd.kural === "function" ? kd.kural(ay) : kd.kural;
      if (!kural) continue;
      const r = degerlendir(kural, ortam);
      const aciklama = [r.aciklama, kd.aciklama].filter(Boolean).join(" ");
      kosullar.push({ kod: kd.kod, ad, gecti: r.gecti, deger: r.deger, aciklama: aciklama || undefined });
    }

    // 7) Aynı eserin birden fazla satırda kullanılması
    const idGrup = new Map();
    for (const s of satirlar.filter((s) => s.gecerli && !s.sanal && [1, 2, 3, 4, 8, 10].includes(s.bolum))) {
      const id = norm(s.eser.eserId);
      if (!id) continue;
      if (!idGrup.has(id)) idGrup.set(id, []);
      idGrup.get(id).push(s);
    }
    for (const rs of idGrup.values()) {
      if (rs.length < 2) continue;
      uyar(rs[0].no, `Aynı eser adı ${rs.map((s) => s.no).join(", ")}. satırlarda tekrar ediyor. Her çalışma tabloda yalnızca bir bölümde puanlanır.`);
    }

    uyarilar.sort((a, b) => (a.satir ?? 1e9) - (b.satir ?? 1e9));
    const gecti = kosullar.every((k) => k.gecti);
    return { tablo: T, satirlar, bolumler, toplam, doksan, kosullar, uyarilar, gecti, ayarlar: ay };
  }

  const ilkBuyuk = (s) => s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);

  // ---------- zorunlu koşul değerlendirici ----------
  function suz(ortam, suzgec) {
    return ortam.satirlar.filter((s) => s.gecerli && !s.elendi && !s.sanal && uyarMi(s, suzgec) &&
      (!suzgec.ds || s.ds));
  }
  function uyarMi(s, z) {
    if (z.kodlar) return z.kodlar.includes(s.kalem.kod);
    if (z.bentler) return z.bentler.includes(s.bent);
    if (z.bolum) return s.bolum === z.bolum;
    return true;
  }

  function degerlendir(ifade, ortam) {
    switch (ifade.tip) {
      case "puan": {
        const p = toplamla(suz(ortam, ifade.suzgec), (s) => s.puan);
        return { gecti: p >= ifade.enAz - EPS, deger: `${fmt(p)} / ${ifade.enAz} puan` };
      }
      case "sayi": {
        const rs = suz(ortam, ifade.suzgec);
        const parcalar = [`${rs.length}/${ifade.enAz} yayın`];
        let gecti = rs.length >= ifade.enAz;
        const kontrol = (n, enAz, ad) => {
          if (enAz == null) return;
          parcalar.push(`${ad} ${Math.min(n, enAz)}/${enAz}`);
          if (n < enAz) gecti = false;
        };
        kontrol(rs.filter((s) => s.yazar === 1).length, ifade.tekEnAz, "tek yazarlı");
        kontrol(rs.filter((s) => s.baslica).length, ifade.baslicaEnAz, "başlıca yazar");
        kontrol(rs.filter((s) => s.eser.kendisiSundu === true).length, ifade.kendisiSunduEnAz, "kendisi sunmuş");
        if (ifade.altKume) {
          kontrol(rs.filter((s) => uyarMi(s, ifade.altKume.suzgec)).length, ifade.altKume.enAz, `${ifade.altKume.ad}’dan`);
        }
        return { gecti, deger: ifade.enAz === 1 && parcalar.length === 1 ? `${rs.length} yayın` : parcalar.join(", ") };
      }
      case "dergi": {
        const rs = suz(ortam, ifade.suzgec);
        rs.filter((s) => !norm(s.eser.kaynak)).forEach((s) =>
          ortam.uyar(s.no, "Dergi adı girilmemiş; farklı dergi şartında ayrı dergi kabul edildi."));
        const dergi = (s) => norm(s.eser.kaynak) || `__satir${s.no}`;
        const D = new Set(rs.map(dergi)).size;
        const tekler = rs.filter((s) => s.yazar === 1);
        let gecti, tekDeger;
        if (ifade.farkli >= ifade.toplam) {
          // Hepsi ayrı dergilerde olmalı: tek yazarlılar da ayrı dergilerden seçilmeli
          const S = new Set(tekler.map(dergi)).size;
          gecti = S >= ifade.tek && D >= ifade.toplam;
          tekDeger = `tek yazarlı ${Math.min(S, ifade.tek)}/${ifade.tek} farklı dergide`;
        } else {
          gecti = rs.length >= ifade.toplam && tekler.length >= ifade.tek && D >= ifade.farkli;
          tekDeger = `tek yazarlı ${Math.min(tekler.length, ifade.tek)}/${ifade.tek}`;
        }
        return { gecti, deger: `${rs.length}/${ifade.toplam} yayın, ${Math.min(D, ifade.farkli)}/${ifade.farkli} farklı dergi, ${tekDeger}` };
      }
      case "ogretim":
        return { gecti: ortam.puan9 >= ifade.enAz - EPS, deger: `${fmt(ortam.puan9)} / ${ifade.enAz} puan` };
      case "hata":
        return { gecti: false, deger: ifade.deger || "Belirlenemedi", aciklama: ifade.mesaj };
      case "ve": {
        const rs = ifade.parcalar.map((p) => degerlendir(p, ortam));
        return { gecti: rs.every((r) => r.gecti), deger: rs.map((r) => r.deger).join(" · "),
                 aciklama: rs.map((r) => r.aciklama).filter(Boolean).join(" ") || undefined };
      }
      case "veya": {
        const secenekler = ifade.parcalar.filter((p) => !p.yalnizcaYabanci || ortam.ay.yabanci);
        const rs = secenekler.map((p) => ({ p, r: degerlendir(p, ortam) }));
        const gecen = rs.find((x) => x.r.gecti);
        const satir = (x) => `${x.p.etiket || "Seçenek"}: ${x.r.deger}`;
        if (gecen) {
          return { gecti: true, deger: gecen.p.etiket || "Sağlanıyor",
                   aciklama: gecen === rs[0] ? satir(gecen) : `${gecen.p.etiket} yoluyla sağlanıyor. ${satir(gecen)}` };
        }
        return { gecti: false, deger: "Sağlanmıyor", aciklama: rs.map(satir).join(" · ") };
      }
      default:
        throw new Error("Bilinmeyen koşul tipi: " + ifade.tip);
    }
  }

  const Hesap = { hesapla, kodCoz, ehCoz, yazarlikCoz, sayi, fmt, norm, ascii, tabloBul, baslicaPayi,
                  tablolar: () => Ortak.sirali() };
  if (NODE) module.exports = Hesap;
  else root.Hesap = Hesap;
})(typeof window !== "undefined" ? window : globalThis);
