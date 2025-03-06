import { provide } from '../../../../src/modules/layerManager/i18n/layerManager.provider';

describe('i18n for layer-manager', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.layerManager_title).toBe('Ebenen');
		expect(map.layerManager_change_visibility).toBe('Sichtbarkeit umschalten');
		expect(map.layerManager_opacity).toBe('Deckkraft');
		expect(map.layerManager_opacity_badge).toBe('Deckkraft in Prozent');
		expect(map.layerManager_collapse).toBe('Eigenschaften einklappen');
		expect(map.layerManager_expand).toBe('Eigenschaften ausklappen');
		expect(map.layerManager_move_up).toBe('Ebene anheben');
		expect(map.layerManager_move_down).toBe('Ebene absenken');
		expect(map.layerManager_info).toBe('Info');
		expect(map.layerManager_to_copy).toBe('Ebene kopieren');
		expect(map.layerManager_zoom_to_extent).toBe('Auf Inhalt zoomen');
		expect(map.layerManager_layer_copy).toBe('Kopie');
		expect(map.layerManager_expand_all).toBe('Alle ausklappen');
		expect(map.layerManager_collapse_all).toBe('Alle einklappen');
		expect(map.layerManager_remove_all).toBe('Überlagerungen entfernen');
		expect(map.layerManager_loading_hint).toBe('Wird geladen');
		expect(map.layerManager_time_travel_hint).toBe('Bitte ein Jahr auswählen');
		expect(map.layerManager_time_travel_slider).toBe('Schieberegler öffnen');
		expect(map.layerManager_compare).toBe('Vergleichen starten');
		expect(map.layerManager_compare_stop).toBe('Vergleichen beenden');
		expect(map.layerManager_compare_share).toBe('Ansicht teilen');
		expect(map.layerManager_compare_left).toBe('Links');
		expect(map.layerManager_compare_left_title).toBe('Ebene auf die linke Seite setzen');
		expect(map.layerManager_compare_both).toBe('Beide');
		expect(map.layerManager_compare_both_title).toBe('Ebene auf beide Seiten setzen');
		expect(map.layerManager_compare_right).toBe('Rechts');
		expect(map.layerManager_compare_right_title).toBe('Ebene auf die rechte Seite setzen');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.layerManager_title).toBe('Layers');
		expect(map.layerManager_change_visibility).toBe('Toggle visibility');
		expect(map.layerManager_opacity).toBe('Opacity');
		expect(map.layerManager_opacity_badge).toBe('Opacity in percent');
		expect(map.layerManager_collapse).toBe('Collapse properties');
		expect(map.layerManager_expand).toBe('Expand properties');
		expect(map.layerManager_move_up).toBe('Move layer up');
		expect(map.layerManager_move_down).toBe('Move layer down');
		expect(map.layerManager_info).toBe('Info');
		expect(map.layerManager_remove).toBe('Remove layer');
		expect(map.layerManager_to_copy).toBe('Copy layer');
		expect(map.layerManager_zoom_to_extent).toBe('Zoom to extent');
		expect(map.layerManager_layer_copy).toBe('Copy');
		expect(map.layerManager_expand_all).toBe('Expand all');
		expect(map.layerManager_collapse_all).toBe('Collapse all');
		expect(map.layerManager_remove_all).toBe('Remove all overlays');
		expect(map.layerManager_loading_hint).toBe('Loading');
		expect(map.layerManager_time_travel_hint).toBe('Choose a year');
		expect(map.layerManager_time_travel_slider).toBe('Open slider');
		expect(map.layerManager_compare).toBe('Start comparison tool');
		expect(map.layerManager_compare_stop).toBe('Exit comparison tool');
		expect(map.layerManager_compare_share).toBe('Share the view');
		expect(map.layerManager_compare_left).toBe('Left');
		expect(map.layerManager_compare_left_title).toBe('Set layer on left side');
		expect(map.layerManager_compare_both).toBe('Both');
		expect(map.layerManager_compare_both_title).toBe('Set layer on both sides');
		expect(map.layerManager_compare_right).toBe('Right');
		expect(map.layerManager_compare_right_title).toBe('Set layer on right side');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 28;
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
