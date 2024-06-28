import { provide } from '../../../../src/modules/topics/i18n/topics.provider';

describe('i18n for topics module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.topics_menu_title).toBe('Themen');
		expect(map.topics_catalog_panel_change_topic).toBe('Thema wechseln');
		expect(map.topics_catalog_leaf_no_georesource_title).toBe('Ebene nicht verfügbar');
		expect(map.topics_catalog_leaf_info).toBe('Info');
		expect(map.topics_catalog_contentPanel_topic_could_not_be_loaded(['foo'])).toBe('Das Thema mit der ID "foo" konnte nicht geladen werden');
		expect(map.topics_catalog_contentPanel_topic_not_available).toBe('Das Thema steht leider derzeit nicht zur Verfügung');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.topics_menu_title).toBe('Topics');
		expect(map.topics_catalog_panel_change_topic).toBe('Change topic');
		expect(map.topics_catalog_leaf_no_georesource_title).toBe('Layer not available');
		expect(map.topics_catalog_leaf_info).toBe('Info');
		expect(map.topics_catalog_contentPanel_topic_could_not_be_loaded(['foo'])).toBe('The topic with the id "foo" could not be loaded');
		expect(map.topics_catalog_contentPanel_topic_not_available).toBe('The topic is not available');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 6;
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
