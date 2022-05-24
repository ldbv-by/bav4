/* eslint-disable no-undef */
import { MapContextMenuContent } from '../../../../../src/modules/map/components/contextMenu/MapContextMenuContent';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { Icon } from '../../../../../src/modules/commons/components/icon/Icon';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';


window.customElements.define(MapContextMenuContent.tag, MapContextMenuContent);
window.customElements.define(Icon.tag, Icon);

describe('OlMapContextMenuContent', () => {


	const mapServiceMock = {
		getSridDefinitionsForView() { },
		getSrid() { }
	};
	const coordinateServiceMock = {
		stringify() { },
		transform() { }
	};
	const shareServiceMock = {
		copyToClipboard() { }
	};
	const altitudeServiceMock = {
		getAltitude() { }
	};
	const administrationServiceMock = {
		getAdministration() { }
	};
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
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('AltitudeService', altitudeServiceMock)
			.registerSingleton('AdministrationService', administrationServiceMock);
		return TestUtils.render(MapContextMenuContent.tag);
	};

	describe('when initialized', () => {
		it('renders nothing', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});

	describe('when screen coordinate available', () => {

		it('renders the content', async () => {
			const coordinateMock = [1000, 2000];
			const stringifiedCoord = 'stringified coordinate';
			const getSridDefinitionsForViewMock = spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42, digits: 7 }]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const transformMock = spyOn(coordinateServiceMock, 'transform').and.returnValue([21, 21]);
			const stringifyMock = spyOn(coordinateServiceMock, 'stringify').and.returnValue(stringifiedCoord);
			const altitudeMock = spyOn(altitudeServiceMock, 'getAltitude').withArgs(coordinateMock).and.returnValue(42);
			const administrationMock = spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.returnValue({ community: 'LDBV', district: 'Ref42' });
			const element = await setup();

			element.coordinate = coordinateMock;

			expect(element.shadowRoot.querySelector('.container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.label')[0].innerText).toBe('map_contextMenuContent_community_label');
			expect(element.shadowRoot.querySelectorAll('.label')[1].innerText).toBe('map_contextMenuContent_district_label');
			expect(element.shadowRoot.querySelectorAll('.label')[2].innerText).toBe('code42');
			expect(element.shadowRoot.querySelectorAll('.label')[3].innerText).toBe('map_contextMenuContent_altitude_label');

			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelectorAll('.coordinate')[0].innerText).toEqual('LDBV');
				expect(element.shadowRoot.querySelectorAll('.coordinate')[1].innerText).toEqual('Ref42');
				expect(element.shadowRoot.querySelectorAll('.coordinate')[2].innerText).toBe(stringifiedCoord);
				expect(element.shadowRoot.querySelectorAll('.coordinate')[3].innerText).toEqual('42 (m)');
			});

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			expect(copyIcon).toBeTruthy();
			expect(copyIcon.title).toBe('map_contextMenuContent_copy_icon');
			expect(getSridDefinitionsForViewMock).toHaveBeenCalledWith([1000, 2000]);
			expect(transformMock).toHaveBeenCalledWith([1000, 2000], 3857, 42);
			expect(stringifyMock).toHaveBeenCalledWith([21, 21], 42, { digits: 7 });
			expect(altitudeMock).toHaveBeenCalledOnceWith(coordinateMock);
			expect(administrationMock).toHaveBeenCalledOnceWith(coordinateMock);

		});

		it('copies a coordinate to the clipboard', async () => {
			const coordinateMock = [1000, 2000];
			const stringifiedCoord = 'stringified coordinate';
			spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42 }]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			spyOn(coordinateServiceMock, 'transform').and.returnValue([21, 21]);
			spyOn(coordinateServiceMock, 'stringify').and.returnValue(stringifiedCoord);
			spyOn(altitudeServiceMock, 'getAltitude').withArgs(coordinateMock).and.returnValue(42);
			spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.returnValue({ community: 'LDBV', district: 'Ref42' });
			const element = await setup();

			element.coordinate = coordinateMock;

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith(stringifiedCoord);
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"${stringifiedCoord}" map_contextMenuContent_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('fires a notification and logs a warn statement when Clipboard API is not available and disables all copyToClipboard buttons', async () => {
			spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42 }]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.reject(new Error('something got wrong')));
			spyOn(coordinateServiceMock, 'transform').and.returnValue([21, 21]);
			spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();

			element.coordinate = [1000, 2000];

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			expect(copyIcon).toBeTruthy();

			copyIcon.click();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('map_contextMenuContent_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
		});

		it('logs a warn statement when Altitude Service is not available', async () => {
			spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42 }]);
			spyOn(altitudeServiceMock, 'getAltitude').and.returnValue(Promise.reject(new Error('Altitude Error')));
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();

			element.coordinate = [1000, 2000];

			await TestUtils.timeout();
			expect(warnSpy).toHaveBeenCalledWith('Altitude Error');
			expect(element.shadowRoot.querySelectorAll('.coordinate')[3].innerText).toEqual('-');
		});

		it('logs a warn statement when Administration Service is not available', async () => {
			spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42 }]);
			spyOn(administrationServiceMock, 'getAdministration').and.returnValue(Promise.reject(new Error('Administration Error')));
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();

			element.coordinate = [1000, 2000];

			await TestUtils.timeout();
			expect(warnSpy).toHaveBeenCalledWith('Administration Error');
			expect(element.shadowRoot.querySelectorAll('.coordinate')[0].innerText).toEqual('-');
			expect(element.shadowRoot.querySelectorAll('.coordinate')[1].innerText).toEqual('-');
		});
	});
});
