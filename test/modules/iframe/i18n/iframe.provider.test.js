import { provide } from '../../../../src/modules/iframe/i18n/iframe.provider';


describe('i18n for iframe module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.iframe_non_embedded_hint).toBe('Die BayernAtlas Iframe API muss über ein Inlineframe-Element eingebunden werden.');
		expect(map.iframe_generator_width).toBe('Breite');
		expect(map.iframe_generator_height).toBe('Höhe');
		expect(map.iframe_copy_icon).toBe('In die Zwischenablage kopieren');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.iframe_non_embedded_hint).toBe('The BayernAtlas Iframe API must be used in an iframe.');
		expect(map.iframe_generator_width).toBe('Width');
		expect(map.iframe_generator_height).toBe('Height');
		expect(map.iframe_copy_icon).toBe('Copy to clipboard');
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
