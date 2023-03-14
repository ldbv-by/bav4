import { provide } from '../../../../src/modules/map/i18n/attributionInfo.provider';

describe('i18n for attribution info', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_attributionInfo_label).toBe('Data');
		expect(map.map_attributionInfo_collapse_title_open).toBe('Show all');
		expect(map.map_attributionInfo_collapse_title_close).toBe('Close');
		expect(map.map_privacy_policy_link).toBe('Privacy Policy');
		expect(map.map_privacy_policy_url).toBe('https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_attributionInfo_label).toBe('Daten');
		expect(map.map_attributionInfo_collapse_title_open).toBe('Alle anzeigen');
		expect(map.map_attributionInfo_collapse_title_close).toBe('Schließen');
		expect(map.map_privacy_policy_link).toBe('Datenschutzerklärung');
		expect(map.map_privacy_policy_url).toBe('https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 5;
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
