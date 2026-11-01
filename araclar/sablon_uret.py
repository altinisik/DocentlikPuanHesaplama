"""
Her temel alan için Excel şablonunu ve örnek dosyayı js/kurallar/ dosyalarından üretir.
Kullanım (repo kökünde):  python3 araclar/sablon_uret.py
"""
import json, shutil, subprocess
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

veri = json.loads(subprocess.check_output(["node", "araclar/veri_json.js"]))
TABLOLAR, ORNEK = veri["tablolar"], veri["ornek"]
SATIR = 500
YAZARLIK = ["Başlıca yazar benim", "Başlıca yazar başkası", "Başlıca yazar belirtilmemiş"]
YAZARLIK_KOD = {"baslica": YAZARLIK[0], "diger": YAZARLIK[1], "belirtilmemis": YAZARLIK[2]}

F = "Arial"
BASLIK = Font(name=F, bold=True, color="FFFFFF", size=10)
BASLIK_DOLGU = PatternFill("solid", fgColor="23395B")
GIRDI = PatternFill("solid", fgColor="FFF8E1")
NORMAL = Font(name=F, size=10)
KALIN = Font(name=F, size=10, bold=True)
INCE = Side(style="thin", color="D0D5DD")
KUTU = Border(left=INCE, right=INCE, top=INCE, bottom=INCE)

def tablo_adi(t):
    return f'Tablo {t["no"]} · {t["ad"]}'

def sutunlar(t):
    ds = "Doktora/Uzmanlık Sonrası (E/H)" if "uzmanlık" in t["tarihAdi"] else "Doktora Sonrası (E/H)"
    s = [
        ("eser", "Eser / Faaliyet", 42, "Makalenin, kitabın, projenin kısa adı. Aynı eseri iki satıra yazmayın."),
        ("madde", "Madde", 58, "Açılır listeden seçin. Kod ve açıklama birlikte yazılır; uygulama yalnızca baştaki kodu okur."),
        ("ds", ds, 16, f'Eser {t["tarihAdi"]} unvanından sonra yayımlandıysa E. Atıflarda: atıf alan eseriniz {t["tarihAdi"]} sonrası ise E.'),
        ("yazar", "Yazar / Kişi Sayısı", 12, "Yayın, bildiri ve patentlerde zorunlu. Puan bu sayıya göre bölünür."),
    ]
    if "yazarlik" in t["ekSutunlar"]:
        s.append(("yazarlik", "Başlıca Yazar", 26,
                  "Çok yazarlı makalelerde seçin; puan buna göre hesaplanır. Başlıca yazar: " + (t["baslicaTanimi"] or "")))
    s += [
        ("adet", "Adet", 9, "Yalnızca atıf (5) satırlarında atıf sayısı, eğitim-öğretimde (9a/9b) farklı yarıyıl/yıl sayısı."),
        ("kaynak", "Dergi / Kitap / Toplantı Adı", 34, "2a’da dergi adı, 4b/4d’de kitap adı, 8’de toplantı adı. Aynı ad kuralları kontrol etmek için kullanılır."),
    ]
    if "kendisiSundu" in t["ekSutunlar"]:
        s.append(("kendisi", "Kendim Sundum (E/H)", 13, "8. madde bildirilerinde: bildiriyi kendiniz sunduysanız E. En az bir bildiriyi kendinizin sunmuş olması gerekir."))
    s += [
        ("tez", "Tezden Üretildi (E/H)", 13, "Lisansüstü tezinizden üretildiyse E (bu durumda madde 3 seçilmeli)."),
        ("not", "Not", 30, "Serbest not; hesaba girmez."),
    ]
    return s

def yaz(ws, satir, sutun, deger, font=NORMAL, dolgu=None):
    c = ws.cell(row=satir, column=sutun, value=deger)
    c.font = font
    c.alignment = Alignment(vertical="top", wrap_text=True)
    if dolgu: c.fill = dolgu
    return c

