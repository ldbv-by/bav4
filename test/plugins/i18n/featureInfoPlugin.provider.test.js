import { provide } from '../../../src/plugins/i18n/featureInfoPlugin.provider';


describe('i18n for FeatureInfoPlugin', () => {

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.featureInfoPlugin_featureInfoService_exception).toBe('FeatureInfo could not be retrieved');
	});

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.featureInfoPlugin_featureInfoService_exception).toBe('FeatureInfo Abfrage schlug fehl');
	});

	it('have the expected amount of translations', () => {

		const expectedSize = 1;
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
