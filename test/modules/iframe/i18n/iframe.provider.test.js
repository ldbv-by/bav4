import { provide } from '../../../../src/modules/iframe/i18n/iframe.provider';

describe('i18n for iframe module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.iframe_non_embedded_hint).toBe('Die BayernAtlas Iframe API muss über ein Inlineframe-Element eingebunden werden.');
		expect(map.iframe_generator_width).toBe('Breite');
		expect(map.iframe_generator_height).toBe('Höhe');
		expect(map.iframe_generator_clipboard_success).toBe('Der HTML Code wurde in die Zwischenablage kopiert');
		expect(map.iframe_generator_clipboard_error).toBe('"In die Zwischenablage kopieren" steht nicht zur Verfügung');
		expect(map.iframe_generator_toggle_label).toBe('Responsive Breite');
		expect(map.iframe_generator_toggle_text).toBe('Die Karte passt sich der Breite seines Containers an');
		expect(map.iframe_generator_toggle_title).toBe('Eingebettete Karte wird sich erweitern, um sich der Breite seines Containers anzupassen.');
		expect(map.iframe_generator_copy_icon).toBe('In die Zwischenablage kopieren');
		expect(map.iframe_activate_map_button).toBe('Karte aktivieren');
		expect(map.iframe_view_larger_map_chip).toBe('Größere Karte ansehen');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.iframe_non_embedded_hint).toBe('The BayernAtlas Iframe API must be used in an iframe.');
		expect(map.iframe_generator_width).toBe('Width');
		expect(map.iframe_generator_height).toBe('Height');
		expect(map.iframe_generator_clipboard_success).toBe('The HTML code was copied to the clipboard');
		expect(map.iframe_generator_clipboard_error).toBe('"Copy to clipboard" is not available');
		expect(map.iframe_generator_toggle_label).toBe('Responsive width');
		expect(map.iframe_generator_toggle_text).toBe('The map adjusts to the width of its container');
		expect(map.iframe_generator_toggle_title).toBe('Embedded map will expand to fit the width of its container.');
		expect(map.iframe_generator_copy_icon).toBe('Copy to clipboard');
		expect(map.iframe_activate_map_button).toBe('Activate map');
		expect(map.iframe_view_larger_map_chip).toBe('View larger map');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 11;
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
