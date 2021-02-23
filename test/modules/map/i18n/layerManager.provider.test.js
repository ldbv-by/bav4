import { provide as layerManagerProvide } from '../../../../src/modules/map/i18n/layerManager.provider';


describe('i18n for layer-manager', () => {

	it('provides translation for de', () => {

		const map = layerManagerProvide('de');

		expect(map.map_layerManager_title).toBe('Ebenen');		
		expect(map.map_layerManager_change_visibility).toBe('Sichtbarkeit umschalten');
		expect(map.map_layerManager_opacity).toBe('Opazität');
		expect(map.map_layerManager_collapse).toBe('Eigenschaften einklappen');
		expect(map.map_layerManager_expand).toBe('Eigenschaften ausklappen');
		expect(map.map_layerManager_move_up).toBe('Ebene anheben');
		expect(map.map_layerManager_move_down).toBe('Ebene absenken');
		expect(map.map_layerManager_remove).toBe('Ebene entfernen');
	});

	it('provides translation for en', () => {

		const map = layerManagerProvide('en');

		expect(map.map_layerManager_title).toBe('Layers');		
		expect(map.map_layerManager_change_visibility).toBe('toggle visibility');
		expect(map.map_layerManager_opacity).toBe('Opacity');
		expect(map.map_layerManager_collapse).toBe('collapse properties');
		expect(map.map_layerManager_expand).toBe('expand properties');
		expect(map.map_layerManager_move_up).toBe('move Layer up');
		expect(map.map_layerManager_move_down).toBe('move Layer down');
		expect(map.map_layerManager_remove).toBe('remove Layer');
	});

	it('provides an empty map for a unknown lang', () => {

		const map = layerManagerProvide('unknown');

		expect(map).toEqual({});
	});
});