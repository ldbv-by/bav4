import { provide } from '../../../../src/modules/featureInfo/i18n/featureInfo.provider';

describe('i18n for featureInfo module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.featureInfo_close_button).toBe('Schließen');
		expect(map.featureInfo_header).toBe('Objekt-Info');
		expect(map.featureInfo_info).toBe('Keine Informationen verfügbar.<br>Bitte in die <b>Karte</b> klicken.');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.featureInfo_close_button).toBe('Close');
		expect(map.featureInfo_header).toBe('Object Information');
		expect(map.featureInfo_info).toBe('No information available.<br>Please click into the <b>map</b>.');
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
