import { OafGeoResource, VectorGeoResource, VectorSourceType } from '../../../../src/domain/geoResources';
import { $injector } from '../../../../src/injection';
import { LayerSettingsPanel } from '../../../../src/modules/layerManager/components/LayerSettingsPanel';
import { createDefaultLayerProperties, layersReducer } from '../../../../src/store/layers/layers.reducer';
import { TestUtils } from '../../../test-utils';
window.customElements.define(LayerSettingsPanel.tag, LayerSettingsPanel);

describe('LayerSettingsPanel', () => {
	let store;
	const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
	const geoResourceService = { byId: () => {}, addOrReplace: () => {}, getKeywords: () => [] };
	const setup = async (layer = null) => {
		store = TestUtils.setupStoreAndDi(
			{
				layers: {
					active: layer ? [layer] : []
				}
			},
			{
				layers: layersReducer
			}
		);
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('GeoResourceService', geoResourceService);

		const element = await TestUtils.render(LayerSettingsPanel.tag, { layerId: layer?.id });
		return element;
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await setup(null);

			//model
			expect(element.getModel()).toEqual({ layerProperties: null });
		});

		it('has properties with default values from the model', async () => {
			const element = await setup(null);

			//properties from model
			expect(element.layerId).toBeNull();
		});

		it('renders the view without layerId', async () => {
			const element = await setup(null);

			//view
			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('has properties with values with layerId ', async () => {
			spyOn(geoResourceService, 'byId').withArgs('geoResourceId0').and.returnValue(new OafGeoResource('geoResourceId0', 'label0'));
			const element = await setup(layer);

			//properties from model
			expect(element.layerId).toBe(layer.id);
		});

		it('renders the view with layerId for OafGeoResource', async () => {
			spyOn(geoResourceService, 'byId').withArgs('geoResourceId0').and.returnValue(new OafGeoResource('geoResourceId0', 'label0'));
			const element = await setup(layer);

			//view
			expect(element.shadowRoot.querySelectorAll('.layer_setting').length).toBe(/**BaseColor + UpdateInterval**/ 2);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_title').length).toBe(/**BaseColor + UpdateInterval**/ 2);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_content').length).toBe(/**BaseColor + UpdateInterval**/ 2);

			expect(element.shadowRoot.querySelectorAll('.color-input').length).toBe(/**BaseColor**/ 1);
			expect(element.shadowRoot.querySelectorAll('ba-color-palette').length).toBe(/**BaseColor**/ 1);
			expect(element.shadowRoot.querySelectorAll('.interval-input').length).toBe(/**UpdateInterval**/ 1);
		});

		it('renders the view with layerId for Kml', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await setup(layer);

			//view
			expect(element.shadowRoot.querySelectorAll('.layer_setting').length).toBe(/**UpdateInterval**/ 1);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_title').length).toBe(/**UpdateInterval**/ 1);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_content').length).toBe(/**UpdateInterval**/ 1);

			expect(element.shadowRoot.querySelectorAll('.interval-input').length).toBe(/**UpdateInterval**/ 1);
		});

		it('renders the view with layerId for GeoJson', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.GEOJSON));
			const element = await setup(layer);

			//view
			expect(element.shadowRoot.querySelectorAll('.layer_setting').length).toBe(/**BaseColor + UpdateInterval**/ 2);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_title').length).toBe(/**BaseColor + UpdateInterval**/ 2);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_content').length).toBe(/**BaseColor + UpdateInterval**/ 2);

			expect(element.shadowRoot.querySelectorAll('.color-input').length).toBe(/**BaseColor**/ 1);
			expect(element.shadowRoot.querySelectorAll('ba-color-palette').length).toBe(/**BaseColor**/ 1);
			expect(element.shadowRoot.querySelectorAll('.interval-input').length).toBe(/**UpdateInterval**/ 1);
		});

		it('renders the view with layerId for other GeoResource', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue({ isStylable: () => false, isUpdatableByInterval: () => false });
			const element = await setup(layer);

			//view
			expect(element.shadowRoot.querySelectorAll('.layer_setting').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_title').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_content').length).toBe(0);
		});
	});

	describe('when color settings changing', () => {
		it('updates the store', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.GEOJSON));
			const element = await setup(layer);
			const newColor = '#ff4221';

			const colorInputElement = element.shadowRoot.querySelector('#layer_color');
			colorInputElement.value = newColor;
			colorInputElement.dispatchEvent(new Event('input'));

			expect(store.getState().layers.active[0].style.baseColor).toBe(newColor);
		});
	});
});
