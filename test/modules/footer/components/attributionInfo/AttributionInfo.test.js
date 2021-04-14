import { AttributionInfo } from '../../../../../src/modules/footer/components/attributionInfo/AttributionInfo';
import { TestUtils } from '../../../../test-utils.js';
import { layersReducer, defaultLayerProperties } from '../../../../../src/modules/map/store/layers.reducer';
import { positionReducer } from '../../../../../src/modules/map/store/position.reducer'; 
import { addLayer, removeLayer, modifyLayer } from '../../../../../src/modules/map/store/layers.action';
import { $injector } from '../../../../../src/injection';


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
			const layer = { id:'id0', label:'label0', visible: true, zIndex:0, opacity:1, collapsed:true };
			const state = {
				layers: {
					active: [layer]
				}
			};

			// WMTSGeoResource with added attribution field, could look like this in the future
			const mockedWmts = { id: 'someId', label: 'LDBV', url: 'https://some{1-2}/layer/{z}/{x}/{y}', attribution: 'Ref42' }; 
			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.id).and.returnValue(mockedWmts);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('p')).toBeTruthy();
			expect(element.shadowRoot.querySelector('p').innerHTML).toContain('map_attributionInfo_label');
			expect(element.shadowRoot.querySelector('p').innerHTML).toContain('Ref42');
			expect(geoServiceMock).toHaveBeenCalledOnceWith(layer.id);
		});

		it('renders nothing when no layers are set', async  () => {
			const stateEmpty = {
				layers: {
					active: []
				}
			};

			const element = await setup(stateEmpty);

			expect(element.shadowRoot.querySelector('p')).toBeFalsy();
		});

		it('renders nothing when geo resource could not be fetched', async  () => {
			const layer = { id:'id0', label:'label0', visible: true, zIndex:0, opacity:1, collapsed:true };
			const state = {
				layers: {
					active: [layer]
				}
			};
			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.id).and.returnValue(null);

			const element = await setup(state);			

			expect(element.shadowRoot.querySelector('p')).toBeFalsy();
			expect(geoServiceMock).toHaveBeenCalledOnceWith(layer.id);
		});

		it('updates BaseLayerInfo component', async ()  => {
			const layer = { ...defaultLayerProperties, id:'id0', label:'label0', zIndex:0 };
			const layer2 = { ...defaultLayerProperties, id:'id1', label:'label1', zIndex: 0 }; 
			const state = {
				layers: {
					active: [layer]
				}
			};

			const mockedWmts = { id: 'id1', label: 'Label21', url: 'https://some{1-2}/layer/{z}/{x}/{y}', attribution: 'LDBV' }; 
			const mockedWmts2 = { id: 'id2', label: 'Label42', url: 'https://some{1-2}/layer/{z}/{x}/{y}', attribution: 'Ref42' }; 

			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId');
			geoServiceMock.withArgs(layer.id).and.returnValue(mockedWmts);
			geoServiceMock.withArgs(layer2.id).and.returnValue(mockedWmts2);

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('p')).toBeTruthy();
			expect(element.shadowRoot.querySelector('p').innerHTML).toContain('LDBV');
			expect(element.shadowRoot.querySelector('p').innerHTML).not.toContain('Ref42');

			addLayer(layer2.id, layer2);

			expect(element.shadowRoot.querySelector('p')).toBeTruthy();
			expect(element.shadowRoot.querySelector('p').innerHTML).toContain('Ref42');
			expect(element.shadowRoot.querySelector('p').innerHTML).not.toContain('LDBV');

			modifyLayer(layer.id, { zIndex: 0 });

			expect(element.shadowRoot.querySelector('p')).toBeTruthy();
			expect(element.shadowRoot.querySelector('p').innerHTML).toContain('LDBV');
			expect(element.shadowRoot.querySelector('p').innerHTML).not.toContain('Ref42');

			removeLayer(layer.id);

			expect(element.shadowRoot.querySelector('p')).toBeTruthy();
			expect(element.shadowRoot.querySelector('p').innerHTML).toContain('Ref42');
			expect(element.shadowRoot.querySelector('p').innerHTML).not.toContain('LDBV');
			
			expect(geoServiceMock).toHaveBeenCalledWith(layer.id);
			expect(geoServiceMock).toHaveBeenCalledWith(layer2.id);
		}); 
	});
});