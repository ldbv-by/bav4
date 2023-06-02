const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env' });
const templateParameters = process.env.BACKEND_URL
	? require(`../../src/assets/${process.env.DEFAULT_LANG || 'en'}.json`)
	: require(`../../src/assets/standalone.json`);
const BASE_URL = process.env.URL || 'http://localhost:8080';

test.describe('embed page', () => {
	test.beforeEach(async ({ page }) => {
		// Go to the starting url before each test.
		await page.goto(`${BASE_URL}/embed/wrapper`);
	});

	test.describe('when loaded', () => {
		test('html tag should contain correct attributes', async ({ page }) => {
			expect(await page.frameLocator('#wrapper').locator(`html[lang='${templateParameters.lang}']`)).toBeTruthy();
			expect(await page.frameLocator('#wrapper').locator("html[translate='no']")).toBeTruthy();
		});

		test('should contain 10 top level ba-components', async ({ page }) => {
			// Get frame using the frame's name attribute
			expect(await page.frameLocator('#wrapper').locator('body > *').count()).toBe(11);

			expect(await page.frameLocator('#wrapper').locator('ba-ol-map').count()).toBe(1);
			expect(await page.frameLocator('#wrapper').locator('ba-view-larger-map-chip').count()).toBe(1);
			expect(await page.frameLocator('#wrapper').locator('ba-draw-tool').count()).toBe(1);
			expect(await page.frameLocator('#wrapper').locator('ba-map-button-container').count()).toBe(1);
			expect(await page.frameLocator('#wrapper').locator('ba-footer').count()).toBe(1);
			expect(await page.frameLocator('#wrapper').locator('ba-nonembedded-hint').count()).toBe(1);
			expect(await page.frameLocator('#wrapper').locator('ba-theme-provider').count()).toBe(1);
			expect(await page.frameLocator('#wrapper').locator('ba-notification-panel').count()).toBe(1);
			expect(await page.frameLocator('#wrapper').locator('ba-map-context-menu').count()).toBe(1);
			expect(await page.frameLocator('#wrapper').locator('ba-activate-map-button').count()).toBe(1);
			expect(await page.frameLocator('#wrapper').locator('ba-iframe-container').count()).toBe(1);
		});
	});
});
