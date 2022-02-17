import { provide } from '../../../src/plugins/i18n/importPlugin.provider';


describe('i18n for FeatureInfoPlugin', () => {

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.importPlugin_url_failed).toBe('Import failed');
		expect(map.importPlugin_data_failed).toBe('Importing data failed');
	});

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.importPlugin_url_failed).toBe('Import schlug fehl');
		expect(map.importPlugin_data_failed).toBe('Import der Daten schlug fehl');
	});

	it('have the expected amount of translations', () => {

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
