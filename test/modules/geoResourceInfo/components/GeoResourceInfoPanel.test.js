import { GeoResourceInfoPanel } from '../../../../src/modules/geoResourceInfo/components/GeoResourceInfoPanel';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { GeoResourceInfoResult } from '../../../../src/modules/geoResourceInfo/services/GeoResourceInfoService';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { Spinner } from '../../../../src/modules/commons/components/spinner/Spinner';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';

window.customElements.define(GeoResourceInfoPanel.tag, GeoResourceInfoPanel);

describe('GeoResourceInfoPanel', () => {
	const geoResourceInfoServiceMock = {
		byId() {}
	};

	let store;
	const setup = (state) => {
		const initialState = {
			notifications: {
				notification: null
			},
			media: {
				portrait: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, { notifications: notificationReducer, media: createNoInitialStateMediaReducer() });
		$injector.registerSingleton('GeoResourceInfoService', geoResourceInfoServiceMock);
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(GeoResourceInfoPanel.tag);
	};

	describe('when initialized', () => {
		it('should render the spinner when geoResourceId is null', async () => {
			const element = await setup();

			const spinner = element.shadowRoot.querySelectorAll(Spinner.tag);

			expect(spinner.length).toBe(1);
		});

		it('should show a geoResourceInfo on the panel', async () => {
			const geoResourceInfo = new GeoResourceInfoResult('<b>content</b>');
			spyOn(geoResourceInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(geoResourceInfo);

			const element = await setup();

			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			await TestUtils.timeout();
			const divs = element.shadowRoot.querySelectorAll('div');

			expect(divs.length).toBe(2);
			expect(divs[1].innerText).toBe('content');
		});

		it('should show a geoResourceInfo with selectable content', async () => {
			// HINT: the existence of the behavior (user select text) is driven by css-classes specified in main.css and baElement.css.
			// All elements are not selectable by default, but can be activated with the 'selectable' class.
			const cssClass = 'selectable';
			const geoResourceInfo = new GeoResourceInfoResult('<b>content</b>');
			spyOn(geoResourceInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(geoResourceInfo);

			const element = await setup();

			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			await TestUtils.timeout();
			const divs = element.shadowRoot.querySelectorAll('div');

			expect(divs.length).toBe(2);
			expect(divs[1].classList.contains(cssClass)).toBeTrue();
		});

		it('should return an info text when response is null ', async () => {
			spyOn(geoResourceInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(null);

			const element = await setup();

			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			await TestUtils.timeout();
			const divs = element.shadowRoot.querySelectorAll('div');

			expect(divs.length).toBe(2);
			expect(divs[1].innerText).toBe('geoResourceInfo_empty_geoResourceInfo');
		});

		it('fires a notification and logs a warn statement when GeoResourceInfoService is not available', async () => {
			spyOn(geoResourceInfoServiceMock, 'byId')
				.withArgs('914c9263-5312-453e-b3eb-5104db1bf788')
				.and.returnValue(Promise.reject('geoResourceInfo error object'));
			const errorSpy = spyOn(console, 'error');

			const element = await setup();
			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('geoResourceInfo_geoResourceInfo_response_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
			expect(errorSpy).toHaveBeenCalledWith('geoResourceInfo error object');

			const spinner = element.shadowRoot.querySelectorAll(Spinner.tag);
			expect(spinner.length).toBe(1);
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const geoResourceInfo = new GeoResourceInfoResult('<b>content</b>');
			spyOn(geoResourceInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(geoResourceInfo);
			const element = await setup(state);
			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
		});

		it('layouts for portrait', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const geoResourceInfo = new GeoResourceInfoResult('<b>content</b>');
			spyOn(geoResourceInfoServiceMock, 'byId').withArgs('914c9263-5312-453e-b3eb-5104db1bf788').and.returnValue(geoResourceInfo);
			const element = await setup(state);
			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
		});
	});
});
