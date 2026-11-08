// Preview the site:  npm run dev  (= node build.mjs && node serve.mjs)  → http://localhost:8080
import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import { extname, join, normalize, dirname } from "path";
import { fileURLToPath } from "url";
const root = dirname(fileURLToPath(import.meta.url));
const port = +(process.argv[2] ?? 8080);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webmanifest": "application/manifest+json", ".json": "application/json", ".xml": "application/xml" };
createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  if (p.includes("..")) { res.writeHead(400).end(); return; }
  let file = join(root, p);
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); } catch { /* 404 below */ }
  try { const body = await readFile(file); res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-cache" }).end(body); }
  catch { res.writeHead(404, { "Content-Type": "text/html" }).end(await readFile(join(root, "404.html")).catch(() => "Not found")); }
}).listen(port, "127.0.0.1", () => console.log(`Preview → http://localhost:${port}/`));
