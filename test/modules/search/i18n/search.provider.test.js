import { provide } from '../../../../src/modules/search/i18n/search.provider';


describe('i18n for search module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.search_menu_locationResultsPanel_label).toBe('Orte');
		expect(map.search_menu_geoResourceResultsPanel_label).toBe('Daten');
		expect(map.search_menu_cpResultsPanel_label).toBe('Flurstück');
		expect(map.search_menu_showAll_label).toBe('Mehr...');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.search_menu_locationResultsPanel_label).toBe('Places');
		expect(map.search_menu_geoResourceResultsPanel_label).toBe('Data');
		expect(map.search_menu_cpResultsPanel_label).toBe('Cadastral parcel');
		expect(map.search_menu_showAll_label).toBe('Show more...');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 4;
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
