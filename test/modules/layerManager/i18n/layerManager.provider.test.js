import { provide } from '../../../../src/modules/layerManager/i18n/layerManager.provider';


describe('i18n for layer-manager', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.layerManager_title).toBe('Ebenen');
		expect(map.layerManager_change_visibility).toBe('Sichtbarkeit umschalten');
		expect(map.layerManager_opacity).toBe('Opazität');
		expect(map.layerManager_collapse).toBe('Eigenschaften einklappen');
		expect(map.layerManager_expand).toBe('Eigenschaften ausklappen');
		expect(map.layerManager_move_up).toBe('Ebene anheben');
		expect(map.layerManager_move_down).toBe('Ebene absenken');
		expect(map.layerManager_to_copy).toBe('Ebene kopieren');
		expect(map.layerManager_zoom_to_extent).toBe('Auf Inhalt zoomen');
		expect(map.layerManager_layer_copy).toBe('Kopie');
		expect(map.layerManager_expand_all).toBe('Alle ausklappen');
		expect(map.layerManager_collapse_all).toBe('Alle einklappen');
		expect(map.layerManager_remove_all).toBe('Alle entfernen');
		expect(map.layerManager_loading_hint).toBe('Wird geladen');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.layerManager_title).toBe('Layers');
		expect(map.layerManager_change_visibility).toBe('toggle visibility');
		expect(map.layerManager_opacity).toBe('Opacity');
		expect(map.layerManager_collapse).toBe('collapse properties');
		expect(map.layerManager_expand).toBe('expand properties');
		expect(map.layerManager_move_up).toBe('move layer up');
		expect(map.layerManager_move_down).toBe('move layer down');
		expect(map.layerManager_remove).toBe('remove layer');
		expect(map.layerManager_to_copy).toBe('Copy layer');
		expect(map.layerManager_zoom_to_extent).toBe('Zoom to extent');
		expect(map.layerManager_layer_copy).toBe('copy');
		expect(map.layerManager_expand_all).toBe('expand all');
		expect(map.layerManager_collapse_all).toBe('collapse all');
		expect(map.layerManager_remove_all).toBe('remove all');
		expect(map.layerManager_loading_hint).toBe('Loading');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 15;
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
