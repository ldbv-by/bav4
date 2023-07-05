const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.URL || 'http://localhost:8080').replace(/\/$/, '');

test.describe('entry points', () => {
	test('should provide the bundle.js', async ({ request }) => {
		const response = await request.get(`${BASE_URL}/bundle.js`);
		expect(response.ok()).toBeTruthy();
		expect((await response.body()).byteLength).toBeCloseTo(15209266, -3);
	});

	test('should provide the embed.js', async ({ request }) => {
		const response = await request.get(`${BASE_URL}/embed.js`);
		expect(response.ok()).toBeTruthy();
		expect((await response.body()).byteLength).toBeCloseTo(12364167, -3);
	});

	test('should provide the config.js', async ({ request }) => {
		const response = await request.get(`${BASE_URL}/config.js`);
		expect(response.ok()).toBeTruthy();
	});
});

test.describe('chunks', () => {
	test('should provide the ba-elevation.js', async ({ request }) => {
		const response = await request.get(`${BASE_URL}/elevation-profile.js`);
		expect(response.ok()).toBeTruthy();
	});
});
