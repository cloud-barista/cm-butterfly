import { test, expect } from '@playwright/test';
import { getUser } from '../fixtures/test-data';
import { LoginPage } from '../pages/login.page';
import { ModelsPage } from '../pages/models.page';

/**
 * JSON editor, table view — the two ways of searching.
 *
 * Stepping keeps every row on screen and moves from match to match, which leaves
 * the neighbouring keys readable. Filtering drops everything else, which is the
 * shorter road when one name runs through the whole document and all of it has
 * to change.
 *
 * Both are checked here because they are easy to break in the same edit: the
 * filter shares its match list with the stepping, and the branches above a match
 * have to survive the filter or the rows lose their place in the document.
 *
 * Run:
 *   BASE_URL=http://cmig.dev.cscmzc.com \
 *   npx playwright test tests/e2e/specs/json-editor-search.spec.ts \
 *     --config=tests/e2e/playwright.runviewer.config.ts
 */

test.describe('JSON 에디터 표 — 검색과 필터', () => {
  test('@unit 검색은 일치 항목을 오가고, 필터를 켜면 일치한 행만 남는다', async ({
    page,
  }) => {
    test.setTimeout(300_000);

    const user = getUser('cmiguser');
    const login = new LoginPage(page);
    await login.goto();
    await login.login(user.id, user.password);
    await login.expectLoggedIn();

    await page.goto(ModelsPage.targetModelsPath);
    await page.waitForTimeout(3_000);
    await page.locator('tbody tr', { hasText: 'CloudModel' }).first().click();
    await page.waitForTimeout(2_500);
    await page.getByText('Custom & View Target Model').first().click();
    await page.waitForTimeout(3_500);

    await page.locator('.jse-menu button[title*="table" i]').first().click();
    await page.waitForTimeout(1_500);

    // The controls live in the editor's own menu, not in a row of their own.
    await page.locator('.jse-menu button[title^="Search"]').first().click();
    await page.waitForTimeout(800);

    const rows = page.locator('.property-grid .pg-row');
    const before = await rows.count();

    await page.getByTestId('json-grid-search-input').fill('name');
    await page.waitForTimeout(1_500);

    // Stepping leaves the document as it was and reports its position in it.
    expect(await rows.count()).toBe(before);
    expect(await page.locator('.pg-search-count').textContent()).toMatch(
      /^\d+ \/ \d+$/,
    );

    await page.getByTestId('json-grid-search-filter').click();
    await page.waitForTimeout(1_500);

    const filtered = await rows.count();
    expect(filtered).toBeLessThan(before);
    expect(await page.locator('.pg-search-count').textContent()).toMatch(
      /^\d+ rows$/,
    );
    // Nothing to step through when everything is already on screen.
    expect(await page.getByTestId('json-grid-search-prev').count()).toBe(0);

    // Every row left is either a match or a branch holding one.
    const strays = await rows.evaluateAll(list =>
      list
        .filter(r => !r.querySelector('.pg-type-badge'))
        .map(r => (r.textContent ?? '').toLowerCase())
        .filter(t => !t.includes('name')),
    );
    expect(strays).toEqual([]);

    await page.getByTestId('json-grid-search-filter').click();
    await page.waitForTimeout(1_200);
    expect(await rows.count()).toBe(before);
  });
});
