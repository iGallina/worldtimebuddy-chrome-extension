// Functional check of every feature inside the extension popup frame (logged out, throwaway profile).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const EXT = require('path').resolve(__dirname, '..'), OUT = (process.env.OUT || require('os').tmpdir());
const EXE = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const extId = [...crypto.createHash('sha256').update(EXT).digest('hex').slice(0, 32)].map(c => String.fromCharCode(97 + parseInt(c, 16))).join('');
const results = [];
const check = (name, ok, extra = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${extra}`); };
(async () => {
  const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(OUT, 'p-')), { headless: false, executablePath: EXE,
    viewport: { width: 1059, height: 700 }, args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`] });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const open = async () => { await page.goto(`chrome-extension://${extId}/popup.html`);
    await page.waitForSelector('iframe[src]'); await page.addStyleTag({ content: 'html,body{width:1059px!important} iframe{zoom:1!important}' }); // real coords for clicks
    await page.waitForTimeout(5000); return page.frames().find(x => x.url().startsWith('https://www.worldtimebuddy.com/')); };
  const box = async (f, sel) => { const b = await (await f.$(sel)).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
  let f = await open();
  check('no page errors', errors.length === 0, errors.join(' | '));
  check('init completes', (await f.evaluate(() => document.querySelector('#defaultText').innerText)).includes('Place'));
  await page.mouse.click(...await box(f, '#defaultText')); await page.keyboard.type('Tokyo', { delay: 100 }); await page.waitForTimeout(1500);
  const sugg = await f.locator('.ac_results li:visible').count(); check('search suggestions', sugg > 0, `(${sugg})`);
  await page.screenshot({ path: `${OUT}/80-search.png` });
  await page.mouse.click(...await box(f, '.ac_results li')); await page.waitForTimeout(4000);
  f = page.frames().find(x => x.url().startsWith('https://www.worldtimebuddy.com/'));
  const cities = (await f.locator('.city b').allInnerTexts()).join('/'); check('add location keeps existing list', cities === 'London/Cairo/Moscow/Tokyo', cities);
  await page.mouse.click(...await box(f, '.datepicker_input')); await page.waitForTimeout(1000);
  const dp = await f.evaluate(() => [...document.querySelectorAll('div, table')].some(e => e.offsetParent && e.offsetHeight < 400 && /Su\s+Mo\s+Tu/.test(e.innerText)));
  check('date picker opens', dp); await page.screenshot({ path: `${OUT}/81-datepicker.png` });
  await page.keyboard.press('Escape');
  await page.mouse.click(...await box(f, '#st24')); await page.waitForTimeout(4000);
  f = page.frames().find(x => x.url().startsWith('https://www.worldtimebuddy.com/'));
  check('24h toggle', await f.evaluate(() => window.Input.get('ampm_mode')) === '0');
  await page.mouse.move(...await box(f, '#sd-activator')); await page.waitForTimeout(600);
  await page.mouse.click(...await box(f, '#bttn-wknd-switch')); await page.waitForTimeout(800);
  f = await open();
  check('settings persist after reopen', await f.evaluate(() => [Input.get('ampm_mode'), String(Input.get('weekends_mode'))].join()) === '0,1',
    await f.evaluate(() => [Input.get('ampm_mode'), Input.get('weekends_mode'), [...document.querySelectorAll('.city b')].map(e => e.innerText).join('/')].join(' ')));
  check('list persists after reopen', (await f.locator('.city b').allInnerTexts()).join('/') === 'London/Cairo/Moscow/Tokyo');
  check('no page errors after reopen', errors.length === 0, errors.join(' | '));
  await ctx.close();
  console.log(results.every(Boolean) ? 'ALL PASS' : 'SOME FAILED');
})();
