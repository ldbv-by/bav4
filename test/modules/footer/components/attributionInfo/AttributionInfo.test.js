import { AttributionInfo } from '../../../../../src/modules/footer/components/attributionInfo/AttributionInfo';
import { TestUtils } from '../../../../test-utils.js';
import { layersReducer } from '../../../../../src/modules/map/store/layers.reducer';
import { WMTSGeoResource } from '../../../../../src/services/domain/geoResources'; 
import { $injector } from '../../../../../src/injection';


window.customElements.define(AttributionInfo.tag, AttributionInfo);

describe('AttributionInfo', () => {

	const geoResourceServiceMock = {
		byId: () => { } 
	}; 

	const setup = (state) => {
		TestUtils.setupStoreAndDi(state, { layers: layersReducer });
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

			const wmts = new WMTSGeoResource('someId', 'LDBV42', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const geoServiceMock = spyOn(geoResourceServiceMock, 'byId').withArgs(layer.id).and.returnValue(wmts);

			const element = await setup(state);

			// Not yet implemented so the fallback content is shown
			expect(element.shadowRoot.querySelector('p')).toBeTruthy();
			expect(element.shadowRoot.querySelector('p').innerHTML).toContain('map_attributionInfo_label');
			expect(element.shadowRoot.querySelector('p').innerHTML).toContain('No data available');
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
	});
});