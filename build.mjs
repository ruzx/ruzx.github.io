// Static site generator for ruzx.github.io — no dependencies.
//   node build.mjs            → _site/   (GitHub Actions runs this on every push)
//   node serve.mjs            → preview on http://localhost:8080
// Edit content/profile.json for the home page and CV, add Markdown files to content/posts/ for the blog.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, cpSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = dirname(fileURLToPath(import.meta.url));
const OUT = join(root, "_site");
const SITE_URL = "https://ruzx.github.io";
const P = JSON.parse(readFileSync(join(root, "content/profile.json"), "utf8"));

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const write = (rel, html) => { const f = join(OUT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); };
const fmtDate = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

// ---------------------------------------------------------------- markdown
function inline(s) {
  let t = esc(s);
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy">`);
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, href) => `<a href="${href}"${/^https?:/.test(href) ? ' rel="noopener"' : ""}>${txt}</a>`);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, "$1<em>$2</em>");
  t = t.replace(/(^|\W)_([^_\n]+)_(?!\w)/g, "$1<em>$2</em>");
  return t;
}
export function markdown(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    const fence = /^```(\w*)/.exec(l);
    if (fence) { const b = []; i++; while (i < lines.length && !lines[i].startsWith("```")) b.push(lines[i++]); i++; out.push(`<pre><code${fence[1] ? ` class="lang-${fence[1]}"` : ""}>${esc(b.join("\n"))}</code></pre>`); continue; }
    const hd = /^(#{1,6})\s+(.*)$/.exec(l);
    if (hd) { const n = Math.min(6, hd[1].length + 1); out.push(`<h${n}>${inline(hd[2])}</h${n}>`); i++; continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { out.push("<hr>"); i++; continue; }
    if (/^\s*\|/.test(l) && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] ?? "")) {
      const row = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      let h = "<table><thead><tr>" + row(l).map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>"; i += 2;
      while (i < lines.length && /^\s*\|/.test(lines[i])) h += "<tr>" + row(lines[i++]).map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
      out.push(h + "</tbody></table>"); continue;
    }
    if (/^\s*([-*+]|\d+\.)\s+/.test(l)) {
      const ol = /^\s*\d+\./.test(l); const items = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, ""))}</li>`);
      out.push(ol ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`); continue;
    }
    if (/^>\s?/.test(l)) { const q = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, "")); out.push(`<blockquote>${markdown(q.join("\n"))}</blockquote>`); continue; }
    if (!l.trim()) { i++; continue; }
    if (/^<[a-z]/i.test(l.trim())) { const b = []; while (i < lines.length && lines[i].trim()) b.push(lines[i++]); out.push(b.join("\n")); continue; } // raw HTML block
    const p = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|\s*\||\s*([-*+]|\d+\.)\s|>)/.test(lines[i])) p.push(lines[i++]);
    out.push(`<p>${p.map(inline).join(" ")}</p>`);
  }
  return out.join("\n");
}

function frontMatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  const meta = {};
  if (!m) return { meta, body: text };
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    else v = v.replace(/^["']|["']$/g, "");
    meta[kv[1]] = v;
  }
  return { meta, body: text.slice(m[0].length) };
}

// ---------------------------------------------------------------- layout
const NAV = [["/", "Home"], ["/cv/", "CV"], ["/blog/", "Blog"], ["/chemedit/", "ChemEdit"], ["/arcade/", "Arcade"]];
function page({ title, desc = P.summary, path, body, cls = "" }) {
  const full = title ? `${title} · ${P.name}` : `${P.name} — ${P.title}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc.slice(0, 200))}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc.slice(0, 200))}">
<meta property="og:url" content="${SITE_URL}${path}">
<link rel="canonical" href="${SITE_URL}${path}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="${esc(P.name)} — blog" href="/feed.xml">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body class="${cls}">
<header class="top"><div class="wrap top-in">
  <a class="logo" href="/">${esc(P.name)}</a>
  <nav>${NAV.map(([href, label]) => `<a href="${href}"${path === href || (href !== "/" && path.startsWith(href)) ? ' class="on"' : ""}>${label}</a>`).join("")}</nav>
</div></header>
<main class="wrap">
${body}
</main>
<footer class="foot"><div class="wrap">© ${new Date().getFullYear()} ${esc(P.name)} · <a href="/feed.xml">RSS</a> · Built with a tiny static generator, hosted on GitHub Pages</div></footer>
</body>
</html>`;
}

