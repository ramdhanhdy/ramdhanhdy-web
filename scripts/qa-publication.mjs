import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4174';
const output = fileURLToPath(new URL('../test-results/publication-qa/', import.meta.url));
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const target of [
  { name: 'article-desktop', path: '/blog/when-similar-benchmarks-hide-different-reasoning', viewport: { width: 1440, height: 1000 } },
  { name: 'article-mobile', path: '/blog/when-similar-benchmarks-hide-different-reasoning', viewport: { width: 390, height: 844 } },
  { name: 'project-desktop', path: '/work/glmsbench', viewport: { width: 1440, height: 1000 } },
  { name: 'project-mobile', path: '/work/glmsbench', viewport: { width: 390, height: 844 } },
]) {
  const context = await browser.newContext({ viewport: target.viewport, colorScheme: 'dark' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto(`${base}${target.path}`, { waitUntil: 'networkidle' });
  await page.locator('article').waitFor({ state: 'visible' });

  const metrics = await page.evaluate(() => {
    const article = document.querySelector('article');
    const scroller = article?.parentElement;
    const images = [...document.querySelectorAll('article img')];
    const links = [...document.querySelectorAll('article a')];
    const table = document.querySelector('article table');
    return {
      title: document.querySelector('article h1')?.textContent?.trim(),
      statusText: document.body.textContent?.includes('Page not found') ? 'not-found' : 'ok',
      images: images.map((image) => ({
        src: image.getAttribute('src'),
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        renderedWidth: Math.round(image.getBoundingClientRect().width),
      })),
      links: links.map((link) => ({ href: link.getAttribute('href'), text: link.textContent?.trim() })),
      viewportWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      articleWidth: article ? Math.round(article.getBoundingClientRect().width) : null,
      scrollerClientWidth: scroller?.clientWidth ?? null,
      scrollerScrollWidth: scroller?.scrollWidth ?? null,
      scrollerScrollHeight: scroller?.scrollHeight ?? null,
      tableWidth: table ? Math.round(table.getBoundingClientRect().width) : null,
    };
  });

  await page.screenshot({ path: path.join(output, `${target.name}-top.png`), fullPage: false });

  const sectionNames = target.name.startsWith('article')
    ? ['The benchmark looked simple', 'A second harness changed the story', 'Did long reasoning come first, or did recurrence keep the trace going?', 'What I think the evidence supports']
    : ['Main run', 'Output-length inference', 'Follow-up analysis'];

  for (const [index, sectionName] of sectionNames.entries()) {
    const heading = page.getByRole('heading', { name: sectionName, exact: true });
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(output, `${target.name}-section-${index + 1}.png`), fullPage: false });
  }

  if (target.name === 'article-mobile') {
    const figures = page.locator('article img');
    for (let index = 0; index < await figures.count(); index += 1) {
      await figures.nth(index).screenshot({ path: path.join(output, `article-mobile-figure-${index + 1}.png`) });
    }
  }

  results.push({
    name: target.name,
    status: response?.status(),
    consoleErrors,
    pageErrors,
    ...metrics,
  });
  await context.close();
}

await browser.close();
await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
