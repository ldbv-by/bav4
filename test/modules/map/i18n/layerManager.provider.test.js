import { layerManagerProvide } from '../../../../src/modules/map/i18n/layerManager.provider';


describe('i18n for layer-manager', () => {

	it('provides translation for de', () => {

		const map = layerManagerProvide('de');

		expect(map.layer_manager_title).toBe('Ebenen');
		expect(map.layer_manager_change_visibility).toBe('Sichtbarkeit umschalten');
	});

	it('provides translation for en', () => {

		const map = layerManagerProvide('en');

		expect(map.layer_manager_title).toBe('Layers');
		expect(map.layer_manager_change_visibility).toBe('toggle visibility');
	});

	it('provides an empty map for a unknown lang', () => {

		const map = layerManagerProvide('unknown');

		expect(map).toEqual({});
	});
});