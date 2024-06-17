const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.URL || 'http://localhost:8080';

test.use({ bypassCSP: true });

test.describe('global properties', () => {
	test.describe('ba_enableTestIds property', () => {
		test.describe('when query parameter is not available', () => {
			test('property should be `false`', async ({ page, browserName }) => {
				test.skip(browserName === 'webkit', 'Webkit does not allow to access property when page contains CSP upgrade-insecure-request directive');
				await page.goto(`${BASE_URL}`);

				const aHandle = await page.evaluateHandle(() => window);
				const resultHandle = await page.evaluateHandle((window) => window.ba_enableTestIds, aHandle);

				expect(await resultHandle.jsonValue()).toBe(false);

				await resultHandle.dispose();
			});
		});

		test.describe('when query parameter has value of `true`', () => {
			test('property should be `true`', async ({ page, browserName }) => {
				test.skip(browserName === 'webkit', 'Webkit does not allow to access property when page contains CSP upgrade-insecure-request directive');
				await page.goto(`${BASE_URL}?t_enable-test-ids=true`);

				const aHandle = await page.evaluateHandle(() => window);
				const resultHandle = await page.evaluateHandle((window) => window.ba_enableTestIds, aHandle);

				expect(await resultHandle.jsonValue()).toBe(true);

				await resultHandle.dispose();
			});
		});

		test.describe('when query parameter has value of something else', () => {
			test('property should be `false`', async ({ page, browserName }) => {
				test.skip(browserName === 'webkit', 'Webkit does not allow to access property when page contains CSP upgrade-insecure-request directive');
				await page.goto(`${BASE_URL}?t_enable-test-ids=foo`);

				const aHandle = await page.evaluateHandle(() => window);
				const resultHandle = await page.evaluateHandle((window) => window.ba_enableTestIds, aHandle);

				expect(await resultHandle.jsonValue()).toBe(false);

				await resultHandle.dispose();
			});
		});
	});
});
