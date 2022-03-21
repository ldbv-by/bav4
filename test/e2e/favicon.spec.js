const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.URL || 'http://localhost:8080').replace(/\/$/, '');

test.describe('favicons', () => {

	test('should provide a favicon', async ({ request }) => {

		const response = await request.get(`${BASE_URL}/assets/favicon.svg`);
		expect(response.ok()).toBeTruthy();
	});
});
