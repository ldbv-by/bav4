const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.URL || 'http://localhost:8080';

test.describe('global properties', () => {

	test.describe('baGenerateTestIds', () => {

		test.describe('when query parameter is not available', () => {
			test('should be set to `false`', async ({ page }) => {
				await page.goto(`${BASE_URL}`);

				const aHandle = await page.evaluateHandle(() => window);
				const resultHandle = await page.evaluateHandle(window => window.baGenerateTestIds, aHandle);

				expect(await resultHandle.jsonValue()).toBe(false);

				await resultHandle.dispose();
			});
		});

		test.describe('when query parameter has value of true', () => {
			test('should be set to `false`', async ({ page }) => {
				await page.goto(`${BASE_URL}?generate_test_ids=true`);

				const aHandle = await page.evaluateHandle(() => window);
				const resultHandle = await page.evaluateHandle(window => window.baGenerateTestIds, aHandle);

				expect(await resultHandle.jsonValue()).toBe(true);

				await resultHandle.dispose();
			});
		});

		test.describe('when query parameter has value of something else', () => {
			test('should be set `true`', async ({ page }) => {
				await page.goto(`${BASE_URL}?generate_test_ids=foo`);

				const aHandle = await page.evaluateHandle(() => window);
				const resultHandle = await page.evaluateHandle(window => window.baGenerateTestIds, aHandle);

				expect(await resultHandle.jsonValue()).toBe(false);

				await resultHandle.dispose();
			});
		});
	});
});
