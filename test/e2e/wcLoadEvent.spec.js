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
			const aHandle = await page.evaluateHandle(() => window);
			const resultHandle = await page.evaluateHandle((window) => window.ba_wcLoaded, aHandle);

			expect(await resultHandle.jsonValue()).toBe(true);

			await resultHandle.dispose();
		});
	});
});