const initials = P.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2);
const avatar = P.photo ? `<img class="avatar" src="${esc(P.photo)}" alt="${esc(P.name)}">` : `<div class="avatar initials" aria-hidden="true">${esc(initials)}</div>`;
const linkList = (cls = "links") => `<ul class="${cls}">${P.links.map((l) => `<li><a href="${esc(l.url)}"${/^https?:/.test(l.url) ? ' rel="me noopener"' : ""}><span class="lk-l">${esc(l.label)}</span> ${esc(l.text)}</a></li>`).join("")}</ul>`;
const doiLink = (d) => d ? ` <a class="doi" href="https://doi.org/${esc(d)}">doi:${esc(d)}</a>` : "";
const authors = (a) => esc(a).replace(/Sitdikov R\.(?: ?R\.)?/g, (m) => `<strong>${m}</strong>`);
const pub = (p) => `<li>${authors(p.authors)} “${esc(p.title)}”. <em>${esc(p.venue)}</em>, ${p.year}.${doiLink(p.doi)}</li>`;
const appCard = (a) => `<a class="app" href="${esc(a.url)}"><img src="${esc(a.icon)}" alt="" width="52" height="52"><div><div class="app-name">${esc(a.name)}</div><div class="app-tag">${esc(a.tagline)}</div><p>${esc(a.text)}</p><span class="app-cta">Open in browser →</span></div></a>`;

// ---------------------------------------------------------------- build
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(root, "assets"), join(OUT, "assets"), { recursive: true });
for (const app of ["chemedit", "arcade"]) if (existsSync(join(root, app))) cpSync(join(root, app), join(OUT, app), { recursive: true });
writeFileSync(join(OUT, ".nojekyll"), "");

// posts
const postDir = join(root, "content/posts");
const posts = (existsSync(postDir) ? readdirSync(postDir) : []).filter((f) => f.endsWith(".md")).map((f) => {
  const { meta, body } = frontMatter(readFileSync(join(postDir, f), "utf8"));
  const date = meta.date || f.slice(0, 10);
  const slug = meta.slug || f.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const html = markdown(body);
  const excerpt = meta.summary || body.replace(/[#*_`>\[\]()!-]/g, "").split(/\n\s*\n/).map((s) => s.trim()).find((s) => s.length > 40)?.slice(0, 220) || "";
  return { ...meta, date, slug, html, excerpt, tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [], draft: meta.draft === "true" };
}).filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date));

const postItem = (p) => `<li class="post-item"><time datetime="${p.date}">${fmtDate(p.date)}</time><a href="/blog/${p.slug}/">${esc(p.title)}</a><p>${esc(p.excerpt)}</p></li>`;

// home
write("index.html", page({ path: "/", body: `
<section class="hero">
  ${avatar}
  <div>
    <h1>${esc(P.name)}</h1>
    <p class="role">${esc(P.title)}</p>
    <p class="loc">${esc(P.location)}</p>
    ${linkList("links inline")}
  </div>
</section>
<section><h2>About</h2><p class="lead">${esc(P.summary)}</p>
<ul class="tags">${P.interests.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
<p><a class="btn" href="/cv/">Full CV →</a></p></section>
<section><h2>Apps for chemists</h2><p class="muted">They run in the browser and install as offline apps on Windows, macOS, Android and iOS (use the browser's <em>Install</em> or <em>Add to Home Screen</em>).</p>
<div class="apps">${P.apps.map(appCard).join("")}</div></section>
<section><h2>Selected publications</h2><ol class="pubs">${P.publications.filter((p) => p.selected).map(pub).join("")}</ol>
<p><a href="/cv/#publications">All ${P.publications.length} publications →</a></p></section>
${posts.length ? `<section><h2>Latest from the blog</h2><ul class="posts">${posts.slice(0, 3).map(postItem).join("")}</ul><p><a href="/blog/">All posts →</a></p></section>` : ""}
` }));