def kitap(t, ornek=None, tablo_satiri=True):
    SUT = sutunlar(t)
    sira = {k: j for j, (k, *_ ) in enumerate(SUT, 1)}
    MADDELER = [f'{k["kod"]} · {k["ad"]}' for k in t["kalemler"]]
    wb = Workbook()
    ws = wb.active
    ws.title = "Eserler"
    for j, (_, ad, gen, _a) in enumerate(SUT, 1):
        c = yaz(ws, 1, j, ad, BASLIK, BASLIK_DOLGU)
        c.alignment = Alignment(vertical="center", wrap_text=True)
        c.border = KUTU
        ws.column_dimensions[c.column_letter].width = gen
    ws.row_dimensions[1].height = 32
    ws.freeze_panes = "A2"
    for i in range(2, SATIR + 2):
        for j in range(1, len(SUT) + 1):
            c = ws.cell(row=i, column=j)
            c.fill = GIRDI; c.border = KUTU; c.font = NORMAL
    kod2metin = {k["kod"]: f'{k["kod"]} · {k["ad"]}' for k in t["kalemler"]}
    eh = lambda x: None if x is None else ("E" if x else "H")
    if ornek:
        for i, e in enumerate(ornek["eserler"], 2):
            d = {"eser": e["eserId"], "madde": kod2metin.get(e["madde"], e["madde"]), "ds": eh(e["doktoraSonrasi"]),
                 "yazar": e["yazarSayisi"], "adet": e["adet"], "kaynak": e["kaynak"] or None,
                 "tez": eh(e["tezKaynakli"]), "not": e["not"] or None}
            for k, v in d.items():
                ws.cell(row=i, column=sira[k], value=v)

    harf = lambda k: ws.cell(row=1, column=sira[k]).column_letter
    dvs = [
        (DataValidation(type="list", formula1=f"Listeler!$A$2:$A${len(MADDELER)+1}", allow_blank=True,
                        showErrorMessage=True, errorTitle="Madde", error="Listeden bir madde seçin."), ["madde"]),
        (DataValidation(type="list", formula1='"E,H"', allow_blank=True, showErrorMessage=True,
                        errorTitle="E/H", error="E veya H girin."), ["ds", "tez"] + (["kendisi"] if "kendisi" in sira else [])),
        (DataValidation(type="whole", operator="greaterThanOrEqual", formula1="1", allow_blank=True,
                        showErrorMessage=True, error="1 veya daha büyük bir tam sayı girin."), ["yazar"]),
        (DataValidation(type="decimal", operator="greaterThanOrEqual", formula1="0", allow_blank=True,
                        showErrorMessage=True, error="0 veya daha büyük bir sayı girin."), ["adet"]),
    ]
    if "yazarlik" in sira:
        dvs.append((DataValidation(type="list", formula1=f"Listeler!$E$2:$E${len(YAZARLIK)+1}", allow_blank=True,
                                   showErrorMessage=True, error="Listeden seçin."), ["yazarlik"]))
    for dv, alanlar in dvs:
        ws.add_data_validation(dv)
        for a in alanlar:
            dv.add(f"{harf(a)}2:{harf(a)}{SATIR+1}")

    # --- Ayarlar
    wa = wb.create_sheet("Ayarlar")
    for j, (ad, gen) in enumerate([("Ayar", 50), ("Değer", 34), ("Açıklama", 70)], 1):
        c = yaz(wa, 1, j, ad, BASLIK, BASLIK_DOLGU); c.border = KUTU
        wa.column_dimensions[c.column_letter].width = gen
    du = t["tarihAdi"]
    ay = (ornek or {}).get("ayarlar", {})
    satirlar = [("Temel alan", tablo_adi(t), "Şablonun hazırlandığı tablo. Dosya yüklendiğinde hesaplama bu tabloya göre yapılır.", "tablo")] if tablo_satiri else []
    if t["alanlar"]:
        satirlar.append(("Bilim alanı", ay.get("alan") or t["alanlar"]["varsayilan"] or None, t["alanlar"]["aciklama"], "alan"))
    satirlar += [
        ("Yabancı uyruk / yurt dışı doçentlik denkliği", "E" if ay.get("yabanci") else "H",
         "E ise TR Dizin şartı için 1a, 1b, 1c yayınlarıyla ilgili alternatif uygulanır.", "eh"),
        (f"{du.capitalize()} sonrası en az 2 yıl kadrolu öğretim elemanı", "E" if ay.get("kadrolu") else "H",
         "E ise 9. maddeden 2 puan almış sayılırsınız (ders puanına eklenmez). Yalnızca yükseköğretim kurumlarındaki kadro sayılır.", "eh"),
        (f"{du.capitalize()} unvanı Aralık 2016’dan önce alındı", "E" if ay.get("once2016") else "H",
         "E ise 3. maddedeki “en az bir yayın” şartı aranmaz (ÜAK SSS 59).", "eh"),
    ]
    for i, (a, d, acik, _) in enumerate(satirlar, 2):
        yaz(wa, i, 1, a, KALIN).border = KUTU
        c = yaz(wa, i, 2, d, NORMAL, GIRDI); c.border = KUTU
        yaz(wa, i, 3, acik).border = KUTU
        wa.row_dimensions[i].height = 44
    dv_tablo = DataValidation(type="list", formula1=f"Listeler!$G$2:$G${len(TABLOLAR)+1}", allow_blank=False)
    dv_eh2 = DataValidation(type="list", formula1='"E,H"', allow_blank=False)
    dv_alan = DataValidation(type="list", formula1=f'Listeler!$C$2:$C${len((t["alanlar"] or {}).get("secenekler", [])) + 1}', allow_blank=False)
    for i, s in enumerate(satirlar, 2):
        {"tablo": dv_tablo, "eh": dv_eh2, "alan": dv_alan}[s[3]].add(f"B{i}")
    for dv in (dv_tablo, dv_eh2, dv_alan):
        if str(dv.sqref): wa.add_data_validation(dv)  # yalnızca hücresi olan doğrulamalar

    # --- Kılavuz
    wk = wb.create_sheet("Kılavuz")
    for col, w in zip("ABCD", (30, 72, 10, 34)): wk.column_dimensions[col].width = w
    r = 1
    yaz(wk, r, 1, f"{tablo_adi(t)} · Nasıl doldurulur", Font(name=F, size=14, bold=True)); r += 2
    maddeler = [
        "Sarı hücreler girdi alanıdır. Her eser veya faaliyet için Eserler sayfasına bir satır ekleyin.",
        "Ayarlar sayfasındaki değerleri kendinize göre seçin.",
        "Dosyayı kaydedip hesaplama sayfasına yükleyin. Puanlar, tavanlar ve zorunlu koşullar orada hesaplanır.",
        "Atıflar için her atıf yerine bent başına tek satır yazıp Adet sütununa atıf sayısını girebilirsiniz.",
        "Kendi eserlerinize yaptığınız atıfları ve aynı yayındaki tekrar eden atıfları saymayın.",
        "“Early access”, “online first” gibi henüz bir sayıda yayımlanmamış makaleler sayılmaz (ÜAK SSS 17).",
    ]
    if t["bolme"] == "baslica":
        maddeler.append("Bu tabloda makale puanı başlıca yazara göre bölünür: tek yazarlıda tam puan; iki yazarlıda başlıca yazar 0,8, diğeri 0,5; üç ve daha fazla yazarlıda başlıca yazar yarısını, diğerleri kalan yarıyı eşit paylaşır. Başlıca yazar belirtilmemişse eşit bölünür. Bildiri ve kitaplar eşit bölünür.")
        maddeler.append("Başlıca yazar: " + t["baslicaTanimi"])
    maddeler += t["notlar"]
    for m in maddeler:
        yaz(wk, r, 1, "•"); yaz(wk, r, 2, m); r += 1
    r += 1
    yaz(wk, r, 1, "Sütunlar", Font(name=F, size=12, bold=True)); r += 1
    for _, ad, _g, acik in SUT:
        yaz(wk, r, 1, ad, KALIN); yaz(wk, r, 2, acik); r += 1
    r += 1
    yaz(wk, r, 1, "Madde listesi", Font(name=F, size=12, bold=True)); r += 1
    for j, b in enumerate(["Kod", "Açıklama", "Puan", "Hesap"], 1):
        yaz(wk, r, j, b, BASLIK, BASLIK_DOLGU)
    r += 1
    for k in t["kalemler"]:
        if k["tip"] == "yayin":
            h = "Başlıca yazara göre bölünür" if t["bolme"] == "baslica" and k["bent"] in t["baslicaBentleri"] else "Yazar/kişi sayısına eşit bölünür"
        else:
            h = {"adet": "Adet ile çarpılır", "sabit": "Olduğu gibi", "ogretim": f'{k["birim"]} birim başına'}[k["tip"]]
        yaz(wk, r, 1, k["kod"], KALIN); yaz(wk, r, 2, k["ad"]); yaz(wk, r, 3, k["puan"]); yaz(wk, r, 4, h); r += 1

    # --- Listeler (gizli)
    wl = wb.create_sheet("Listeler")
    wl["A1"] = "Maddeler"; wl["C1"] = "Alanlar"; wl["E1"] = "Başlıca yazar"; wl["G1"] = "Temel alanlar"
    for i, m in enumerate(MADDELER, 2): wl.cell(row=i, column=1, value=m)
    for i, a in enumerate((t["alanlar"] or {}).get("secenekler", []), 2): wl.cell(row=i, column=3, value=a)
    for i, a in enumerate(YAZARLIK, 2): wl.cell(row=i, column=5, value=a)
    for i, x in enumerate(TABLOLAR, 2): wl.cell(row=i, column=7, value=tablo_adi(x))
    wl.sheet_state = "hidden"
    return wb

for t in TABLOLAR:
    kitap(t).save(f'sablon/tablo-{t["id"]}_sablon.xlsx')
T11 = next(t for t in TABLOLAR if t["id"] == "11")
# Eski bağlantılar için: docentlik_sablon.xlsx = Tablo 11 şablonu
shutil.copy("sablon/tablo-11_sablon.xlsx", "sablon/docentlik_sablon.xlsx")
# Örnek dosya Tablo 11 verisidir; "Temel alan" satırı içermez, böylece seçili tablo değişmez
kitap(T11, ORNEK, tablo_satiri=False).save("sablon/ornek_eserler.xlsx")
print("Yazıldı:", ", ".join(f'tablo-{t["id"]}_sablon.xlsx' for t in TABLOLAR), "+ docentlik_sablon.xlsx, ornek_eserler.xlsx")
