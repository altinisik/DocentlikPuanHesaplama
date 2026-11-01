"""
Excel şablonunu ve örnek dosyayı js/kurallar.js'ten üretir.
Kullanım (repo kökünde):  python3 araclar/sablon_uret.py
"""
import json, subprocess
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

veri = json.loads(subprocess.check_output(["node", "araclar/veri_json.js"]))
K, ORNEK = veri["kurallar"], veri["ornek"]
MADDELER = [f'{k["kod"]} · {k["ad"]}' for k in K["kalemler"]]
ALANLAR = K["iletisimAlanlari"] + ["Diğer"]
SATIR = 500

F = "Arial"
BASLIK = Font(name=F, bold=True, color="FFFFFF", size=10)
BASLIK_DOLGU = PatternFill("solid", fgColor="23395B")
GIRDI = PatternFill("solid", fgColor="FFF8E1")
NORMAL = Font(name=F, size=10)
KALIN = Font(name=F, size=10, bold=True)
INCE = Side(style="thin", color="D0D5DD")
KUTU = Border(left=INCE, right=INCE, top=INCE, bottom=INCE)
SUTUNLAR = [
    ("Eser / Faaliyet", 42, "Makalenin, kitabın, projenin kısa adı. Aynı eseri iki satıra yazmayın."),
    ("Madde", 58, "Açılır listeden seçin. Kod ve açıklama birlikte yazılır; uygulama yalnızca baştaki kodu okur."),
    ("Doktora Sonrası (E/H)", 14, "Eser doktora unvanından sonra yayımlandıysa E. Atıflarda: atıf alan eseriniz doktora sonrası ise E."),
    ("Yazar / Kişi Sayısı", 12, "Yayın, bildiri ve patentlerde zorunlu. Puan bu sayıya bölünür."),
    ("Adet", 9, "Yalnızca atıf (5) satırlarında atıf sayısı, eğitim-öğretimde (9a/9b) farklı yarıyıl/yıl sayısı."),
    ("Dergi / Kitap / Toplantı Adı", 34, "2a'da dergi adı, 4b/4d'de kitap adı, 8'de toplantı adı. Aynı ad kuralları kontrol etmek için kullanılır."),
    ("Tezden Üretildi (E/H)", 13, "Lisansüstü tezinizden üretildiyse E (bu durumda madde 3 seçilmeli)."),
    ("Not", 30, "Serbest not; hesaba girmez."),
]

def yaz(ws, satir, sutun, deger, font=NORMAL, dolgu=None):
    c = ws.cell(row=satir, column=sutun, value=deger)
    c.font = font
    c.alignment = Alignment(vertical="top", wrap_text=True)
    if dolgu: c.fill = dolgu
    return c

