import { LayerInfoPanel } from '../../../../src/modules/layerInfo/components/LayerInfoPanel';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { LayerInfoResult } from '../../../../src/modules/layerInfo/services/LayerInfoService';

window.customElements.define(LayerInfoPanel.tag, LayerInfoPanel);

describe('LayerInfoPanel', () => {

	const layerInfoServiceMock = {
		byId() { }
	};

	TestUtils.setupStoreAndDi();
	$injector.registerSingleton('LayerInfoService', layerInfoServiceMock);

	describe('when initialized', () => {

		it('should render the nothing when geoResourceId is null', async () => {

			const element = await TestUtils.render(LayerInfoPanel.tag);

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('should show a layerInfo on the panel', async () => {

			const layerInfo = new LayerInfoResult('<b>content</b>');
			spyOn(layerInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(layerInfo);

			const element = await TestUtils.render(LayerInfoPanel.tag);

			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			element.signal('UPDATE_LAYERINFO', layerInfo);
			const divs = element.shadowRoot.querySelectorAll('div');

			expect(divs.length).toBe(2);
			expect(divs[1].innerText).toBe('content');
		});

		it('should log a warn statement when Altitude Service is not available', async (done) => {

			spyOn(layerInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(Promise.reject(new Error('LayerInfo Error')));
			const warnSpy = spyOn(console, 'warn');

			const element = await TestUtils.render(LayerInfoPanel.tag);
			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			element.signal('UPDATE_LAYERINFO', null);

			setTimeout(() => {
				expect(warnSpy).toHaveBeenCalledWith('LayerInfo Error');
				expect(element.shadowRoot.children.length).toBe(0);
				done();
			});
		});
	});
});
