import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const port = Number.parseInt(process.env.PORT ?? "4173", 10);
const types = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".ico": "image/x-icon", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml; charset=utf-8" };

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relative = pathname.replace(/^\/+/, "");
  let file = normalize(join(dist, relative));
  if (!file.startsWith(normalize(dist))) { response.writeHead(400); response.end("Bad request"); return; }
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); } catch {}
  try { await stat(file); } catch { file = join(dist, "404.html"); response.statusCode = 404; }
  response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => console.log(`Newsletter preview: http://127.0.0.1:${port}`));
