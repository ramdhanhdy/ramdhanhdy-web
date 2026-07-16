import { expect, test } from '@playwright/test';

async function expectDetailBody(page) {
  await expect(page.locator('.case-prose').locator('p, h2, h3').first()).toBeVisible();
}

async function transformOf(locator) {
  return locator.evaluate((element) => getComputedStyle(element).transform);
}

test('work overview renders the curtain, controls, and card stack', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#global-curtain')).toBeAttached();
  await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Index' })).toBeVisible();
  await expect(page.locator('.tunnel-card')).not.toHaveCount(0);
});

test('header navigation uses the curtain path between About and the work index', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('.text-char').first()).toBeVisible();

  await page.getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL(/\/?view=index$/);
  await expect(page.locator('a[href^="/work/"]').first()).toBeVisible();
});

test('work index preview and project detail render through their real anchor', async ({ page }) => {
  await page.goto('/?view=index');

  const projectLink = page.locator('a[href^="/work/"]').first();
  await expect(projectLink).toBeVisible();
  const projectHref = await projectLink.getAttribute('href');
  const preview = page.getByTestId('project-preview');

  await projectLink.hover();
  await expect.poll(async () => Number(await preview.evaluate((element) => getComputedStyle(element).opacity))).toBeGreaterThan(0.5);

  await projectLink.click();
  await expect(page).toHaveURL(new RegExp(`${projectHref}$`));
  await expectDetailBody(page);
});

test('blog list opens a rendered post body through its real anchor', async ({ page }) => {
  await page.goto('/blog');

  const postLink = page.locator('a[href^="/blog/"]').first();
  await expect(postLink).toBeVisible();
  const postHref = await postLink.getAttribute('href');

  await postLink.click();
  await expect(page).toHaveURL(new RegExp(`${postHref}$`));
  await expectDetailBody(page);
});

test('unknown detail slugs render the shared 404 page', async ({ page }) => {
  for (const route of ['/work/not-a-real-project', '/blog/not-a-real-post']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
    await expect(page.getByText('Nothing here', { exact: true })).toBeVisible();
  }
});

test('overview wheel traversal changes a card transform without document scrolling', async ({ page }) => {
  await page.goto('/');

  const card = page.locator('.tunnel-card').nth(1);
  await expect(card).toBeVisible();
  const initialTransform = await transformOf(card);

  await card.dispatchEvent('wheel', { deltaY: 240 });
  await expect.poll(() => transformOf(card)).not.toBe(initialTransform);
  await expect.poll(() => page.evaluate(() => document.scrollingElement.scrollTop)).toBe(0);
});

test('mobile touch layout keeps header controls and carousel within the viewport', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  await page.goto('/');
  for (const name of ['Work', 'About', 'Blog', 'Contact']) {
    await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('.tunnel-card').first()).toBeVisible();

  await context.close();
});
