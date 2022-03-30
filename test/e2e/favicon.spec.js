const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.URL || 'http://localhost:8080').replace(/\/$/, '');

test.describe('favicons', () => {

	test('should provide favicon related assets', async ({ request }) => {

		const responseIco = await request.get(`${BASE_URL}/assets/favicon.ico`);
		const responseManifest = await request.get(`${BASE_URL}/assets/manifest.json`);
		const responsePng192 = await request.get(`${BASE_URL}/assets/icon_192x192.png`);
		const responsePng512 = await request.get(`${BASE_URL}/assets/icon_512x512.png`);

		expect(responseIco.ok()).toBeTruthy();
		expect(responseManifest.ok).toBeTruthy();
		expect(responsePng192.ok).toBeTruthy();
		expect(responsePng512.ok).toBeTruthy();
	});
});
