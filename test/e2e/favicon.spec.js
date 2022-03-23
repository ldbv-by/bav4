const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.URL || 'http://localhost:8080').replace(/\/$/, '');

test.describe('favicons', () => {

	test('should provide a favicon', async ({ request }) => {

		/**
		 * favicons-webpack-plugin generates in 'light' mode a favicon.svg only,
		 * whereas in 'webapp' mode the favicon.svg is missing
		 */
		const responseIco = await request.get(`${BASE_URL}/assets/favicon.ico`);
		const responseSvg = await request.get(`${BASE_URL}/assets/favicon.svg`);

		expect(responseIco.ok() || responseSvg.ok).toBeTruthy();
	});
});
