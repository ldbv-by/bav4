const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.URL || 'http://localhost:8080').replace(/\/$/, '');

test.describe('favicons', () => {
	test('should provide favicon related assets', async ({ request }) => {
		const responseIco = await request.get(`${BASE_URL}/assets/favicon.ico`);
		const responseManifest = await request.get(`${BASE_URL}/assets/manifest.json`);
		const responsePng192 = await request.get(`${BASE_URL}/assets/icon_192x192.png`);
		const responsePng512 = await request.get(`${BASE_URL}/assets/icon_512x512.png`);
		const responsePng512_maskable = await request.get(`${BASE_URL}/assets/icon_512x512_maskable.png`);

		expect(responseIco.ok()).toBe(true);
		expect(responseManifest.ok()).toBe(true);
		expect(responsePng192.ok()).toBe(true);
		expect(responsePng512.ok()).toBe(true);
		expect(responsePng512_maskable.ok()).toBe(true);
		expect(await responseManifest.json()).toEqual({
			icons: [
				{
					src: 'icon_512x512.png',
					sizes: '512x512',
					type: 'image/png',
					purpose: 'any'
				},
				{
					src: 'icon_192x192.png',
					sizes: '192x192',
					type: 'image/png',
					purpose: 'any'
				},
				{
					src: 'icon_512x512_maskable.png',
					sizes: '512x512',
					type: 'image/png',
					purpose: 'maskable'
				}
			],
			name: 'BayernAtlas',
			short_name: 'BayernAtlas',
			orientation: 'portrait',
			display: 'standalone',
			start_url: '/',
			background_color: '#2f6a94',
			theme_color: '#2f6a94'
		});
	});
});
