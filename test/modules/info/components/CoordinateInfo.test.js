/* eslint-disable no-undef */

import { $injector } from '../../../../src/injection/index.js';
import { Icon } from '../../../../src/modules/commons/components/icon/Icon.js';
import { CoordinateInfo } from '../../../../src/modules/info/components/coordinateInfo/CoordinateInfo.js';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer.js';
import { TestUtils } from '../../../test-utils.js';
import { GlobalCoordinateRepresentations } from '../../../../src/domain/coordinateRepresentation.js';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action.js';

window.customElements.define(CoordinateInfo.tag, CoordinateInfo);
window.customElements.define(Icon.tag, Icon);

describe('CoordinateInfo', () => {
	const mapServiceMock = {
		getCoordinateRepresentations() {},
		getSrid() {}
	};
	const coordinateServiceMock = {
		stringify() {}
	};
	const shareServiceMock = {
		copyToClipboard() {}
	};

	const elevationServiceMock = {
		getElevation() {}
	};
	const translationServiceMock = {
		translate: (key) => key
	};

	// eslint-disable-next-line no-unused-vars
	let store;

	const setup = () => {
		const state = {
			notifications: {
				notification: null
			}
		};

		store = TestUtils.setupStoreAndDi(state, { notifications: notificationReducer });
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('ElevationService', elevationServiceMock)
			.registerSingleton('TranslationService', translationServiceMock);

		return TestUtils.render(CoordinateInfo.tag);
	};

	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new CoordinateInfo();

			expect(element.getModel()).toEqual({
				coordinate: null,
				elevation: null
			});
		});
		it('takes a coordinate property', async () => {
			await setup();
			const element = new CoordinateInfo();

			element.coordinate = [0, 1];

			expect(element.coordinate).toEqual([0, 1]);
		});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await setup();

			//model
			expect(element.getModel()).toEqual({
				coordinate: null,
				elevation: null
			});
		});

		it('renders nothing', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});

	describe('when coordinate available', () => {
		it('renders the full content', async () => {
			const coordinateMock = [1000, 2000];
			const stringifiedCoord = 'stringified coordinate';
			const elevationMock = spyOn(elevationServiceMock, 'getElevation').withArgs(coordinateMock).and.resolveTo(42);
			const getCoordinateRepresentationsMock = spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([
				GlobalCoordinateRepresentations.WGS84
			]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const stringifyMock = spyOn(coordinateServiceMock, 'stringify').and.returnValue(stringifiedCoord);
			const translationServiceSpy = spyOn(translationServiceMock, 'translate').and.callThrough();
			const element = await setup();

			element.coordinate = [...coordinateMock];

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelectorAll('.container')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_coordinate')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_elevation')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.label')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('.label')[0].innerText).toBe(GlobalCoordinateRepresentations.WGS84.label);
			expect(element.shadowRoot.querySelectorAll('.label')[1].innerText).toBe('info_coordinateInfo_elevation_label');
			expect(element.shadowRoot.querySelectorAll('.coordinate')[0].innerText).toBe(stringifiedCoord);

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			expect(copyIcon).toBeTruthy();
			expect(copyIcon.title).toBe('info_coordinateInfo_copy_icon');
			expect(elevationMock).toHaveBeenCalledOnceWith(coordinateMock);
			expect(getCoordinateRepresentationsMock).toHaveBeenCalledWith([1000, 2000]);
			expect(stringifyMock).toHaveBeenCalledWith(coordinateMock, GlobalCoordinateRepresentations.WGS84);

			expect(translationServiceSpy).toHaveBeenCalledWith(GlobalCoordinateRepresentations.WGS84.label, [], true);
		});

		it('renders the content when elevation is NOT available', async () => {
			const coordinateMock = [1000, 2000];
			const stringifiedCoord = 'stringified coordinate';
			const getCoordinateRepresentationsMock = spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([
				GlobalCoordinateRepresentations.WGS84
			]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const stringifyMock = spyOn(coordinateServiceMock, 'stringify').and.returnValue(stringifiedCoord);

			spyOn(elevationServiceMock, 'getElevation').withArgs(coordinateMock).and.resolveTo(null);
			const element = await setup();

			element.coordinate = [...coordinateMock];

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelectorAll('.r_elevation')).toHaveSize(0);
			expect(getCoordinateRepresentationsMock).toHaveBeenCalledWith([1000, 2000]);
			expect(stringifyMock).toHaveBeenCalledWith(coordinateMock, GlobalCoordinateRepresentations.WGS84);
			expect(element.shadowRoot.querySelectorAll('.r_elevation')).toHaveSize(0);
		});

		it('copies a coordinate to the clipboard', async () => {
			const coordinateMock = [1000, 2000];
			const stringifiedCoord = 'stringified coordinate';
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			spyOn(coordinateServiceMock, 'stringify').and.returnValue(stringifiedCoord);
			const element = await setup();

			element.coordinate = [...coordinateMock];

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith(stringifiedCoord);
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"${stringifiedCoord}" info_coordinateInfo_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('copies the elevation to the clipboard', async () => {
			const coordinateMock = [1000, 2000];
			const expectedElevation = 42;
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			spyOn(elevationServiceMock, 'getElevation').withArgs(coordinateMock).and.resolveTo(expectedElevation);
			const element = await setup();

			element.coordinate = [...coordinateMock];

			await TestUtils.timeout();

			const copyIcon = element.shadowRoot.querySelector(`.r_elevation ${Icon.tag}`);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith(expectedElevation);
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"${expectedElevation}" info_coordinateInfo_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('fires a notification and logs a warn statement when Clipboard API is not available and disables all copyToClipboard buttons', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.reject(new Error('something got wrong')));
			spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();

			element.coordinate = [1000, 2000];

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			expect(copyIcon).toBeTruthy();

			copyIcon.click();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('info_coordinateInfo_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
		});
	});

	describe('ElevationService throws', () => {
		it('resets the model and re-throws the error', async () => {
			await setup();
			const error = new Error('Elevation Error');
			spyOn(elevationServiceMock, 'getElevation').and.rejectWith(error);
			const element = new CoordinateInfo({
				coordinate: null,
				elevation: 12345
			});

			await expectAsync(element._getElevation([1000, 2000])).toBeRejectedWith(error);

			expect(element.getModel()).toEqual({
				coordinate: null,
				elevation: null
			});
		});
	});
});
