import { provide } from '../../../../src/modules/map/i18n/mapInteractionButtonContainer.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_interaction_button_container_routing).toBe('Routing abschließen');
		expect(map.map_interaction_button_container_layerSwipe).toBe('Vergleichen beenden');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_interaction_button_container_routing).toBe('Complete routing');
		expect(map.map_interaction_button_container_layerSwipe).toBe('Exit comparison tool');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 2;
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