def kitap(ornek_mi):
    wb = Workbook()
    # --- Eserler
    ws = wb.active
    ws.title = "Eserler"
    for j, (ad, gen, _) in enumerate(SUTUNLAR, 1):
        c = yaz(ws, 1, j, ad, BASLIK, BASLIK_DOLGU)
        c.alignment = Alignment(vertical="center", wrap_text=True)
        c.border = KUTU
        ws.column_dimensions[c.column_letter].width = gen
    ws.row_dimensions[1].height = 32
    ws.freeze_panes = "A2"
    for i in range(2, SATIR + 2):
        for j in range(1, len(SUTUNLAR) + 1):
            c = ws.cell(row=i, column=j)
            c.fill = GIRDI; c.border = KUTU; c.font = NORMAL
    kod2metin = {k["kod"]: f'{k["kod"]} · {k["ad"]}' for k in K["kalemler"]}
    eh = lambda x: None if x is None else ("E" if x else "H")
    if ornek_mi:
        for i, e in enumerate(ORNEK["eserler"], 2):
            degerler = [e["eserId"], kod2metin[e["madde"]], eh(e["doktoraSonrasi"]), e["yazarSayisi"],
                        e["adet"], e["kaynak"] or None, eh(e["tezKaynakli"]), e["not"] or None]
            for j, d in enumerate(degerler, 1):
                ws.cell(row=i, column=j, value=d)

    dv_madde = DataValidation(type="list", formula1=f"Listeler!$A$2:$A${len(MADDELER)+1}", allow_blank=True,
                              showErrorMessage=True, errorTitle="Madde", error="Listeden bir madde seçin.")
    dv_eh = DataValidation(type="list", formula1='"E,H"', allow_blank=True,
                           showErrorMessage=True, errorTitle="E/H", error="E veya H girin.")
    dv_yazar = DataValidation(type="whole", operator="greaterThanOrEqual", formula1="1", allow_blank=True,
                              showErrorMessage=True, error="1 veya daha büyük bir tam sayı girin.")
    dv_adet = DataValidation(type="decimal", operator="greaterThanOrEqual", formula1="0", allow_blank=True,
                             showErrorMessage=True, error="0 veya daha büyük bir sayı girin.")
    for dv in (dv_madde, dv_eh, dv_yazar, dv_adet):
        ws.add_data_validation(dv)
    for dv, sutun in [(dv_madde, "B"), (dv_eh, "C"), (dv_yazar, "D"), (dv_adet, "E"), (dv_eh, "G")]:
        dv.add(f"{sutun}2:{sutun}{SATIR+1}")

    # --- Ayarlar
    wa = wb.create_sheet("Ayarlar")
    for j, (ad, gen) in enumerate([("Ayar", 46), ("Değer", 26), ("Açıklama", 70)], 1):
        c = yaz(wa, 1, j, ad, BASLIK, BASLIK_DOLGU); c.border = KUTU
        wa.column_dimensions[c.column_letter].width = gen
    ay = ORNEK["ayarlar"] if ornek_mi else {"alan": "Diğer", "yabanci": False, "kadrolu": False}
    ayarlar = [
        ("Bilim alanı", ay["alan"], "Görsel İletişim Tasarımı, İletişim Çalışmaları, Reklamcılık, Sinema veya Halkla İlişkiler alanlarında 13. maddenin c, d, e bentlerinden en az 10 puan aranır. Diğer tüm alanlar için 'Diğer' seçin."),
        ("Yabancı uyruk / yurt dışı doçentlik denkliği", "E" if ay["yabanci"] else "H", "E ise TR Dizin şartı 1a, 1b, 1c yayınlarıyla tamamlanabilir."),
        ("Doktora sonrası en az 2 yıl kadrolu öğretim elemanı", "E" if ay["kadrolu"] else "H", "E ise 9. maddeden 2 puan almış sayılırsınız (ders puanına eklenmez)."),
    ]
    for i, (a, d, acik) in enumerate(ayarlar, 2):
        yaz(wa, i, 1, a, KALIN).border = KUTU
        c = yaz(wa, i, 2, d, NORMAL, GIRDI); c.border = KUTU
        yaz(wa, i, 3, acik).border = KUTU
        wa.row_dimensions[i].height = 42
    dv_alan = DataValidation(type="list", formula1=f"Listeler!$C$2:$C${len(ALANLAR)+1}", allow_blank=False)
    dv_eh2 = DataValidation(type="list", formula1='"E,H"', allow_blank=False)
    wa.add_data_validation(dv_alan); wa.add_data_validation(dv_eh2)
    dv_alan.add("B2"); dv_eh2.add("B3:B4")

    # --- Kılavuz
    wk = wb.create_sheet("Kılavuz")
    wk.column_dimensions["A"].width = 30
    wk.column_dimensions["B"].width = 70
    wk.column_dimensions["C"].width = 10
    wk.column_dimensions["D"].width = 30
    r = 1
    yaz(wk, r, 1, "Nasıl doldurulur", Font(name=F, size=14, bold=True)); r += 2
    for t in [
        "Sarı hücreler girdi alanıdır. Her eser veya faaliyet için Eserler sayfasına bir satır ekleyin.",
        "Ayarlar sayfasındaki üç değeri kendinize göre seçin.",
        "Dosyayı kaydedip hesaplama sayfasına yükleyin. Puanlar, tavanlar ve zorunlu koşullar orada hesaplanır.",
        "Atıflar için her atıf yerine bent başına tek satır yazıp Adet sütununa atıf sayısını girebilirsiniz.",
        "Kendi eserlerinize yaptığınız atıfları ve aynı yayındaki tekrar eden atıfları saymayın.",
    ]:
        yaz(wk, r, 1, "•"); yaz(wk, r, 2, t); r += 1
    r += 1
    yaz(wk, r, 1, "Sütunlar", Font(name=F, size=12, bold=True)); r += 1
    for ad, _, acik in SUTUNLAR:
        yaz(wk, r, 1, ad, KALIN); yaz(wk, r, 2, acik); r += 1
    r += 1
    yaz(wk, r, 1, "Madde listesi", Font(name=F, size=12, bold=True)); r += 1
    for j, b in enumerate(["Kod", "Açıklama", "Puan", "Hesap"], 1):
        yaz(wk, r, j, b, BASLIK, BASLIK_DOLGU)
    r += 1
    hesap = {"yayin": "Yazar/kişi sayısına bölünür", "adet": "Adet ile çarpılır", "sabit": "Olduğu gibi",
             "ogretim": "Birim başına"}
    for k in K["kalemler"]:
        yaz(wk, r, 1, k["kod"], KALIN); yaz(wk, r, 2, k["ad"]); yaz(wk, r, 3, k["puan"])
        yaz(wk, r, 4, hesap[k["tip"]] + (f' ({k["birim"]} birim)' if k.get("birim") else "")); r += 1

    # --- Listeler (gizli)
    wl = wb.create_sheet("Listeler")
    wl["A1"] = "Maddeler"; wl["C1"] = "Alanlar"
    for i, m in enumerate(MADDELER, 2): wl.cell(row=i, column=1, value=m)
    for i, a in enumerate(ALANLAR, 2): wl.cell(row=i, column=3, value=a)
    wl.sheet_state = "hidden"
    return wb

kitap(False).save("sablon/docentlik_sablon.xlsx")
kitap(True).save("sablon/ornek_eserler.xlsx")
print("Yazıldı: sablon/docentlik_sablon.xlsx, sablon/ornek_eserler.xlsx")
