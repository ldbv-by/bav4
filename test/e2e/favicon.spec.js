const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.URL || 'http://localhost:8080').replace(/\/$/, '');

test.describe('favicons', () => {
	test('should provide favicon related assets', async ({ request }) => {
		const favicon96 = await request.get(`${BASE_URL}/assets/favicon-96x96.png`);
		const faviconSvg = await request.get(`${BASE_URL}/assets/favicon.svg`);
		const responseIco = await request.get(`${BASE_URL}/assets/favicon.ico`);
		const appleTouchIcon = await request.get(`${BASE_URL}/assets/apple-touch-icon.png`);

		const responsePng192 = await request.get(`${BASE_URL}/assets/web-app-manifest-192x192.png`);
		const responsePng512 = await request.get(`${BASE_URL}/assets/web-app-manifest-512x512.png`);
		const responseWebmanifest = await request.get(`${BASE_URL}/assets/site.webmanifest`);

		expect(favicon96.ok()).toBe(true);
		expect(faviconSvg.ok()).toBe(true);
		expect(responseIco.ok()).toBe(true);
		expect(appleTouchIcon.ok()).toBe(true);

		expect(responseWebmanifest.ok()).toBe(true);
		expect(responsePng192.ok()).toBe(true);
		expect(responsePng512.ok()).toBe(true);
		expect(await responseWebmanifest.json()).toEqual({
			name: 'BayernAtlas',
			short_name: 'BayernAtlas',
			icons: [
				{
					src: 'icon_192x192.png',
					sizes: '192x192',
					type: 'image/png'
				},
				{
					src: 'icon_512x512.png',
					sizes: '512x512',
					type: 'image/png'
				},
				{
					src: 'web-app-manifest-192x192.png',
					sizes: '192x192',
					type: 'image/png',
					purpose: 'maskable'
				},
				{
					src: 'web-app-manifest-512x512.png',
					sizes: '512x512',
					type: 'image/png',
					purpose: 'maskable'
				}
			],
			theme_color: '#2f6a94',
			background_color: '#2f6a94',
			display: 'standalone',
			start_url: '/'
		});
	});
});
