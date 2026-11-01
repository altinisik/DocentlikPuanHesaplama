// ORCID v3.0 /works yanıtı biçiminde kurgusal kayıt (testler için)
const doi = (v, rel = "self") => ({ "external-id-type": "doi", "external-id-value": v.toUpperCase(),
  "external-id-normalized": { value: v, transient: true }, "external-id-relationship": rel });
const ozet = (put, baslik, tur, yil, dergi, ids = []) => ({
  "put-code": put, title: { title: { value: baslik }, subtitle: null }, type: tur,
  "publication-date": yil ? { year: { value: String(yil) }, month: null, day: null } : null,
  "journal-title": dergi ? { value: dergi } : null,
  "external-ids": { "external-id": ids }, "display-index": "1"
});
module.exports = {
  group: [
    { "external-ids": { "external-id": [doi("10.1000/ssci.2021")] },
      "work-summary": [ozet(1, "Kamu politikasında ağ yönetişimi", "journal-article", 2021, "Public Policy Review", [doi("10.1000/ssci.2021")]),
                       ozet(2, "Kamu politikasında ağ yönetişimi (kopya)", "journal-article", 2021, null, [])] },
    { "external-ids": { "external-id": [] },
      "work-summary": [ozet(3, "Belediye hizmetlerinde memnuniyet", "journal-article", 2019, "Kamu Yönetimi Dergisi")] },
    { "external-ids": { "external-id": [doi("10.1000/bolum.2018")] },
      "work-summary": [ozet(4, "Yönetişim kavramının dönüşümü", "book-chapter", 2018, null, [doi("10.1000/bolum.2018")])] },
    { "external-ids": { "external-id": [] },
      "work-summary": [ozet(5, "Yerel demokrasi üzerine", "conference-paper", 2017, "Kamu Yönetimi Forumu")] },
    { "external-ids": { "external-id": [] },
      "work-summary": [ozet(6, "Doktora tezi", "dissertation-thesis", 2018, null)] },
    { "external-ids": { "external-id": [] },
      "work-summary": [ozet(7, "Tarihsiz çalışma", "journal-article", null, "Bir Dergi")] }
  ]
};
