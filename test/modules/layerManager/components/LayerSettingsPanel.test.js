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
			expect(element.getModel()).toEqual({ layerProperties: null, geoResource: null });
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
			const element = await setup({ ...layer, style: { baseColor: '#ff4433' }, constraints: { ...layer.constraints, updateInterval: 420 } });

			//view
			expect(element.shadowRoot.querySelectorAll('.header').length).toBe(1);
			expect(element.shadowRoot.querySelector('#layer_settings_header').textContent).toBe('label0');

			expect(element.shadowRoot.querySelectorAll('.layer_setting').length).toBe(/**BaseColor + UpdateInterval + ResetSettings**/ 3);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_title').length).toBe(/**BaseColor + UpdateInterval**/ 2);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_content').length).toBe(/**BaseColor + UpdateInterval**/ 2);
			expect(element.shadowRoot.querySelectorAll('.reset_settings').length).toBe(/**ResetSettings**/ 1);
			expect(element.shadowRoot.querySelectorAll('.reset_settings')[0].label).toBe('layerManager_layer_settings_reset');
			expect(element.shadowRoot.querySelectorAll('.reset_settings')[0].title).toBe('layerManager_layer_settings_description_reset');
			expect(element.shadowRoot.querySelectorAll('.reset_settings')[0].type).toBe('primary');

			// both settings active
			expect(element.shadowRoot.querySelectorAll('.color-input').length).toBe(/**BaseColor**/ 1);
			expect(element.shadowRoot.querySelectorAll('ba-color-palette').length).toBe(/**BaseColor**/ 1);
			expect(element.shadowRoot.querySelectorAll('.interval-container').length).toBe(/**UpdateInterval**/ 1);
		});

		it('renders the view with layerId for Kml', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await setup({ ...layer, constraints: { ...layer.constraints, updateInterval: 420 } });

			//view
			expect(element.shadowRoot.querySelectorAll('.layer_setting').length).toBe(/**UpdateInterval + ResetSettings + ShowPointNames-Toggle**/ 3);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_title').length).toBe(/**UpdateInterval + ShowPointNames-Toggle**/ 2);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_content').length).toBe(/**UpdateInterval + ShowPointNames-Toggle**/ 2);
			expect(element.shadowRoot.querySelectorAll('.reset_settings').length).toBe(/**ResetSettings**/ 1);

			expect(element.shadowRoot.querySelectorAll('.interval-container').length).toBe(/**UpdateInterval**/ 1);

			expect(element.shadowRoot.querySelectorAll('.color-input').length).toBe(/**BaseColor**/ 0);
			expect(element.shadowRoot.querySelectorAll('ba-color-palette').length).toBe(/**BaseColor**/ 0);
		});

		it('renders the view with layerId for GeoJson', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.GEOJSON));
			const element = await setup(layer);

			//view
			expect(element.shadowRoot.querySelectorAll('.layer_setting').length).toBe(
				/**BaseColor + UpdateInterval + ResetSettings + ShowPointNames-Toggle**/ 4
			);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_title').length).toBe(/**BaseColor + UpdateInterval + ShowPointNames-Toggle**/ 3);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_content').length).toBe(/**BaseColor + UpdateInterval + ShowPointNames-Toggle**/ 3);
			expect(element.shadowRoot.querySelectorAll('.reset_settings').length).toBe(/**ResetSettings**/ 1);

			expect(element.shadowRoot.querySelectorAll('.color-input').length).toBe(/**BaseColor**/ 1);
			expect(element.shadowRoot.querySelectorAll('ba-color-palette').length).toBe(/**BaseColor**/ 1);
			expect(element.shadowRoot.querySelectorAll('.interval-container').length).toBe(/**UpdateInterval**/ 1);
		});

		it('renders the view with layerId for other GeoResource', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue({ isStylable: () => false, isUpdatableByInterval: () => false });
			const element = await setup(layer);

			//view does not contain any element
			expect(element.shadowRoot.querySelectorAll('.layer_setting').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_title').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_content').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.reset_settings').length).toBe(0);
		});

		it('does not render the view with invalid layerId (no GeoResource)', async () => {
			spyOn(geoResourceService, 'byId').withArgs('geoResourceId0').and.returnValue(null);
			const element = await setup(layer);

			//view does not contain any element
			expect(element.shadowRoot.querySelectorAll('.layer_setting').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_title').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.layer_setting_content').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.reset_settings').length).toBe(0);
		});
	});

	describe('when color settings changing', () => {
		it('updates the store', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.GEOJSON));
			const element = await setup(layer);
			const newColor1 = '#ff4221';

			const colorInputElement = element.shadowRoot.querySelector('#layer_color');
			const colorPaletteElement = element.shadowRoot.querySelector('ba-color-palette');

			colorInputElement.value = newColor1;
			colorInputElement.dispatchEvent(new Event('input'));

			expect(store.getState().layers.active[0].style.baseColor).toBe(newColor1);

			const newColor2 = '#ff2142';
			colorPaletteElement.dispatchEvent(new CustomEvent('colorChanged', { detail: { color: newColor2 } }));

			expect(colorInputElement.value).toBe(newColor2);
			expect(store.getState().layers.active[0].style.baseColor).toBe(newColor2);
		});
	});

	describe('when interval settings changing', () => {
		it('updates the store with an interval', async () => {
			const geoResource = new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.GEOJSON);
			spyOn(geoResourceService, 'byId').withArgs('geoResourceId0').and.returnValue(geoResource);
			const element = await setup(layer);
			const newIntervalInMinutes = 3;

			const intervalInputElement = element.shadowRoot.querySelector('#layer_interval_slider');
			intervalInputElement.value = newIntervalInMinutes;
			intervalInputElement.dispatchEvent(new Event('input'));

			expect(store.getState().layers.active[0].constraints.updateInterval).toBe(newIntervalInMinutes * 60);
		});
	});

	describe('when reset button is clicked', () => {
		it('updates store with default values', async () => {
			const geoResource = new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.GEOJSON);
			spyOn(geoResourceService, 'byId').withArgs('geoResourceId0').and.returnValue(geoResource);
			const changedLayer = { ...layer, style: { baseColor: '#ff4433' }, constraints: { ...layer.constraints, updateInterval: 420 } };
			const element = await setup(changedLayer);

			const resetSettingsElement = element.shadowRoot.querySelector('.reset_settings');
			resetSettingsElement.click();

			expect(store.getState().layers.active[0].constraints.updateInterval).toBeNull();
			expect(store.getState().layers.active[0].style).toBeNull();
		});
	});
});
