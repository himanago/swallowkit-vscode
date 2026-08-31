const fs = require("fs");
const path = require("path");

const bundle = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "l10n", "bundle.l10n.ja.json"), "utf8"));
const bundleKeys = new Set(Object.keys(bundle));
const used = new Set();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith(".ts")) {
      const src = fs.readFileSync(p, "utf8");
      const re = /l10n\.t\(\s*("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
      let m;
      while ((m = re.exec(src))) {
        const raw = m[2] !== undefined ? m[2] : m[3];
        const key = raw.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'");
        used.add(key);
      }
    }
  }
}

walk(path.join(__dirname, "..", "src"));

const missing = [...used].filter((k) => !bundleKeys.has(k));
const unused = [...bundleKeys].filter((k) => !used.has(k));
console.log("used keys:", used.size);
console.log("missing in bundle:", JSON.stringify(missing, null, 2));
console.log("unused in bundle:", JSON.stringify(unused, null, 2));
process.exitCode = missing.length > 0 ? 1 : 0;
