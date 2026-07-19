import { expect, test, type Page } from '@playwright/test';

async function openCalculator(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'VA Math Machine', exact: true })).toBeVisible();
}

async function addRating(page: Page, percentage: number, label: string) {
  await page.getByLabel('Condition label (optional)', { exact: true }).fill(label);
  await page.getByLabel('Assigned rating', { exact: true }).selectOption(String(percentage));
  await page.getByRole('button', { name: 'Add rating' }).click();
}

test('calculates the canonical Table I sequence', async ({ page }) => {
  await openCalculator(page);
  await addRating(page, 90, 'First');
  await addRating(page, 30, 'Second');
  await addRating(page, 10, 'Third');
  await addRating(page, 10, 'Fourth');

  await expect(
    page.getByRole('region', { name: 'Estimated result' }).getByText('100%', { exact: true }),
  ).toBeVisible();
});

test('applies the bilateral factor before combining with other ratings', async ({ page }) => {
  await openCalculator(page);
  await page.getByLabel('Condition label (optional)', { exact: true }).fill('Left leg');
  await page.getByLabel('Assigned rating', { exact: true }).selectOption('10');
  await page.getByLabel('Category', { exact: true }).selectOption('lower');
  await page.getByLabel('Affected side', { exact: true }).selectOption('left');
  await page.getByRole('button', { name: 'Add rating' }).click();

  await page.getByLabel('Condition label (optional)', { exact: true }).fill('Right leg');
  await page.getByLabel('Affected side', { exact: true }).selectOption('right');
  await page.getByRole('button', { name: 'Add rating' }).click();

  await page.getByLabel('Condition label (optional)', { exact: true }).fill('Other');
  await page.getByLabel('Assigned rating', { exact: true }).selectOption('30');
  await page.getByLabel('Category', { exact: true }).selectOption('none');
  await page.getByRole('button', { name: 'Add rating' }).click();

  const result = page.getByRole('region', { name: 'Estimated result' });
  await expect(result.getByText('50%', { exact: true })).toBeVisible();
  await expect(result.getByText('Bilateral addition: 1.9%.', { exact: false })).toBeVisible();
});

test('keeps a sensitive input canary out of all requests and print paths', async ({ page }) => {
  const canary = 'PRIVATE-CANARY-9c9f24';
  const requests: string[] = [];
  page.on('request', (request) => {
    requests.push(`${request.url()} ${request.postData() ?? ''}`);
  });

  await openCalculator(page);
  await addRating(page, 30, canary);
  await page.evaluate(() => {
    window.print = () => undefined;
  });
  await page.getByRole('button', { name: 'Print or save as PDF' }).click();
  await page.getByRole('button', { name: 'Clear all' }).click();

  expect(requests.join('\n')).not.toContain(canary);
  await expect(page.getByText('No ratings added. No estimate is available.')).toBeVisible();
});

test('reflows at 320 CSS pixels without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openCalculator(page);

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

test('print media exposes the result and hides entry controls', async ({ page }) => {
  await openCalculator(page);
  await addRating(page, 50, 'Printable rating');
  await page.emulateMedia({ media: 'print' });

  await expect(page.getByRole('heading', { name: 'Estimated result' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add rating' })).toBeHidden();
  await expect(page.getByText(/Rates effective/)).toBeVisible();
});

test('has one primary landmark of each page type and no console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await openCalculator(page);

  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  expect(consoleErrors).toEqual([]);
});