// CV
const entry = (e, title, sub) => `<article class="entry"><div class="entry-head"><div><h3>${esc(title)}</h3><div class="entry-org">${esc(sub)}</div></div><div class="entry-meta">${esc(e.dates)}<br>${esc(e.place)}</div></div>${e.points?.length ? `<ul>${e.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</article>`;
write("cv/index.html", page({ title: "CV", path: "/cv/", cls: "cv", body: `
<section class="cv-head">
  ${avatar}
  <div><h1>${esc(P.name)}</h1><p class="role">${esc(P.title)}</p><p class="loc">${esc(P.location)}</p>${linkList("links inline")}</div>
  <button class="btn print-btn" onclick="window.print()">Print / PDF</button>
</section>
<section><h2>Profile</h2><p>${esc(P.summary)}</p></section>
<section><h2>Core competencies</h2><dl class="skills">${P.competencies.map((c) => `<dt>${esc(c.area)}</dt><dd>${esc(c.items)}</dd>`).join("")}</dl></section>
<section><h2>Experience</h2>${P.experience.map((e) => entry(e, e.role, e.org)).join("")}</section>
<section><h2>Education</h2>${P.education.map((e) => entry(e, e.degree, e.org)).join("")}</section>
<section id="publications"><h2>Publications</h2><ol class="pubs" reversed>${P.publications.map(pub).join("")}</ol></section>
<section><h2>Honours &amp; awards</h2><ul class="awards">${P.awards.map((a) => `<li><span class="aw-y">${esc(a.year)}</span><span><strong>${esc(a.name)}</strong> — ${esc(a.detail)}, ${esc(a.place)}</span></li>`).join("")}</ul></section>
` }));

// blog
const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();
write("blog/index.html", page({ title: "Blog", path: "/blog/", body: `
<h1>Blog</h1>
<p class="muted">Notes on chemistry, electrosynthesis, lab software and teaching. <a href="/feed.xml">RSS feed</a>.</p>
${allTags.length ? `<ul class="tags">${allTags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
<ul class="posts">${posts.map(postItem).join("") || "<li>No posts yet.</li>"}</ul>` }));
for (const p of posts) {
  write(`blog/${p.slug}/index.html`, page({ title: p.title, desc: p.excerpt || p.title, path: `/blog/${p.slug}/`, body: `
<article class="post">
  <header><h1>${esc(p.title)}</h1><p class="muted"><time datetime="${p.date}">${fmtDate(p.date)}</time>${p.tags.length ? " · " + p.tags.map(esc).join(", ") : ""}</p></header>
  ${p.html}
  <footer class="post-foot"><a href="/blog/">← All posts</a></footer>
</article>` }));
}

// RSS + sitemap + 404
write("feed.xml", `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>${esc(P.name)} — blog</title><link>${SITE_URL}/blog/</link><description>${esc(P.title)}</description>
${posts.map((p) => `<item><title>${esc(p.title)}</title><link>${SITE_URL}/blog/${p.slug}/</link><guid>${SITE_URL}/blog/${p.slug}/</guid><pubDate>${new Date(p.date + "T12:00:00Z").toUTCString()}</pubDate><description>${esc(p.excerpt)}</description></item>`).join("\n")}
</channel></rss>`);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/", "/cv/", "/blog/", "/chemedit/", "/arcade/", ...posts.map((p) => `/blog/${p.slug}/`)].map((u) => `<url><loc>${SITE_URL}${u}</loc></url>`).join("")}</urlset>`);
write("404.html", page({ title: "Not found", path: "/404.html", body: `<h1>Page not found</h1><p><a href="/">Back to the home page</a></p>` }));

console.log(`Built ${OUT}: home, CV, ${posts.length} post(s), apps: ${["chemedit", "arcade"].filter((a) => existsSync(join(root, a))).join(", ") || "none"}`);
