import { AttributionInfo } from '../../../../../src/modules/map/components/attributionInfo/AttributionInfo';
import { TestUtils } from '../../../../test-utils.js';
import { layersReducer, createDefaultLayerProperties } from '../../../../../src/store/layers/layers.reducer';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { modifyLayer } from '../../../../../src/store/layers/layers.action';
import { changeZoom } from '../../../../../src/store/position/position.action';
import { WMTSGeoResource } from '../../../../../src/services/domain/geoResources';
import { $injector } from '../../../../../src/injection';
import { getMinimalAttribution } from '../../../../../src/services/provider/attribution.provider';


window.customElements.define(AttributionInfo.tag, AttributionInfo);

describe('AttributionInfo', () => {

	const geoResourceServiceMock = {
		byId: () => { }
	};
	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {}
	};

	const setup = (state) => {
		TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			position: positionReducer
		});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('MapService', mapServiceMock);

		return TestUtils.render(AttributionInfo.tag);
	};


	describe('_getAttributions', () => {

		it('return a set of valid attributions', async () => {

			spyOn(geoResourceServiceMock, 'byId').and.callFake(geoResourceId => {
				switch (geoResourceId) {
					case '0':
						return new WMTSGeoResource(geoResourceId, '', '').setAttributionProvider((geoResourceId, zoomLevel) => getMinimalAttribution(`foo_${zoomLevel}`));
					case '1':
						return new WMTSGeoResource(geoResourceId, '', '').setAttributionProvider((geoResourceId, zoomLevel) => getMinimalAttribution(`foo_${zoomLevel}`));
					case '2':
						return new WMTSGeoResource(geoResourceId, '', '').setAttributionProvider((geoResourceId, zoomLevel) => [getMinimalAttribution(`foo_${zoomLevel}`)]);
					case '3':
						return new WMTSGeoResource(geoResourceId, '', '').setAttributionProvider(() => null);
					case '4':
						return new WMTSGeoResource(geoResourceId, '', '').setAttributionProvider((geoResourceId, zoomLevel) => getMinimalAttribution(`bar_${zoomLevel}`));
					case '5':
						return new WMTSGeoResource(geoResourceId, '', '').setAttributionProvider((geoResourceId, zoomLevel) => getMinimalAttribution(`not_visible_${zoomLevel}`));
				}
			});
			const layer = [
				{ ...createDefaultLayerProperties(), id: 'id0', geoResourceId: '0' },
				{ ...createDefaultLayerProperties(), id: 'id1', geoResourceId: '1' },
				{ ...createDefaultLayerProperties(), id: 'id2', geoResourceId: '2' },
				{ ...createDefaultLayerProperties(), id: 'id3', geoResourceId: '3' },
				{ ...createDefaultLayerProperties(), id: 'id4', geoResourceId: '4' },
				{ ...createDefaultLayerProperties(), id: 'id5', geoResourceId: '5', visible: false }
			];

			const element = await setup();
			const attributions = element._getAttributions(layer, 5);

			expect(attributions).toHaveSize(2);
			expect(attributions[0].copyright.label).toBe('foo_5');
			expect(attributions[1].copyright.label).toBe('bar_5');
		});
	});

	describe('when instantiated', () => {

		it('has a model containing default values', async () => {
			await setup();
			const model = new AttributionInfo().getModel();

			expect(model).toEqual({
				open: false,
				activeLayers: null,
				zoomLevel: null
			});
		});
	});


	describe('when initialized', () => {

		it('renders available attributions', async () => {
			const layerId0 = 'id0';
			const geoResourceId0 = 'geoResourceId0';
			const attribution0 = getMinimalAttribution(layerId0);
			const layerId1 = 'id1';
			const geoResourceId1 = 'geoResourceId1';
			const url1 = 'http://foo.bar/';
			const attribution1 = {
				copyright: {
					label: layerId1,
					url: url1
				}
			};
			const layer = [
				{ ...createDefaultLayerProperties(), id: layerId0, geoResourceId: geoResourceId0 },
				{ ...createDefaultLayerProperties(), id: layerId1, geoResourceId: geoResourceId1 }
			];
			const zoom = 12;
			const state = {
				layers: {
					active: layer
				},
				position: {
					zoom: zoom
				}
			};
			const geoResource0 = new WMTSGeoResource(geoResourceId0, '', '').setAttribution(attribution0);
			const geoResource1 = new WMTSGeoResource(geoResourceId1, '', '').setAttribution(attribution1);
			spyOn(geoResourceServiceMock, 'byId').and.callFake(geoResourceId => {
				switch (geoResourceId) {
					case geoResourceId0:
						return geoResource0;
					case geoResourceId1:
						return geoResource1;
				}
			});

			const element = await setup(state);

			// we expect two kinds of attribution: a <span> containing a plain string and an <a> element
			expect(element.shadowRoot.querySelectorAll('span.attribution')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('span.attribution').innerText).toBe(layerId0 + ','); //should contain also a separator

			expect(element.shadowRoot.querySelector('.attribution-container').innerText).toContain('© map_attributionInfo_label');
			expect(element.shadowRoot.querySelectorAll('a.attribution.attribution-link')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('a.attribution.attribution-link').href).toBe(url1);
			expect(element.shadowRoot.querySelector('a.attribution.attribution-link').target).toBe('_blank');
			expect(element.shadowRoot.querySelector('a.attribution.attribution-link').innerText).toBe(layerId1);

			expect(element.shadowRoot.querySelectorAll('.collapse-button')).toHaveSize(1);
		});

		it('renders no content when no layers are set', async () => {
			const stateEmpty = {
				layers: {
					active: []
				}
			};

			const element = await setup(stateEmpty);

			expect(element.shadowRoot.querySelector('.attribution-container').innerText).toEqual('© map_attributionInfo_label:');
			expect(element.shadowRoot.querySelector('.is-collapse')).toBeFalsy();
		});

		describe('when zoom changes', () => {

			it('re-renders available attributions', async () => {
				const layerId0 = 'id0';
				const geoResourceId0 = 'geoResourceId0';
				const layer = [
					{ ...createDefaultLayerProperties(), id: layerId0, geoResourceId: geoResourceId0 }
				];
				const zoom = 12;
				const state = {
					layers: {
						active: layer
					},
					position: {
						zoom: zoom
					}
				};
				const attributionProvider = (geoResources, zoomLevel) => getMinimalAttribution(`${geoResources.id}_${zoomLevel}`);
				const geoResource0 = new WMTSGeoResource(geoResourceId0, '', '').setAttributionProvider(attributionProvider);
				spyOn(geoResourceServiceMock, 'byId').and.returnValue(geoResource0);

				const element = await setup(state);

				expect(element.shadowRoot.querySelectorAll('span.attribution')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('span.attribution').innerText).toBe(`${geoResourceId0}_${zoom}`);


				changeZoom(11);

				expect(element.shadowRoot.querySelectorAll('span.attribution')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('span.attribution').innerText).toBe(`${geoResourceId0}_11`);
			});
		});

		describe('when layer slice of state changes', () => {

			it('re-renders available attributions', async () => {
				const layerId0 = 'id0';
				const geoResourceId0 = 'geoResourceId0';
				const layerId1 = 'id1';
				const geoResourceId1 = 'geoResourceId1';
				const layer = [
					{ ...createDefaultLayerProperties(), id: layerId0, geoResourceId: geoResourceId0 },
					{ ...createDefaultLayerProperties(), id: layerId1, geoResourceId: geoResourceId1 }
				];
				const zoom = 12;
				const state = {
					layers: {
						active: layer
					},
					position: {
						zoom: zoom
					}
				};
				const geoResource0 = new WMTSGeoResource(geoResourceId0, '', '').setAttribution(getMinimalAttribution(layerId0));
				const geoResource1 = new WMTSGeoResource(geoResourceId1, '', '').setAttribution(getMinimalAttribution(layerId1));
				spyOn(geoResourceServiceMock, 'byId').and.callFake(geoResourceId => {
					switch (geoResourceId) {
						case geoResourceId0:
							return geoResource0;
						case geoResourceId1:
							return geoResource1;
					}
				});

				const element = await setup(state);

				expect(element.shadowRoot.querySelectorAll('span.attribution')).toHaveSize(2);

				modifyLayer(layerId0, { visible: false });

				expect(element.shadowRoot.querySelectorAll('span.attribution')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('span.attribution').innerText).toBe(layerId1);
			});
		});

		describe('when toggle button clicked', () => {

			it('toogles the component', async () => {
				const layerId0 = 'id0';
				const geoResourceId0 = 'geoResourceId0';
				const layer = [
					{ ...createDefaultLayerProperties(), id: layerId0, geoResourceId: geoResourceId0 }
				];
				const zoom = 12;
				const state = {
					layers: {
						active: layer
					},
					position: {
						zoom: zoom
					}
				};
				const attributionProvider = (geoResources, zoomLevel) => getMinimalAttribution(`${geoResources.id}_${zoomLevel}`);
				const geoResource0 = new WMTSGeoResource(geoResourceId0, '', '').setAttributionProvider(attributionProvider);
				spyOn(geoResourceServiceMock, 'byId').and.returnValue(geoResource0);

				const element = await setup(state);
				const toggleButton = element.shadowRoot.querySelector('.collapse-button');

				expect(element.shadowRoot.querySelectorAll('.attribution-container.isopen')).toHaveSize(0);

				toggleButton.click();

				expect(element.shadowRoot.querySelectorAll('.attribution-container.isopen')).toHaveSize(1);

				toggleButton.click();

				expect(element.shadowRoot.querySelectorAll('.attribution-container.isopen')).toHaveSize(0);
			});
		});

	});
});
