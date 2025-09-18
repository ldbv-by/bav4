const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env' });
const templateParameters = process.env.BACKEND_URL
	? require(`../../src/assets/${process.env.DEFAULT_LANG || 'en'}.json`)
	: require(`../../src/assets/standalone.json`);
const BASE_URL = process.env.URL || 'http://localhost:8080';
const ADMIN_PAGE_ACCESS_TOKEN = process.env.ADMIN_PAGE_ACCESS_TOKEN ?? '';

test.describe('admin page', () => {
	test.beforeEach(async ({ page }) => {
		// Go to the starting url before each test.
		// To avoid a redirect by our internal filters we append the corresponding query parameter
		await page.goto(`${BASE_URL}/admin.html?token${ADMIN_PAGE_ACCESS_TOKEN}`);
	});

	test.describe('when loaded', () => {
		test('html tag should contain correct attributes', async ({ page }) => {
			expect(await page.$(`html[lang='${templateParameters.lang}']`)).toBeTruthy();
			expect(await page.$("html[translate='no']")).toBeTruthy();
		});

		test('should contain one top level ba-components', async ({ page }) => {
			expect(await page.locator('body > *').count()).linttoBe(1);

			expect(await page.locator('ba-admin-ui').count()).toBe(1);
		});
	});
});
