// Kurgusal bir aday. Örnek Excel dosyası da bu veriden üretilir.
const E = true, H = false;
const r = (eserId, madde, ds, yazar, adet, kaynak, tez) =>
  ({ eserId, madde, doktoraSonrasi: ds, yazarSayisi: yazar, adet, kaynak, tezKaynakli: tez, not: "" });

module.exports = {
  ayarlar: { alan: "Diğer", yabanci: false, kadrolu: true },
  eserler: [
    r("Kamu politikasında ağ yönetişimi", "1a-Q2", E, 2, null, "Public Policy Review", H),
    r("Yerel yönetimlerde katılım", "1c", E, 1, null, "Journal of Urban Affairs Studies", H),
    r("Bütçe şeffaflığı karşılaştırması", "1c", H, 2, null, "Comparative Governance", H),
    r("Belediye hizmetlerinde vatandaş memnuniyeti", "2a", E, 1, null, "Kamu Yönetimi Dergisi", H),
    r("Bölgesel kalkınma ajansları", "2a", E, 1, null, "Bölgesel Çalışmalar", H),
    r("Dijital dönüşüm ve bürokrasi", "2a", E, 1, null, "Yönetim Bilimleri", H),
    r("Sosyal politika ve yoksulluk", "2a", E, 2, null, "Sosyal Araştırmalar Dergisi", H),
    r("Afet yönetiminde koordinasyon", "2a", E, 3, null, "Ekonomi ve Toplum", H),
    r("Merkez-yerel ilişkileri", "2a", H, 1, null, "Kamu Yönetimi Dergisi", H),
    r("Kamu personel reformu", "2b", E, 1, null, "Akademik Bakış", H),
    r("Yüksek lisans tezinden makale", "3d", H, 2, null, "Siyaset Dergisi", E),
    r("Doktora tezinden makale", "3a", E, 1, null, "Governance Quarterly", E),
    r("Yönetişim kavramının dönüşümü", "4b", E, 1, null, "Yönetişim Üzerine Yazılar", H),
    r("Yönetişimde hesap verebilirlik", "4b", E, 2, null, "Yönetişim Üzerine Yazılar", H),
    r("Kentsel dönüşüm ve yerel aktörler", "4d", E, 1, null, "Kent Çalışmaları", H),
    r("Türkiye'de yerel yönetimler", "4c", E, 1, null, "", H),
    r("Atıflar (WoS/Scopus)", "5a", E, null, 4, "", H),
    r("Atıflar (TR Dizin)", "5c", E, null, 2, "", H),
    r("Atıflar (doktora öncesi eserlere)", "5d", H, null, 3, "", H),
    r("YL tezi: A. Yılmaz", "6b-Asıl", E, null, null, "", H),
    r("YL tezi: B. Kaya", "6b-Eş", E, null, null, "", H),
    r("BAP projesi", "7d", E, null, null, "", H),
    r("TÜBİTAK 1001 projesi", "7a-Araştırmacı", E, null, null, "", H),
    r("Bildiri: yerel demokrasi", "8b", E, 1, null, "Kamu Yönetimi Forumu 2022", H),
    r("Bildiri: e-belediyecilik", "8b", E, 2, null, "Kamu Yönetimi Forumu 2022", H),
    r("Bildiri: ağ yönetişimi", "8a", E, 2, null, "International Governance Conference 2023", H),
    r("Lisans dersleri", "9a", E, null, 6, "", H),
    r("TR Dizin dergide yayın kurulu üyeliği", "12c", E, null, null, "", H)
  ]
};
