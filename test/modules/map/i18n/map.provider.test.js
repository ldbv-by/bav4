import { provide } from '../../../../src/modules/map/i18n/map.provider';


describe('i18n for map module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.map_zoom_in_button).toBe('Vergrößere Kartenausschnitt');
		expect(map.map_zoom_out_button).toBe('Verkleinere Kartenausschnitt');
		expect(map.map_info_button).toBe('Information');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.map_zoom_in_button).toBe('Zoom in');
		expect(map.map_zoom_out_button).toBe('Zoom out');
		expect(map.map_info_button).toBe('Information');
	});

	it('provides an empty map for a unknown lang', () => {

		const map = provide('unknown');

		expect(map).toEqual({});
	});
});