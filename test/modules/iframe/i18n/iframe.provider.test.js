import { provide } from '../../../../src/modules/iframe/i18n/iframe.provider';


describe('i18n for iframe module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.iframe_non_embedded_hint).toBe('Die BayernAtlas Iframe API muss über ein Inlineframe-Element eingebunden werden.');
		expect(map.iframe_embed_disclaimer_title).toBe('Nutzungsbedingungen');
		expect(map.iframe_embed_disclaimer_text).toBe('Sie können die Karte in Ihre Website oder ein Blog einbetten. Mit dem Einbetten dieser Karte stimmen Sie den Nutzungsbedingungen zu.');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.iframe_non_embedded_hint).toBe('The BayernAtlas Iframe API must be used in an iframe.');
		expect(map.iframe_embed_disclaimer_title).toBe('Disclaimer');
		expect(map.iframe_embed_disclaimer_text).toBe('You can embed the map in your website or blog. By embedding this map you agree to the terms of use.');
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
