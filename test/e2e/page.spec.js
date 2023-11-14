const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env' });
const templateParameters = process.env.BACKEND_URL
	? require(`../../src/assets/${process.env.DEFAULT_LANG || 'en'}.json`)
	: require(`../../src/assets/standalone.json`);
const BASE_URL = process.env.URL || 'http://localhost:8080';

test.describe('page', () => {
	test.beforeEach(async ({ page }) => {
		// Go to the starting url before each test.
		await page.goto(`${BASE_URL}`);
	});

	test.describe('when loaded', () => {
		test('html tag should contain correct attributes', async ({ page }) => {
			expect(await page.$(`html[lang='${templateParameters.lang}']`)).toBeTruthy();
			expect(await page.$("html[translate='no']")).toBeTruthy();
		});

		test('should contain favicon related link tag', async ({ page }) => {
			expect(await page.$("head > link[href='assets/favicon.ico']")).toBeTruthy();
			expect(await page.$("head > link[href='assets/manifest.json']")).toBeTruthy();
			expect(await page.$("head > link[href='assets/icon.svg']")).toBeTruthy();
			expect(await page.$("head > link[href='assets/apple-touch-icon.png']")).toBeTruthy();
		});

		test('should contain theme-color meta tags', async ({ page }) => {
			expect(await page.getAttribute("head > meta[media='(prefers-color-scheme: light)']", 'name')).toBe('theme-color');
			expect(await page.getAttribute("head > meta[media='(prefers-color-scheme: light)']", 'content')).toBe('#fcfdfd');
			expect(await page.getAttribute("head > meta[media='(prefers-color-scheme: dark)']", 'name')).toBe('theme-color');
			expect(await page.getAttribute("head > meta[media='(prefers-color-scheme: dark)']", 'content')).toBe('#2e3538');
		});

		test('should contain google specific translate meta tag', async ({ page }) => {
			const content = await page.getAttribute("head > meta[name='google']", 'content');

			expect(content).toBe('notranslate');
		});

		test('should contain a title tag', async ({ page }) => {
			const title = await page.title();

			expect(title).toBe(templateParameters.title);
		});

		test('should contain a viewport meta tag', async ({ page }) => {
			const content = await page.getAttribute("head > meta[name='viewport']", 'content');

			expect(content).toContain('width=device-width');
			expect(content).toContain('initial-scale=1');
			expect(content).toContain('maximum-scale=1');
			expect(content).toContain('user-scalable=0');
		});

		test('should contain a charset meta tag', async ({ page }) => {
			expect(await page.$("head > meta[charset='utf-8']")).toBeTruthy();
		});

		test('should contain a description meta tag', async ({ page }) => {
			const description = await page.getAttribute("head > meta[name='description']", 'content');

			expect(description).toBe(templateParameters.description);
		});

		test('should contain 1 top level ba-components', async ({ page }) => {
			expect(await page.locator('body > *').count()).toBe(1);

			expect(await page.locator('ba-adminpanel').count()).toBe(1);
		});
	});
});
