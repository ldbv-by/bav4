import { GeoResourceInfoPanel } from '../../../../src/modules/geoResourceInfo/components/GeoResourceInfoPanel';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { GeoResourceInfoResult } from '../../../../src/modules/geoResourceInfo/services/GeoResourceInfoService';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { Spinner } from '../../../../src/modules/commons/components/spinner/Spinner';

window.customElements.define(GeoResourceInfoPanel.tag, GeoResourceInfoPanel);

describe('GeoResourceInfoPanel', () => {

	const geoResourceInfoServiceMock = {
		byId() { }
	};

	const state = {
		notifications: {
			notification: null
		}
	};

	const store = TestUtils.setupStoreAndDi(state, { notifications: notificationReducer });

	// TestUtils.setupStoreAndDi();
	$injector.registerSingleton('GeoResourceInfoService', geoResourceInfoServiceMock);
	$injector
		.registerSingleton('TranslationService', { translate: (key) => key });

	describe('when initialized', () => {

		it('should render the spinner when geoResourceId is null', async () => {

			const element = await TestUtils.render(GeoResourceInfoPanel.tag);

			const spinner = element.shadowRoot.querySelectorAll(Spinner.tag);

			expect(spinner.length).toBe(1);
		});

		it('should show a geoResourceInfo on the panel', async (done) => {

			const geoResourceInfo = new GeoResourceInfoResult('<b>content</b>');
			spyOn(geoResourceInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(geoResourceInfo);

			const element = await TestUtils.render(GeoResourceInfoPanel.tag);

			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			setTimeout(() => {
				const divs = element.shadowRoot.querySelectorAll('div');

				expect(divs.length).toBe(2);
				expect(divs[1].innerText).toBe('content');
				done();
			});
		});

		it('should return an info text when response is null ', async (done) => {

			spyOn(geoResourceInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(null);

			const element = await TestUtils.render(GeoResourceInfoPanel.tag);

			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			setTimeout(() => {
				const divs = element.shadowRoot.querySelectorAll('div');

				expect(divs.length).toBe(2);
				expect(divs[1].innerText).toBe('geoResourceInfo_empty_geoResourceInfo');
				done();
			});
		});

		it('fires a notification and logs a warn statement when GeoResourceInfoService is not available', async (done) => {

			spyOn(geoResourceInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788')
				.and.returnValue(Promise.reject('geoResourceInfo error object'));
			const warnSpy = spyOn(console, 'warn');

			const element = await TestUtils.render(GeoResourceInfoPanel.tag);
			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('geoResourceInfo_geoResourceInfo_response_error');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				expect(warnSpy).toHaveBeenCalledWith('geoResourceInfo error object');

				const spinner = element.shadowRoot.querySelectorAll(Spinner.tag);
				expect(spinner.length).toBe(1);
				done();
			});
		});
	});
});
