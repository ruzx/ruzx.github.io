# ruzx.github.io

Personal site: profile, CV, blog, plus two installable web apps. No dependencies, only Node.

| URL | What | Source |
|---|---|---|
| `/` | Home: profile, apps, selected publications, latest posts | `content/profile.json` |
| `/cv/` | Full CV (Print / PDF button) | `content/profile.json` |
| `/blog/` | Blog + RSS (`/feed.xml`) | `content/posts/*.md` |
| `/chemedit/` | ChemEdit: structure editor + ELN (PWA) | prebuilt, from the `chemeditnew` repo |
| `/arcade/` | Molecule Arcade: chemistry puzzle games (PWA) | prebuilt, from the `chemeditnew` repo |

## Publish (first time)

1. Move `DEPLOY-pages.yml` to `.github/workflows/pages.yml`. This is the deploy workflow; it couldn't be written into a `.github` folder directly.
2. Copy everything in this folder into your `ruzx.github.io` repository and push to `main`:
   ```bash
   git clone https://github.com/ruzx/ruzx.github.io && cd ruzx.github.io
   # copy the contents of chemeditnew/site/ here (including the hidden .github and .gitignore)
   git add -A && git commit -m "Site: profile, CV, blog, ChemEdit, Molecule Arcade" && git push
   ```
3. On GitHub, open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. The *Deploy site* workflow builds and publishes on every push (watch it under the Actions tab). The site goes live at https://ruzx.github.io.

## Everyday editing

- **CV / home page:** edit `content/profile.json`.
  - Fields: summary, links, competencies, experience, education, publications, awards and apps.
  - Set `"selected": true` on publications that should appear on the home page.
  - To add a photo, put it at `assets/profile.jpg` and set `"photo": "/assets/profile.jpg"`.
- **New blog post:** add `content/posts/YYYY-MM-DD-some-slug.md`:
  ```markdown
  ---
  title: My post title
  date: 2026-12-01
  tags: [electrochemistry, teaching]
  summary: One sentence shown in the list (optional).
  draft: false
  ---
  Text in **Markdown**: headings, lists, links, images (put images in assets/), code, tables, quotes.
  ```
  You can do this directly on github.com ("Add file → Create new file"); the site rebuilds automatically.
- **Preview locally:** `npm run dev` → http://localhost:8080.
- **Update the apps:** in the `chemeditnew` repo, run `npm run site -- path/to/ruzx.github.io`. This rebuilds ChemEdit and Molecule Arcade, copies them into `chemedit/` and `arcade/`, and rebuilds the site. Then commit and push.

## Notes

- Each app has its own service worker and cache. Installed apps update themselves after you push a new build.
- The phone number and street address from the CV are deliberately left out of the public site. Add them in `profile.json` → `links` if you want them online.
