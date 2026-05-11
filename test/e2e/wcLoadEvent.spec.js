const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env' });
const BASE_URL = process.env.URL || 'http://localhost:8080';

test.describe('wc.js', () => {
	test.beforeEach(async ({ page }) => {
		// Go to the starting url before each test.
		await page.goto(`${BASE_URL}/wc/wrapper`);
	});

	test.describe('when loaded', () => {
		test('it should fire a "ba-load" event', async ({ page }) => {
			const elementThatEmits = page.locator('bayern-atlas').first();

			// add listener for custom event
			await elementThatEmits.evaluate((el) => {
				// evaluate runs code inside the browser
				el.addEventListener('ba-load', () => {
					window.ba_wcLoaded = true;
				});
			});

			// await custom event
			const res = await page.waitForFunction(
				() => {
					// executed in browser
					// will return when value is truth OR when timeout occurs
					return window.ba_wcLoaded;
				},
				{ timeout: 1000 * 10 }
			);

			// `true` if successful
			expect(await res.jsonValue()).toBe(true);
		});
	});
});
