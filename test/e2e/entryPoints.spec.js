const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.URL || 'http://localhost:8080').replace(/\/$/, '');

test.describe('entry points', () => {

	test('should provide a main.js', async ({ request }) => {

		const response = await request.get(`${BASE_URL}/main.js`);
		expect(response.ok()).toBeTruthy();
	});

	test('should provide a config.js', async ({ request }) => {

		const response = await request.get(`${BASE_URL}/config.js`);
		expect(response.ok()).toBeTruthy();
	});

	test('should provide a sw.js', async ({ request }) => {

		const response = await request.get(`${BASE_URL}/sw.js`);
		expect(response.ok()).toBeTruthy();
	});

	test('should provide a offline.js', async ({ request }) => {

		const response = await request.get(`${BASE_URL}/offline.js`);
		expect(response.ok()).toBeTruthy();
	});
});
