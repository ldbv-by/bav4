import { AttributionInfo } from '../../../../../src/modules/map/components/attributionInfo/AttributionInfo';
import { TestUtils } from '../../../../test-utils.js';
import { layersReducer, createDefaultLayerProperties } from '../../../../../src/store/layers/layers.reducer';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { addLayer, removeLayer, modifyLayer } from '../../../../../src/store/layers/layers.action';
import { changeZoom } from '../../../../../src/store/position/position.action';
import { WMTSGeoResource } from '../../../../../src/services/domain/geoResources';
import { $injector } from '../../../../../src/injection';
import { getMinimalAttribution } from '../../../../../src/services/provider/attribution.provider';


window.customElements.define(AttributionInfo.tag, AttributionInfo);

describe('AttributionInfo', () => {

	const geoResourceServiceMock = {
		byId: () => { }
	};

	const setup = (state) => {
		TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			position: positionReducer
		});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceMock);
		return TestUtils.render(AttributionInfo.tag);
	};

	describe('when initialized', () => {
		it('renders AttributionInfo component', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0' };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const wmts = new WMTSGeoResource('someId', 'LDBV42', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const attribution = [42, 21];
			wmts.setAttribution(attribution);

			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.id).and.returnValue(wmts);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.attribution-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.attribution-container').innerText).toEqual('© map_attributionInfo_label: ' + attribution);
			expect(element.shadowRoot.querySelector('.collapse-button')).toBeTruthy();

			expect(geoServiceMock).toHaveBeenCalledOnceWith(layer.id);
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

		it('renders no content when geo resource could not be fetched', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0' };
			const state = {
				layers: {
					active: [layer]
				}
			};
			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.id).and.returnValue(null);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.attribution-container').innerText).toEqual('© map_attributionInfo_label:');
			expect(geoServiceMock).toHaveBeenCalledOnceWith(layer.id);
			expect(element.shadowRoot.querySelector('.is-collapse')).toBeFalsy();
		});

		it('renders no content when no attribution provided', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0' };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const wmts = new WMTSGeoResource('someId', 'someLabel', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.id).and.returnValue(wmts);

			const getAttrMock = spyOn(wmts, 'getAttribution').and.returnValue(null);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.attribution-container').innerText).toEqual('© map_attributionInfo_label:');

			expect(geoServiceMock).toHaveBeenCalledOnceWith(layer.id);
			expect(getAttrMock).toHaveBeenCalledOnceWith(12);
			expect(element.shadowRoot.querySelector('.is-collapse')).toBeFalsy();
		});

		it('renders no content when no visible layers are available', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', visible: false };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const wmts = new WMTSGeoResource('someId', 'someLabel', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.id).and.returnValue(wmts);


			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.attribution-container').innerText).toEqual('© map_attributionInfo_label:');

			expect(geoServiceMock).not.toHaveBeenCalledOnceWith(layer.id);
			expect(element.shadowRoot.querySelector('.is-collapse')).toBeFalsy();
		});

		it('updates AttributionInfo component on layer action', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', zIndex: 0 };
			const layer2 = { ...createDefaultLayerProperties(), id: 'id1', label: 'label1', zIndex: 0 };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const arrayAttribution1 = ['LDBV', 'Ref42'];
			const arrayAttribution2 = ['foo', 'baz'];

			const wmts = new WMTSGeoResource('someId', 'someLabel', 'https://some{1-2}/layer/{z}/{x}/{y}');
			wmts.setAttribution(arrayAttribution1);
			const wmts2 = new WMTSGeoResource('someId2', 'someLabel2', 'https://some{1-2}/layer/{z}/{x}/{y}');
			wmts2.setAttribution(arrayAttribution2);

			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId');
			geoServiceMock.withArgs(layer.id).and.returnValue(wmts);
			geoServiceMock.withArgs(layer2.id).and.returnValue(wmts2);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.attribution-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).toContain(arrayAttribution1);
			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).not.toContain(arrayAttribution2);
			expect(element.shadowRoot.querySelector('.is-collapse')).toBeFalsy();

			addLayer(layer2.id, layer2);

			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).toContain(arrayAttribution2);
			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).toContain(arrayAttribution1);
			expect(element.shadowRoot.querySelector('.is-collapse')).toBeTruthy();

			modifyLayer(layer.id, { zIndex: 0 });

			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).toContain(arrayAttribution1);
			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).toContain(arrayAttribution2);
			expect(element.shadowRoot.querySelector('.is-collapse')).toBeTruthy();

			removeLayer(layer.id);

			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).toContain(arrayAttribution2);
			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).not.toContain(arrayAttribution1);
			expect(element.shadowRoot.querySelector('.is-collapse')).toBeFalsy();


			expect(geoServiceMock).toHaveBeenCalledWith(layer.id);
			expect(geoServiceMock).toHaveBeenCalledWith(layer2.id);
		});

		it('does not show duplicate attribution', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', zIndex: 0 };
			const layer2 = { ...createDefaultLayerProperties(), id: 'id1', label: 'label1', zIndex: 0 };
			const state = {
				layers: {
					active: [layer, layer2]
				},
				position: {
					zoom: 12
				}
			};

			const arrayAttribution = ['LDBV', 'Ref42'];

			const wmts = new WMTSGeoResource('someId', 'someLabel', 'https://some{1-2}/layer/{z}/{x}/{y}');
			wmts.setAttribution(arrayAttribution);

			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId');
			geoServiceMock.withArgs(layer.id).and.returnValue(wmts);
			geoServiceMock.withArgs(layer2.id).and.returnValue(wmts);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.attribution-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.attribution-container').innerText).toEqual('© map_attributionInfo_label: ' + arrayAttribution);

			expect(geoServiceMock).toHaveBeenCalledWith(layer.id);
			expect(geoServiceMock).toHaveBeenCalledWith(layer2.id);
		});

		it('updates AttributionInfo component on zoom change', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', zIndex: 0 };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const wmts = new WMTSGeoResource('someId', 'someLabel', 'https://some{1-2}/layer/{z}/{x}/{y}');

			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId');
			geoServiceMock.withArgs(layer.id).and.returnValue(wmts);

			const attribution1 = getMinimalAttribution('Ref42');
			const attribution2 = getMinimalAttribution('LDBV');
			const arrayAttr12 = [attribution1, attribution2];

			const attribution11 = getMinimalAttribution('baz');
			const attribution21 = getMinimalAttribution('foo');
			const arrayAttr11 = [attribution11, attribution21];

			const getAttrMock = spyOn(wmts, 'getAttribution');
			getAttrMock.withArgs(12).and.returnValue(arrayAttr12);
			getAttrMock.withArgs(11).and.returnValue(arrayAttr11);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.attribution-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).toContain('Ref42');
			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).toContain('LDBV');

			changeZoom(11);

			expect(element.shadowRoot.querySelector('.attribution-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).toContain('baz');
			expect(element.shadowRoot.querySelector('.attribution-container').innerHTML).toContain('foo');

			expect(geoServiceMock).toHaveBeenCalledWith(layer.id);
			expect(getAttrMock).toHaveBeenCalledWith(11);
			expect(getAttrMock).toHaveBeenCalledWith(12);
		});

		it('renders link when attribution.url parameter provided', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', zIndex: 0 };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const wmts = new WMTSGeoResource('someId', 'someLabel', 'https://some{1-2}/layer/{z}/{x}/{y}');

			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId');
			geoServiceMock.withArgs(layer.id).and.returnValue(wmts);

			const attribution = { copyright: { label: 'Ref42', url: 'https://ima/link' } };

			const getAttrMock = spyOn(wmts, 'getAttribution');
			getAttrMock.withArgs(12).and.returnValue([attribution]);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('a')).toBeTruthy();
			expect(element.shadowRoot.querySelector('a').innerText).toEqual(attribution.copyright.label);
			expect(element.shadowRoot.querySelector('a').href).toEqual(attribution.copyright.url);

			expect(geoServiceMock).toHaveBeenCalledWith(layer.id);
			expect(getAttrMock).toHaveBeenCalledWith(12);
		});

		it('renders text when attribution.url parameter is not provided', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', zIndex: 0 };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const wmts = new WMTSGeoResource('someId', 'someLabel', 'https://some{1-2}/layer/{z}/{x}/{y}');

			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId');
			geoServiceMock.withArgs(layer.id).and.returnValue(wmts);

			const getAttrMock = spyOn(wmts, 'getAttribution');
			getAttrMock.withArgs(12).and.returnValue([getMinimalAttribution('Ref42')]);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('a')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.attribution-container').innerText).toContain('Ref42');

			expect(geoServiceMock).toHaveBeenCalledWith(layer.id);
			expect(getAttrMock).toHaveBeenCalledWith(12);
		});

		it('renders link and label', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', zIndex: 0 };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};

			const wmts = new WMTSGeoResource('someId', 'someLabel', 'https://some{1-2}/layer/{z}/{x}/{y}');

			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId');
			geoServiceMock.withArgs(layer.id).and.returnValue(wmts);

			const attribution1 = { copyright: { label: 'Ref42', url: 'https://ima/link' } };
			const attribution2 = getMinimalAttribution('LDBV');

			const getAttrMock = spyOn(wmts, 'getAttribution');
			getAttrMock.withArgs(12).and.returnValue([attribution1, attribution2]);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('a')).toBeTruthy();
			expect(element.shadowRoot.querySelector('a').innerText).toEqual(attribution1.copyright.label);
			expect(element.shadowRoot.querySelector('a').href).toEqual(attribution1.copyright.url);

			expect(element.shadowRoot.querySelector('.attribution-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.attribution-container').innerText).toContain(attribution2.copyright.label);

			expect(geoServiceMock).toHaveBeenCalledWith(layer.id);
			expect(getAttrMock).toHaveBeenCalledWith(12);

		});

		it('show and hide collapse on click', async () => {
			const layer = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0' };
			const state = {
				layers: {
					active: [layer]
				},
				position: {
					zoom: 12
				}
			};
			const wmts = new WMTSGeoResource('someId', 'LDBV42', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const attribution = [42, 21];
			wmts.setAttribution(attribution);
			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.attribution-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.isopen')).toBeFalsy();

			const toggle = element.shadowRoot.querySelector('.collapse-button');
			toggle.click();

			expect(element.shadowRoot.querySelector('.isopen')).toBeTruthy();

			toggle.click();

			expect(element.shadowRoot.querySelector('.isopen')).toBeFalsy();
		});
	});
});
