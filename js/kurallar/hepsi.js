/* Node için: bütün tabloları yükler. Tarayıcıda dosyalar <script> ile tek tek eklenir. */
const O = require("./ortak.js");
for (const f of ["tablo01", "tablo02", "tablo05", "tablo09", "tablo10", "tablo11", "tablo12"]) O.kaydet(require("./" + f + ".js"));
module.exports = O.tablolar;
