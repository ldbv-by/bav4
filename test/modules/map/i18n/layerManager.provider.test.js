import { provide } from '../../../../src/modules/map/i18n/layerManager.provider';


describe('i18n for layer-manager', () => {

	it('provides translation for de', () => {

		const map = provide('de');

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

		const map = provide('en');

		expect(map.map_layerManager_title).toBe('Layers');		
		expect(map.map_layerManager_change_visibility).toBe('toggle visibility');
		expect(map.map_layerManager_opacity).toBe('Opacity');
		expect(map.map_layerManager_collapse).toBe('collapse properties');
		expect(map.map_layerManager_expand).toBe('expand properties');
		expect(map.map_layerManager_move_up).toBe('move Layer up');
		expect(map.map_layerManager_move_down).toBe('move Layer down');
		expect(map.map_layerManager_remove).toBe('remove Layer');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 8;
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