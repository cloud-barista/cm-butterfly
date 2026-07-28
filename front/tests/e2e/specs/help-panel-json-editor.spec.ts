import { test, expect } from '@playwright/test';
import { getUser } from '../fixtures/test-data';
import { LoginPage } from '../pages/login.page';
import { ModelsPage } from '../pages/models.page';

/**
 * The JSON editor opens over the screen it belongs to, so the address does not
 * change and the help would otherwise describe the list behind it. Someone who
 * presses the help icon with the editor in front of them wants the editor.
 *
 * Run:
 *   BASE_URL=http://cmig.dev.cscmzc.com \
 *   npx playwright test tests/e2e/specs/help-panel-json-editor.spec.ts \
 *     --config=tests/e2e/playwright.runviewer.config.ts
 */
test.describe('도움말 — JSON 편집기가 열려 있을 때', () => {
  test('@unit 편집기가 열리면 편집기 설명이 먼저 나오고, 메뉴 설명은 접혀 있다', async ({
    page,
  }) => {
    test.setTimeout(300_000);

    const user = getUser('cmiguser');
    const login = new LoginPage(page);
    await login.goto();
    await login.login(user.id, user.password);
    await login.expectLoggedIn();

    const panel = page.getByTestId('help-panel');
    const groupTitles = () =>
      panel
        .locator('.help-group-title')
        .evaluateAll(hs => hs.map(h => (h.textContent ?? '').trim()));

    // the list screen, with no editor open
    await page.goto(
      ModelsPage.sourceModelsPath ?? '/main/models/source-models',
    );
    await page.waitForTimeout(3_000);
    await page.getByTestId('help-toggle').click();
    await page.waitForTimeout(1_200);

    const onList = await groupTitles();
    expect(onList[0]).toBe('Managing source models');
    await expect(page.getByTestId('help-more-toggle')).toHaveCount(0);
    await page.getByTestId('help-close').click();
    await page.waitForTimeout(500);

    // open a model as JSON - the label cell also reads "Custom & View", so
    // the link itself is what gets clicked
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(2_500);
    await page
      .getByText('Custom & View Source Model', { exact: true })
      .first()
      .click();
    await page.waitForTimeout(4_000);
    await expect(page.locator('.jse-main').first()).toBeVisible();

    await page.getByTestId('help-toggle').click();
    await page.waitForTimeout(1_500);

    // it answers the screen in front of you
    const opening = await panel.locator('.help-body p').first().textContent();
    expect(opening).toContain('source model in the JSON editor');
    expect(opening).toContain('creates a custom model');

    const withEditor = await groupTitles();
    expect(withEditor[0]).toBe('Using the editor');

    const sections = await panel
      .locator('.help-section .help-heading')
      .evaluateAll(hs => hs.map(h => (h.textContent ?? '').trim()));
    expect(sections).toContain('Filter or reshape an array');

    const guides = await panel
      .locator('button')
      .evaluateAll(bs =>
        bs
          .map(b => (b.textContent ?? '').replace(/\s+/g, ' ').trim())
          .filter(t => t.startsWith('Guide:')),
      );
    expect(guides[0]).toContain('Editing a model as JSON');

    // the menu underneath is folded away, and opens when asked
    const more = page.getByTestId('help-more-toggle');
    await expect(more).toBeVisible();
    expect(await groupTitles()).not.toContain('Managing source models');
    await more.click();
    await page.waitForTimeout(600);
    expect(await groupTitles()).toContain('Managing source models');

    // close the editor and the help goes back to the screen
    await page.getByTestId('help-close').click();
    await page.waitForTimeout(400);
    await page.goto(
      ModelsPage.sourceModelsPath ?? '/main/models/source-models',
    );
    await page.waitForTimeout(3_000);
    await page.getByTestId('help-toggle').click();
    await page.waitForTimeout(1_200);
    expect((await groupTitles())[0]).toBe('Managing source models');
  });
});
