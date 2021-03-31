import { provide } from '../../../../src/modules/header/i18n/header.provider';


describe('i18n for header module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.header_header_topics_button).toBe('Themen');
		expect(map.header_header_maps_button).toBe('Dargestellte Karten');
		expect(map.header_header_more_button).toBe('mehr');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.header_header_topics_button).toBe('Topics');
		expect(map.header_header_maps_button).toBe('Maps');
		expect(map.header_header_more_button).toBe('more');
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