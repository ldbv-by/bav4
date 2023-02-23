import { provide } from '../../../../src/modules/map/i18n/infoButton.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_infoButton_title).toBe('Information');
		expect(map.map_infoButton_help).toBe('Hilfe');
		expect(map.map_infoButton_contact).toBe('Kontakt');
		expect(map.map_infoButton_about).toBe('Impressum');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_infoButton_title).toBe('Information');
		expect(map.map_infoButton_help).toBe('Help');
		expect(map.map_infoButton_contact).toBe('Contact');
		expect(map.map_infoButton_about).toBe('About us');
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
