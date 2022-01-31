import { provide } from '../../../src/plugins/i18n/layersPlugin.provider';


describe('i18n for LayersPlugin', () => {

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.layersPlugin_store_layer_default_layer_name_vector).toBe('Data');
		expect(map.layersPlugin_store_layer_default_layer_name_future).toBe('Loading...');
	});

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.layersPlugin_store_layer_default_layer_name_vector).toBe('Daten');
		expect(map.layersPlugin_store_layer_default_layer_name_future).toBe('Wird geladen...');
	});

	it('have the expected amount of translations', () => {

		const expectedSize = 2;
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
