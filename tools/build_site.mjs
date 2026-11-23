// בונה את האתר: מקמפל את src/app.jsx ל-app.js, ומפיק לכל עמוד קובץ HTML
// עם הטקסט כבר בתוכו (כדי שגוגל יקרא אותו), כותרת ותיאור משלו, sitemap.xml ו-robots.txt.
//
// הרצה:  cd tools && npm install && npm run build
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import babel from '@babel/core';

const require = createRequire(import.meta.url);
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://shirathaguf.netlify.app';
const OG_IMAGE = `${SITE}/images/og-image.jpg`;
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), s); };

// ---- 1. קומפילציה ----
const source = read('src/app.jsx');
const { code } = babel.transformSync(source, {
  presets: [['@babel/preset-react', { runtime: 'classic' }]],
  babelrc: false, configFile: false, compact: false, comments: true,
});
const appJs = `/* נוצר אוטומטית מ-src/app.jsx על ידי tools/build_site.mjs – לא לערוך ידנית */\n${code}\n`;
write('app.js', appJs);
const VERSION = crypto.createHash('sha1').update(appJs).digest('hex').slice(0, 10);

// ---- 2. הרצה בשרת להפקת HTML ----
const ctx = vm.createContext({ React, ReactDOM: {}, console, __SSR__: true });
vm.runInContext(code, ctx, { filename: 'app.js' });
const { App } = ctx.__APP__;
const render = (route, pageData) => ReactDOMServer.renderToString(React.createElement(App, { route, pageData }));

// ---- 3. נתוני הספרון ----
const booklet = JSON.parse(read('booklet.json'));
const PART_PATHS = { guf: '/shirat-haguf/', nishmat: '/nishmat-kol-chai/', briah: '/shirat-habriah/', tikun: '/tikun-hanefesh/' };
const dataFor = (partId) => ({
  parts: booklet.parts.map((p) => p.id === partId
    ? p
    : { ...p, blocks: p.blocks.filter((b) => b.name).map((b) => ({ id: b.id, name: b.name })) }),
});

// ---- 4. העמודים ----
const breadcrumb = (name, url) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'שירת הגוף', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name, item: url },
  ],
});
const website = { '@type': 'WebSite', name: 'שירת הגוף', alternateName: 'Shirat Haguf', url: `${SITE}/`, inLanguage: 'he' };
const textPage = (name, url, description) => [
  { '@type': 'CreativeWork', name, url, description, inLanguage: 'he', isPartOf: website, image: OG_IMAGE },
  breadcrumb(name, url),
];

