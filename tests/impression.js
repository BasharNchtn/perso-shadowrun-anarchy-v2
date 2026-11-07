// Test d'impression : chaque exemple doit tenir en 2 pages A4.
// Usage : npm i @sparticuz/chromium puppeteer-core && node tests/impression.js   (nécessite pdfinfo : poppler-utils)
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');
// Exemples fictifs (tests/exemples/) et personnages privés facultatifs (tests/prives/, ignoré par git).
const FICHIERS = ['exemples', 'prives'].map(d => path.join(__dirname, d)).filter(d => fs.existsSync(d))
  .flatMap(d => fs.readdirSync(d).filter(x => x.endsWith('.json')).map(x => path.join(d, x)));
(async () => {
  const chromium = (await import('@sparticuz/chromium')).default;
  const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
  let echecs = 0;
  for (const f of FICHIERS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });
    await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} }); // copie locale vide à chaque page // au moins 1000 px : mise en page large
    await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
    const json = fs.readFileSync(f, 'utf8');
    await page.evaluate(t => { openText(t); showTab('fiche'); }, json);
    await page.evaluate(() => document.fonts.ready);
    const pdf = path.join(require('os').tmpdir(), path.basename(f) + '.pdf');
    await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
    const n = +/Pages:\s+(\d+)/.exec(execSync('pdfinfo ' + pdf).toString())[1];
    if (n !== 2) echecs++;
    console.log((n === 2 ? 'OK    ' : 'ÉCHEC ') + path.basename(f) + ' : ' + n + ' page(s)');
    await page.close();
  }
  // Impression groupée : toutes les fiches à la suite, 2 pages chacune
  {
    const fichiers = FICHIERS;
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });
    await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} }); // copie locale vide à chaque page
    await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
    for (const f of fichiers) await page.evaluate(t => openText(t), fs.readFileSync(f, 'utf8'));
    await page.evaluate(() => { showTab('fiche'); return document.fonts.ready; });
    await page.evaluate(() => prepAll());
    const pdf = path.join(require('os').tmpdir(), 'toutes.pdf');
    await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
    const n = +/Pages:\s+(\d+)/.exec(execSync('pdfinfo ' + pdf).toString())[1];
    if (n !== 2 * fichiers.length) echecs++;
    console.log((n === 2 * fichiers.length ? 'OK    ' : 'ÉCHEC ') + 'impression groupée : ' + n + ' pages pour ' + fichiers.length + ' fiches');
    await page.screenshot({ path: path.join(require('os').tmpdir(), 'comparer.png'), fullPage: false }).catch(() => {});
    await page.close();
  }
  await browser.close();
  process.exit(echecs ? 1 : 0);
})();
