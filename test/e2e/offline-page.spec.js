const { test, expect } = require('@playwright/test');
const templateParameters = require(`../../src/assets/${process.env.DEFAULT_LANG || 'en'}.json`);
const BASE_URL = process.env.URL || 'http://localhost:8080';

test.describe('page', () => {

	test.beforeEach(async ({ page }) => {
		// Go to the starting url before each test.
		await page.goto(`${BASE_URL}/offline.html`);

	});

	test.describe('when loaded', () => {

		test('should contain correct lang attribute', async ({ page }) => {
			const lang = await page.getAttribute('html', 'lang');

			expect(lang).toBe(templateParameters.lang);
		});

		test('should contain favicon related link tag', async ({ page }) => {
			expect(await page.$('head > link[href=\'assets/favicon.ico\']')).toBeTruthy();
			expect(await page.$('head > link[href=\'assets/icon.svg\']')).toBeTruthy();
		});

		test('should contain theme-color meta tags', async ({ page }) => {
			expect(await page.getAttribute('head > meta[media=\'(prefers-color-scheme: light)\']', 'name')).toBe('theme-color');
			expect(await page.getAttribute('head > meta[media=\'(prefers-color-scheme: light)\']', 'content')).toBe('#2f6a94');
			expect(await page.getAttribute('head > meta[media=\'(prefers-color-scheme: dark)\']', 'name')).toBe('theme-color');
			expect(await page.getAttribute('head > meta[media=\'(prefers-color-scheme: dark)\']', 'content')).toBe('#2f6a94');
		});

		test('should contain correct translate attribute', async ({ page }) => {
			expect(await page.$('html[translate=\'no\']')).toBeTruthy();
		});

		test('should contain google specific translate meta tag', async ({ page }) => {
			const content = await page.getAttribute('head > meta[name=\'google\']', 'content');

			expect(content).toBe('notranslate');
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
	});
});
