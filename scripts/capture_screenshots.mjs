import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('docs/screenshots');
const BASE = 'http://127.0.0.1:8112';

async function ensureDir() {
  await fs.mkdir(OUT, { recursive: true });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function shot(page, name, opts = {}) {
  const file = path.join(OUT, name);
  await page.screenshot({ timeout: 120000, path: file, ...opts });
  return file;
}

async function safeLocatorShot(page, selector, name) {
  const loc = page.locator(selector).first();
  if (await loc.count()) {
    await loc.screenshot({ path: path.join(OUT, name) });
  }
}

async function run() {
  await ensureDir();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // 1) index page
  await page.goto(`${BASE}/#/index`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(6000);
  await shot(page, 'index_full.png', { fullPage: true });
  await safeLocatorShot(page, '.mapwrap', 'index_mapwrap.png');
  await safeLocatorShot(page, '.right-top-wrap', 'index_priority_panel.png');
  await safeLocatorShot(page, '.right_center_chart', 'index_ranking.png');

  const detailBtn = page.getByRole('button', { name: /展开详情|收起详情/ }).first();
  if (await detailBtn.count()) {
    await detailBtn.click();
    await sleep(1200);
    await safeLocatorShot(page, '.priority-detail-overlay', 'index_priority_detail.png');
  }

  const tuneBtn = page.getByRole('button', { name: /调参推演|收起面板/ }).first();
  if (await tuneBtn.count()) {
    await tuneBtn.click();
    await sleep(1200);
    await safeLocatorShot(page, '.tune-panel', 'index_tune_panel.png');
  }

  // 2) decision sandbox
  await page.goto(`${BASE}/#/decision-sandbox`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(4000);
  await shot(page, 'sandbox_full.png', { fullPage: true });
  await safeLocatorShot(page, '.map-stage', 'sandbox_map_stage.png');
  await safeLocatorShot(page, '.sandbox-right .panel-body', 'sandbox_result_panel.png');

  // 3) source catalog
  await page.goto(`${BASE}/source-catalog.html`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(1500);
  await shot(page, 'source_catalog.png', { fullPage: true });

  // 4) 3d showroom
  await page.goto(`${BASE}/3d-showroom.html`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(12000);
  // 3D 页面渲染开销较大，采用视口截图避免 fullPage 超时
  try {
    await shot(page, 'showroom_3d.png');
  } catch (e) {
    console.warn('showroom screenshot fallback failed:', e?.message || e);
  }

  // 5) video page
  await page.goto(`${BASE}/video-viewer.html`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(2000);
  await shot(page, 'video_viewer.png', { fullPage: true });

  await browser.close();
  console.log(`screenshots saved to: ${OUT}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
