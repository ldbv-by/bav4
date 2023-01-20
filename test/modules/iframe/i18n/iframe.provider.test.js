import { provide } from '../../../../src/modules/iframe/i18n/iframe.provider';


describe('i18n for iframe module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.iframe_non_embedded_hint).toBe('Die BayernAtlas IFrame API muss über ein iframe -Element eingebunden werden.');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.iframe_non_embedded_hint).toBe('The BayernAtlas Embed API must be used in an iframe.');
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
