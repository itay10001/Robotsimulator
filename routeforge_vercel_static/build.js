const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");

function copyRecursive(source, target) {
  if (!fs.existsSync(source)) return;

  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

copyRecursive(path.join(root, "index.html"), path.join(dist, "index.html"));
copyRecursive(path.join(root, "styles.css"), path.join(dist, "styles.css"));
copyRecursive(path.join(root, "js"), path.join(dist, "js"));

console.log("Static build complete: dist/");