const pages = [
  {
    file: 'index.html', path: '/', route: { view: 'home' },
    title: 'שירת הגוף – פרק שירה לאברי הגוף',
    description: 'פרק שירה לאברי הגוף: כל אבר בגוף משורר לבורא בפסוקים מן המקורות. לקריאה מלאה עם ניקוד, לעיון בספרון ולפרקי תרגול ומחשבה.',
    jsonld: (url, d) => [{ ...website, description: d }],
  },
  {
    file: 'shirat-haguf/index.html', path: PART_PATHS.guf, route: { view: 'song', part: 'guf' }, data: dataFor('guf'),
    title: 'שירת הגוף – הנוסח המלא של פרק שירה לאברי הגוף',
    description: 'ראש, מח, עין, לב, ידיים ורגליים – כל אבר בגוף ופסוקי השירה שלו. הנוסח המלא של שירת הגוף, עם ניקוד וטעמים, לקריאה ולהקשבה לגוף.',
    jsonld: (url, d) => textPage('שירת הגוף', url, d),
  },
  {
    file: 'nishmat-kol-chai/index.html', path: PART_PATHS.nishmat, route: { view: 'song', part: 'nishmat' }, data: dataFor('nishmat'),
    title: 'נשמת כל חי – נוסח מנוקד | שירת הגוף',
    description: 'נשמת כל חי תברך את שמך: נוסח התפילה המלא והמנוקד, כפי שהוא מופיע בספרון שירת הגוף.',
    jsonld: (url, d) => textPage('נשמת כל חי', url, d),
  },
  {
    file: 'shirat-habriah/index.html', path: PART_PATHS.briah, route: { view: 'song', part: 'briah' }, data: dataFor('briah'),
    title: 'פרק שירה – שירת הבריאה, הנוסח המלא והמנוקד | שירת הגוף',
    description: 'פרק שירה המלא: ההקדמה וששת הפרקים, מן השמים והארץ ועד בעלי החיים – כל בריה והפסוק שהיא אומרת, בנוסח מנוקד עם מקורות.',
    jsonld: (url, d) => textPage('פרק שירה – שירת הבריאה', url, d),
  },
  {
    file: 'tikun-hanefesh/index.html', path: PART_PATHS.tikun, route: { view: 'song', part: 'tikun' }, data: dataFor('tikun'),
    title: 'תיקון הנפש – סדר תיקון הנפש מספר שערי ציון | שירת הגוף',
    description: 'סדר תיקון הנפש מספר שערי ציון: כוונות לאברי הגוף כמרכבה לשכינה, ראש, מוח, לב, ידיים ורגליים ושמות הקודש שכנגדם.',
    jsonld: (url, d) => textPage('תיקון הנפש', url, d),
  },
  {
    file: 'tirgul/index.html', path: '/tirgul/', route: { view: 'practice' },
    title: 'פרקי תרגול ומחשבה – הקשבה לגוף | שירת הגוף',
    description: 'מי אני ומה היחס שלי לגוף שלי? תרגילי השקטה והקשבה לגוף ולאברים, צלם אלוהים, ובין שירת הגוף לשירת הבריאה – פרקי תרגול ומחשבה.',
    jsonld: (url, d) => [{ '@type': 'WebPage', name: 'פרקי תרגול ומחשבה', url, description: d, inLanguage: 'he', isPartOf: website }, breadcrumb('פרקי תרגול ומחשבה', url)],
  },
  {
    file: 'odot/index.html', path: '/odot/', route: { view: 'about' },
    title: 'אודות | שירת הגוף',
    description: 'אודות המיזם שירת הגוף – בית דיגיטלי לטקסטים "שירת הגוף" ו"פרקי תרגול ומחשבה", ויצירת קשר.',
    jsonld: (url, d) => [{ '@type': 'AboutPage', name: 'אודות', url, description: d, inLanguage: 'he', isPartOf: website }, breadcrumb('אודות', url)],
  },
];

// ---- 5. כתיבת הקבצים ----
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const safeJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const template = read('src/template.html');

for (const p of pages) {
  const url = `${SITE}${p.path}`;
  const meta = [
    `<title>${esc(p.title)}</title>`,
    `<meta name="description" content="${esc(p.description)}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="he_IL">',
    '<meta property="og:site_name" content="שירת הגוף">',
    `<meta property="og:title" content="${esc(p.title)}">`,
    `<meta property="og:description" content="${esc(p.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="הלוגו של שירת הגוף: שתי דמויות סביב הכיתוב שירת הגוף">',
    '<meta name="twitter:card" content="summary_large_image">',
  ].map((l) => `    ${l}`).join('\n');
  const jsonld = `<script type="application/ld+json">${safeJson({ '@context': 'https://schema.org', '@graph': p.jsonld(url, p.description) })}</script>`;
  const html = template
    .replace('{{META}}', meta)
    .replace('{{JSONLD}}', jsonld)
    .replace('{{SSR}}', render(p.route, p.data || null))
    .replace('{{PAGE_DATA}}', p.data ? `<script>window.__PAGE_DATA__ = ${safeJson(p.data)};</script>` : '')
    .replace('{{ROUTE}}', safeJson(p.route))
    .replace('{{VERSION}}', VERSION);
  if (/\{\{[A-Z_]+\}\}/.test(html)) throw new Error(`placeholder left in ${p.file}`);
  write(p.file, html);
  console.log(`${p.file.padEnd(30)} ${(html.length / 1024).toFixed(0)}KB`);
}

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE}/sitemap.xml
`);
console.log('app.js', `${(appJs.length / 1024).toFixed(0)}KB`, 'v=' + VERSION, '| sitemap.xml, robots.txt');
