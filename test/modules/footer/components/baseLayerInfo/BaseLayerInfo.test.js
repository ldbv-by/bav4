import { BaseLayerInfo } from '../../../../../src/modules/footer/components/baseLayerInfo/BaseLayerInfo';
import { TestUtils } from '../../../../test-utils.js';
import { layersReducer, createDefaultLayerProperties } from '../../../../../src/store/layers/layers.reducer';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { addLayer, removeLayer, modifyLayer } from '../../../../../src/store/layers/layers.action';
import { AggregateGeoResource, XyzGeoResource } from '../../../../../src/domain/geoResources';
import { $injector } from '../../../../../src/injection';

window.customElements.define(BaseLayerInfo.tag, BaseLayerInfo);

describe('BaseLayerInfo', () => {
	const geoResourceServiceMock = {
		byId: () => {}
	};

	const setup = (state) => {
		TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			position: positionReducer
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		$injector.registerSingleton('GeoResourceService', geoResourceServiceMock);
		return TestUtils.render(BaseLayerInfo.tag);
	};

	describe('when initialized', () => {
		it('renders BaseLayerInfo component', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const xyz = new XyzGeoResource('someId', 'LDBV42', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.geoResourceId).and.returnValue(xyz);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('div').innerText).toBe('map_baseLayerInfo_label: LDBV42');
			expect(geoServiceMock).toHaveBeenCalledOnceWith(layer.geoResourceId);
		});

		it('renders BaseLayerInfo based on the attribution object of a GeoResource', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const xyz = new XyzGeoResource('someId', 'LDBV42', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.geoResourceId).and.returnValue(xyz);

			const attribution = [{ description: 'foo' }, { description: null }, { description: 'bar' }];
			const getAttrMock = spyOn(xyz, 'getAttribution');
			getAttrMock.withArgs(12).and.returnValue(attribution);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('div').innerText).toBe('map_baseLayerInfo_label: foo, bar');

			expect(geoServiceMock).toHaveBeenCalledOnceWith(layer.geoResourceId);
			expect(getAttrMock).toHaveBeenCalledOnceWith(12);
		});

		it('renders BaseLayerInfo for a aggregated GeoResource', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId2' };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const xyz0 = new XyzGeoResource('geoResourceId0', 'label0', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const xyz1 = new XyzGeoResource('geoResourceId1', 'label1', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const aggregateGeoResource = new AggregateGeoResource('geoResourceId2', 'label2', ['geoResourceId0', 'geoResourceId1']);
			spyOn(geoResourceServiceMock, 'byId').and.callFake((grId) => {
				switch (grId) {
					case xyz0.id:
						return xyz0;
					case xyz1.id:
						return xyz1;
					case aggregateGeoResource.id:
						return aggregateGeoResource;
				}
			});

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('div').innerText).toBe('map_baseLayerInfo_label: label1, label0');
		});

		it('renders nothing when no layers are set', async () => {
			const stateEmpty = {
				layers: {
					active: []
				},
				position: {
					zoom: 12
				}
			};

			const element = await setup(stateEmpty);

			expect(element.shadowRoot.querySelectorAll('div')).toHaveSize(0);
		});

		it('renders fallback content when GeoResource could not be fetched', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};
			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.geoResourceId).and.returnValue(null);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('div').innerText).toBe('map_baseLayerInfo_label: map_baseLayerInfo_fallback');
			expect(geoServiceMock).toHaveBeenCalledOnceWith(layer.geoResourceId);
		});

		it('renders fallback content when GeoResource.label is not available', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const xyz = new XyzGeoResource('someId', null, 'https://some{1-2}/layer/{z}/{x}/{y}');
			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.geoResourceId).and.returnValue(xyz);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('div').innerText).toBe('map_baseLayerInfo_label: map_baseLayerInfo_fallback');
			expect(geoServiceMock).toHaveBeenCalledOnceWith(layer.geoResourceId);
		});

		it('updates BaseLayerInfo component', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0', zIndex: 0 };
			const layer2 = { ...createDefaultLayerProperties(), id: 'id1', geoResourceId: 'geoResourceId1', zIndex: 0 };
			const state = {
				layers: {
					active: [layer]
				}
			};

			const xyz = new XyzGeoResource('someId', 'LDBV', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const xyz2 = new XyzGeoResource('someId2', 'Ref42', 'https://some{1-2}/layer/{z}/{x}/{y}');

			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId');
			geoServiceMock.withArgs(layer.geoResourceId).and.returnValue(xyz);
			geoServiceMock.withArgs(layer2.geoResourceId).and.returnValue(xyz2);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('div').innerText).toContain('LDBV');
			expect(element.shadowRoot.querySelector('div').innerText).not.toContain('Ref42');

			addLayer(layer2.id, layer2);

			expect(element.shadowRoot.querySelector('div').innerText).toContain('Ref42');
			expect(element.shadowRoot.querySelector('div').innerText).not.toContain('LDBV');

			modifyLayer(layer.id, { zIndex: 0 });

			expect(element.shadowRoot.querySelector('div').innerText).toContain('LDBV');
			expect(element.shadowRoot.querySelector('div').innerText).not.toContain('Ref42');

			removeLayer(layer.id);

			expect(element.shadowRoot.querySelector('div').innerText).toContain('Ref42');
			expect(element.shadowRoot.querySelector('div').innerText).not.toContain('LDBV');

			expect(geoServiceMock).toHaveBeenCalledWith(layer.geoResourceId);
			expect(geoServiceMock).toHaveBeenCalledWith(layer2.geoResourceId);
		});
	});
});
