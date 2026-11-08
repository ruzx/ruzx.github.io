# ruzx.github.io

Personal site of Ruzal Sitdikov: profile, CV, blog, plus two free educational web apps. No dependencies, only Node.

| URL | What | Source |
|---|---|---|
| `/` | Home: profile, apps, selected publications, latest posts | `content/profile.json` |
| `/cv/` | Full CV (Print / PDF button) | `content/profile.json` |
| `/blog/` | Blog + RSS (`/feed.xml`) | `content/posts/*.md` |
| `/chemedit/` | ChemEdit: structure editor + ELN (PWA) | built from the `chemeditnew` repo |
| `/chemgame/` | ChemGame: organic chemistry learning games (PWA) | built from the `chemeditnew` repo |

## How it is published

`npm run build` writes the finished pages (`index.html`, `cv/`, `blog/`, `feed.xml`, `sitemap.xml`, `404.html`) straight into this folder. GitHub Pages serves them as they are.

- Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
- No workflow is needed. The `.nojekyll` file makes GitHub skip Jekyll.

So after every change: **build → commit → push.**

```bash
npm run build      # regenerate the pages after editing content/
npm run dev        # build + preview at http://localhost:8080
npm run site       # rebuild ChemEdit + ChemGame from chemeditnew, copy them here, rebuild pages
```

`npm run site` finds `chemeditnew` automatically: next to this folder, in `~/projectstest/` or in `~/Documents/GitHub/`. If it's somewhere else, run `set CHEMEDIT_DIR=C:\path\to\chemeditnew` first.

## Editing

- **CV / home page:** `content/profile.json`.
  - It holds the summary, links, competencies, experience, education, publications, awards and apps.
  - `"selected": true` puts a publication on the home page.
  - Photo: save it as `assets/profile.jpg` and set `"photo": "/assets/profile.jpg"`.
- **Blog post:** add `content/posts/YYYY-MM-DD-slug.md`, then run `npm run build`:
  ```markdown
  ---
  title: My post title
  date: 2026-12-01
  tags: [electrochemistry, teaching]
  summary: One sentence for the list (optional).
  ---
  Text in **Markdown**: headings, lists, links, images (put them in assets/), code, tables, quotes.
  ```
- Other files in this repo (for example `app.html`, `elnviewer.html`) are left untouched and stay reachable at their URLs.
- Moved a page? Add `"/old/url/": "/new/url/"` to `content/redirects.json` and rebuild.
- `arcade/` is the old address of ChemGame. It now only redirects to `/chemgame/`, and you can delete it whenever you like.

## Notes

- Each app has its own service worker and cache. Installed apps update themselves after you push a new build.
- The phone number and street address from the CV are deliberately not on the public site.
