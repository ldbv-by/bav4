const { test, expect } = require('@playwright/test');
const templateParameters = require(`../../src/assets/${process.env.DEFAULT_LANG || 'en'}.json`);
const BASE_URL = process.env.URL || 'http://localhost:8080';

test.describe('page', () => {

	test.beforeEach(async ({ page }) => {
		// Go to the starting url before each test.
		await page.goto(`${BASE_URL}`);

	});

	test.describe('when loaded', () => {

		test('should contain correct lang attribute', async ({ page }) => {
			const lang = await page.getAttribute('html', 'lang');

			expect(lang).toBe(templateParameters.lang);
		});

		test('should contain correct translate attribute', async ({ page }) => {
			expect(await page.$('html[translate=\'no\']')).toBeTruthy();
		});

		test('should contain google specific translate meta tag', async ({ page }) => {
			const content = await page.getAttribute('head > meta[name=\'google\']', 'content');

			expect(content).toContain('notranslate');
		});

		test('should contain a title tag', async ({ page }) => {
			const title = await page.title();

			expect(title).toBe(templateParameters.title);
		});

		test('should contain a viewport meta tag', async ({ page }) => {
			const content = await page.getAttribute('head > meta[name=\'viewport\']', 'content');

			expect(content).toContain('width=device-width');
			expect(content).toContain('initial-scale=1');
			expect(content).toContain('maximum-scale=1');
			expect(content).toContain('user-scalable=0');
		});

		test('should contain a charset meta tag', async ({ page }) => {
			expect(await page.$('head > meta[charset=\'utf-8\']')).toBeTruthy();
		});

		test('should contain a description meta tag', async ({ page }) => {
			const description = await page.getAttribute('head > meta[name=\'description\']', 'content');

			expect(description).toBe(templateParameters.description);
		});

		test('should contain a <ba-header> component', async ({ page }) => {
			expect(await page.$$('ba-header')).toHaveLength(1);
		});

		test('should contain a <ba-main-menu> component', async ({ page }) => {
			expect(await page.$$('ba-main-menu')).toHaveLength(1);
		});
		test('should contain a <ba-ol-map> component', async ({ page }) => {
			expect(await page.$$('ba-ol-map')).toHaveLength(1);
		});

		test('should contain a <ba-map-button-container> component', async ({ page }) => {
			expect(await page.$$('ba-map-button-container')).toHaveLength(1);
		});

		test('should contain a <ba-tool-bar> component', async ({ page }) => {
			expect(await page.$$('ba-tool-bar')).toHaveLength(1);
		});

		test('should contain a <ba-footer> component', async ({ page }) => {
			expect(await page.$$('ba-footer')).toHaveLength(1);
		});

		test('should contain a <ba-first-steps> component', async ({ page }) => {
			expect(await page.$$('ba-first-steps')).toHaveLength(1);
		});

		test('should contain a <ba-tool-container> component', async ({ page }) => {
			expect(await page.$$('ba-tool-container')).toHaveLength(1);
		});

		test('should contain a <ba-nonembedded-hint> component', async ({ page }) => {
			expect(await page.$$('ba-nonembedded-hint')).toHaveLength(1);
		});

		test('should contain a <ba-theme-provider> component', async ({ page }) => {
			expect(await page.$$('ba-theme-provider')).toHaveLength(1);
		});

		test('should contain a <ba-modal> component', async ({ page }) => {
			expect(await page.$$('ba-modal')).toHaveLength(1);
		});

		test('should contain a <ba-notification-panel> component', async ({ page }) => {
			expect(await page.$$('ba-notification-panel')).toHaveLength(1);
		});

		test('should contain a <ba-map-context-menu> component', async ({ page }) => {
			expect(await page.$$('ba-map-context-menu')).toHaveLength(1);
		});

		test('should contain a <ba-dnd-import-panel> component', async ({ page }) => {
			expect(await page.$$('ba-dnd-import-panel')).toHaveLength(1);
		});
	});
});
