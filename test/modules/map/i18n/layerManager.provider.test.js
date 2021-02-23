import { provide as layerManagerProvide } from '../../../../src/modules/map/i18n/layerManager.provider';


describe('i18n for layer-manager', () => {

	it('provides translation for de', () => {

		const map = layerManagerProvide('de');

		expect(map.layer_manager_title).toBe('Ebenen');		
		expect(map.layer_manager_change_visibility).toBe('Sichtbarkeit umschalten');
		expect(map.layer_manager_opacity).toBe('Opazität');
		expect(map.layer_manager_collapse).toBe('Eigenschaften einklappen');
		expect(map.layer_manager_expand).toBe('Eigenschaften ausklappen');
		expect(map.layer_manager_move_up).toBe('Ebene anheben');
		expect(map.layer_manager_move_down).toBe('Ebene absenken');
		expect(map.layer_manager_remove).toBe('Ebene entfernen');
	});

	it('provides translation for en', () => {

		const map = layerManagerProvide('en');

		expect(map.layer_manager_title).toBe('Layers');		
		expect(map.layer_manager_change_visibility).toBe('toggle visibility');
		expect(map.layer_manager_opacity).toBe('Opacity');
		expect(map.layer_manager_collapse).toBe('collapse properties');
		expect(map.layer_manager_expand).toBe('expand properties');
		expect(map.layer_manager_move_up).toBe('move Layer up');
		expect(map.layer_manager_move_down).toBe('move Layer down');
		expect(map.layer_manager_remove).toBe('remove Layer');
	});

	it('provides an empty map for a unknown lang', () => {

		const map = layerManagerProvide('unknown');

		expect(map).toEqual({});
	});
});