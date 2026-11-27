#!/usr/bin/env node
// Horizone build script. No dependencies, just Node.
//
//   node build.js            build the site into ./dist
//   node build.js --watch    build, then rebuild whenever a file changes
//
// You keep editing the neat source folders. The build writes a copy of the site to dist/ where each page loads
// ONE stylesheet and ONE script instead of ~30 CSS files and ~15 JS files:
//
//   - The files a page loads are read from the page's own <link> and <script src> tags, in the order they appear,
//     so the script order you set in the HTML (it matters, see README) is kept exactly.
//   - CSS: every @import in main.css is inlined, then the page's own css is added after it.
//   - JS: the files are joined in order into one file. They were already sharing one global scope, so nothing changes.
//   - Each bundle gets a short content hash in its URL (bundle-home.js?v=1a2b3c4d), so browsers always fetch the
//     new file after you rebuild and keep the cached copy when nothing changed.
//   - Anything that is not a .css or .js file inside assets/ (images, fonts) is copied as it is.
//   - Pages that start with "_" (like _page-template.html) are not built.
//
// Upload the contents of dist/ to your host. Do not edit dist/ by hand: it is deleted and rebuilt every time.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const SKIP_DIRS = new Set(['dist', 'node_modules', '.git']);

const read = f => fs.readFileSync(f, 'utf8');
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const isLocal = u => u && !/^([a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(u);
const fail = msg => { throw new Error(msg); };

// ---------- CSS ----------
// Inlines @import "x.css" recursively. Relative url() paths are rewritten so they still point at the same file
// after the css moves into the bundle (today every url() is an inline data: image, so this is future-proofing).
function cssFile(file, outDir, seen = []) {
  if (seen.includes(file)) fail(`CSS @import loop: ${[...seen, file].map(rel).join(' -> ')}`);
  if (!fs.existsSync(file)) fail(`CSS file not found: ${rel(file)}`);
  const dir = path.dirname(file);
  let css = read(file);
  css = css.replace(/@import\s+(?:url\(\s*)?["']?([^"')\s]+)["']?\s*\)?\s*;/g, (m, target) => {
    if (!isLocal(target)) return m;                    // an external @import (e.g. fonts) stays as it is
    return cssFile(path.resolve(dir, target), outDir, [...seen, file]);
  });
  css = css.replace(/url\(\s*(["']?)([^)"']+)\1\s*\)/g, (m, q, u) => {
    if (!isLocal(u) || u.startsWith('data:')) return m;
    const fixed = path.relative(outDir, path.resolve(dir, u)).split(path.sep).join('/');
    return `url(${q}${fixed}${q})`;
  });
  return `/* ---- ${rel(file)} ---- */\n${css.trim()}\n`;
}

// ---------- JS ----------
function jsFile(file) {
  if (!fs.existsSync(file)) fail(`Script not found: ${rel(file)}`);
  // "\n;\n" after each file: a file that ends without a semicolon can never merge with the next one
  return `/* ---- ${rel(file)} ---- */\n${read(file).trim()}\n;\n`;
}

// ---------- HTML ----------
// Comments are hidden while we look for tags, so commented-out <script> lines (see _page-template.html) are ignored.
function build() {
  const t0 = Date.now();
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'assets', 'css'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'assets', 'js'), { recursive: true });

  const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !f.startsWith('_')).sort();
  const rows = [];

  for (const file of pages) {
    const name = file.replace(/\.html$/, '');
    let html = read(path.join(ROOT, file));
    const comments = [];
    html = html.replace(/<!--[\s\S]*?-->/g, c => `\u0000C${comments.push(c) - 1}\u0000`);

    const linkRe = /[ \t]*<link\b[^>]*>[ \t]*\n?/gi;
    const scriptRe = /[ \t]*<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>\s*<\/script>[ \t]*\n?/gi;
    const attr = (tag, a) => (tag.match(new RegExp(`\\b${a}\\s*=\\s*["']([^"']*)["']`, 'i')) || [])[1];

    // collect the local stylesheets and scripts of this page, in order
    const css = [], js = [];
    for (const m of html.matchAll(linkRe)) {
      if (/stylesheet/i.test(attr(m[0], 'rel') || '') && isLocal(attr(m[0], 'href'))) css.push({ at: m.index, len: m[0].length, src: attr(m[0], 'href') });
    }
    for (const m of html.matchAll(scriptRe)) if (isLocal(m[1])) js.push({ at: m.index, len: m[0].length, src: m[1] });

    // a script that is not bundled (inline or from another site) sitting between bundled ones would change order
    if (js.length) {
      const first = js[0].at, last = js[js.length - 1].at;
      for (const m of html.matchAll(/<script\b[^>]*>/gi)) {
        const src = attr(m[0], 'src');
        if (!isLocal(src) && m.index > first && m.index < last) console.warn(`  ! ${file}: an inline or external <script> sits between bundled scripts; it will now run after all of them`);
      }
    }

    const cssOut = path.join(OUT, 'assets', 'css'), jsOut = path.join(OUT, 'assets', 'js');
    let cssHref = null, jsSrc = null;
    if (css.length) {
      const text = css.map(c => cssFile(path.resolve(ROOT, c.src), cssOut)).join('\n');
      const out = `bundle-${name}.css`;
      fs.writeFileSync(path.join(cssOut, out), text);
      cssHref = `assets/css/${out}?v=${hash(text)}`;
    }
    if (js.length) {
      const text = js.map(s => jsFile(path.resolve(ROOT, s.src))).join('\n');
      const out = `bundle-${name}.js`;
      fs.writeFileSync(path.join(jsOut, out), text);
      jsSrc = `assets/js/${out}?v=${hash(text)}`;
    }

    // rewrite the HTML: the first local tag becomes the bundle, the other local tags are removed (work from the end)
    const edits = [
      ...css.map((c, i) => ({ ...c, put: i === 0 ? `<link rel="stylesheet" href="${cssHref}">\n` : '' })),
      ...js.map((s, i) => ({ ...s, put: i === 0 ? `<script src="${jsSrc}"></script>\n` : '' })),
    ].sort((a, b) => b.at - a.at);
    for (const e of edits) html = html.slice(0, e.at) + e.put + html.slice(e.at + e.len);

    html = html.replace(/\u0000C(\d+)\u0000/g, (_, i) => comments[i]);
    fs.writeFileSync(path.join(OUT, file), html);
    rows.push([file, css.length + js.length, (cssHref ? 1 : 0) + (jsSrc ? 1 : 0)]);
  }

  // everything in assets/ that is not css or js (images, fonts, ...) is copied unchanged
  const copyStatic = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const from = path.join(dir, e.name);
      if (e.isDirectory()) copyStatic(from);
      else if (!/\.(css|js)$/i.test(e.name)) {
        const to = path.join(OUT, path.relative(ROOT, from));
        fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to);
      }
    }
  };
  if (fs.existsSync(path.join(ROOT, 'assets'))) copyStatic(path.join(ROOT, 'assets'));

  const pad = (s, n) => String(s).padEnd(n);
  console.log(`\n${pad('page', 16)}${pad('files before', 14)}files after`);
  for (const [f, a, b] of rows) console.log(`${pad(f, 16)}${pad(a, 14)}${b}`);
  const total = rows.reduce((n, r) => n + r[1], 0), after = rows.reduce((n, r) => n + r[2], 0);
  console.log(`\nBuilt ${rows.length} pages into dist/ in ${Date.now() - t0} ms (${total} source files loaded -> ${after} bundles).`);
}

function run() {
  try { build(); } catch (e) { console.error('\nBuild failed: ' + e.message); if (!watching) process.exit(1); }
}

// ---------- watch mode ----------
let watching = false;
if (process.argv.includes('--watch')) {
  watching = true;
  run();
  let timer = null;
  const again = () => { clearTimeout(timer); timer = setTimeout(run, 150); };   // a save can fire several events
  const watchDir = dir => {
    fs.watch(dir, (ev, name) => {
      if (name && /\.(css|js|html)$/i.test(name)) again();   // dist/ is not watched, so a rebuild never triggers itself
    });
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory() && !SKIP_DIRS.has(e.name)) watchDir(path.join(dir, e.name));
    }
  };
  watchDir(ROOT);
  console.log('Watching for changes. Press Ctrl+C to stop.');
} else run();
