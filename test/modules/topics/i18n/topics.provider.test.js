import { provide } from '../../../../src/modules/topics/i18n/topics.provider';

describe('i18n for topics module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.topics_menu_title).toBe('Themen');
		expect(map.topics_catalog_panel_change_topic).toBe('Thema wechseln');
		expect(map.topics_catalog_leaf_no_georesource_title).toBe('Ebene nicht verfügbar');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.topics_menu_title).toBe('Topics');
		expect(map.topics_catalog_panel_change_topic).toBe('Change topic');
		expect(map.topics_catalog_leaf_no_georesource_title).toBe('Layer not available');
	});

	it('have the expected amount of translations', () => {
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
