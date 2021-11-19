import { LayerInfoPanel } from '../../../../src/modules/layerInfo/components/LayerInfoPanel';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { LayerInfoResult } from '../../../../src/modules/layerInfo/services/LayerInfoService';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { Spinner } from '../../../../src/modules/commons/components/spinner/Spinner';

window.customElements.define(LayerInfoPanel.tag, LayerInfoPanel);

describe('LayerInfoPanel', () => {

	const layerInfoServiceMock = {
		byId() { }
	};

	const state = {
		notifications: {
			notification: null
		}
	};

	const store = TestUtils.setupStoreAndDi(state, { notifications: notificationReducer });

	// TestUtils.setupStoreAndDi();
	$injector.registerSingleton('LayerInfoService', layerInfoServiceMock);
	$injector
		.registerSingleton('TranslationService', { translate: (key) => key });

	describe('when initialized', () => {

		it('should render the spinner when geoResourceId is null', async () => {

			const element = await TestUtils.render(LayerInfoPanel.tag);

			const spinner = element.shadowRoot.querySelectorAll(Spinner.tag);

			expect(spinner.length).toBe(1);
		});

		it('should show a layerInfo on the panel', async (done) => {

			const layerInfo = new LayerInfoResult('<b>content</b>');
			spyOn(layerInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(layerInfo);

			const element = await TestUtils.render(LayerInfoPanel.tag);

			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			setTimeout(() => {
				const divs = element.shadowRoot.querySelectorAll('div');

				expect(divs.length).toBe(2);
				expect(divs[1].innerText).toBe('content');
				done();
			});
		});

		it('should return an info text when response is null ', async (done) => {

			spyOn(layerInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(null);

			const element = await TestUtils.render(LayerInfoPanel.tag);

			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			setTimeout(() => {
				const divs = element.shadowRoot.querySelectorAll('div');

				expect(divs.length).toBe(2);
				expect(divs[1].innerText).toBe('layerinfo_empty_layerInfo');
				done();
			});
		});

		it('fires a notification and logs a warn statement when LayerInfoService is not available', async (done) => {

			spyOn(layerInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788')
				.and.returnValue(Promise.reject('layerInfo error object'));
			const warnSpy = spyOn(console, 'warn');

			const element = await TestUtils.render(LayerInfoPanel.tag);
			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('layerinfo_layerInfo_response_error');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				expect(warnSpy).toHaveBeenCalledWith('layerInfo error object');

				const spinner = element.shadowRoot.querySelectorAll(Spinner.tag);
				expect(spinner.length).toBe(1);
				done();
			});
		});
	});
});
