import { provide } from '@src/modules/map/i18n/zoomButtons.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_interaction_button_container_fullscreen_on).toBe('Vollbild starten');
		expect(map.map_interaction_button_container_fullscreen_off).toBe('Vollbild beenden');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_interaction_button_container_fullscreen_on).toBe('Start fullscreen');
		expect(map.map_interaction_button_container_fullscreen_off).toBe('Exit fullscreen');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 3;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {
		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
