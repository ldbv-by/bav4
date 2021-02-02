import { layerItemProvide } from '../../../../src/modules/map/i18n/layerItem.provider';


describe('i18n for layer-manager', () => {

	it('provides translation for de', () => {

		const map = layerItemProvide('de');

		expect(map.layer_item_change_visibility).toBe('Sichtbarkeit umschalten');
		expect(map.layer_item_opacity).toBe('Opazität');
		expect(map.layer_item_collapse).toBe('Eigenschaften einklappen');
		expect(map.layer_item_expand).toBe('Eigenschaften ausklappen');
		expect(map.layer_item_move_up).toBe('Ebene anheben');
		expect(map.layer_item_move_down).toBe('Ebene absenken');
		expect(map.layer_item_remove).toBe('Ebene entfernen');
	});

	it('provides translation for en', () => {

		const map = layerItemProvide('en');

		expect(map.layer_item_change_visibility).toBe('toggle visibility');
		expect(map.layer_item_opacity).toBe('Opacity');
		expect(map.layer_item_collapse).toBe('collapse properties');
		expect(map.layer_item_expand).toBe('expand properties');
		expect(map.layer_item_move_up).toBe('move Layer up');
		expect(map.layer_item_move_down).toBe('move Layer down');
		expect(map.layer_item_remove).toBe('remove Layer');
	});

	it('provides an empty map for a unknown lang', () => {

		const map = layerItemProvide('unknown');

		expect(map).toEqual({});
	});
});