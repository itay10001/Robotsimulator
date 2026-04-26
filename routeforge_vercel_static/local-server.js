const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 3000;

const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json"
};

http.createServer((req, res) => {
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(root, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "text/plain" });
    res.end(data);
  });
}).listen(port, () => {
  console.log(`Open http://localhost:${port}`);
});
