// Python şablon üreticisi için kuralları ve örnek veriyi JSON olarak yazar.
const K = require("../js/kurallar.js");
const ornek = require("../test/ornek.js");
process.stdout.write(JSON.stringify({ kurallar: K, ornek }));
