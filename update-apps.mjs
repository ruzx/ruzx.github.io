// npm run site — rebuild ChemEdit + Molecule Arcade from the chemeditnew repo, copy them here and rebuild the pages.
// Finds chemeditnew automatically; or set CHEMEDIT_DIR=path\to\chemeditnew.
import { existsSync } from "fs";
import { execFileSync } from "child_process";
import { join, dirname, resolve } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";
const here = dirname(fileURLToPath(import.meta.url));
const candidates = [process.env.CHEMEDIT_DIR, join(here, "..", "chemeditnew"), join(homedir(), "projectstest", "chemeditnew"), join(homedir(), "Documents", "GitHub", "chemeditnew"), join(homedir(), "chemeditnew")].filter(Boolean).map((p) => resolve(p));
const src = candidates.find((p) => existsSync(join(p, "tools", "publish-site.mjs")));
if (!src) {
  console.error("Could not find the chemeditnew folder. Looked in:\n  " + candidates.join("\n  ") + "\nSet CHEMEDIT_DIR, e.g.  set CHEMEDIT_DIR=C:\\path\\to\\chemeditnew && npm run site");
  process.exit(1);
}
console.log("Using apps from " + src);
execFileSync(process.execPath, [join(src, "tools", "publish-site.mjs"), here], { stdio: "inherit" });
