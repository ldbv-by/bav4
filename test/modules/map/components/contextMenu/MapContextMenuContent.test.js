/* eslint-disable no-undef */
import { MapContextMenuContent } from '../../../../../src/modules/map/components/contextMenu/MapContextMenuContent';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
window.customElements.define(MapContextMenuContent.tag, MapContextMenuContent);

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
		getAltitude() {	}
	};
	const administrationServiceMock = {
		getAdministration() { }
	};

	const setup = () => {

		TestUtils.setupStoreAndDi();
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
			const getSridDefinitionsForViewMock = spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42, digits: 7 }]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			const transformMock = spyOn(coordinateServiceMock, 'transform').and.returnValue([21, 21]);
			const stringifyMock = spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');
			const altitudeMock = spyOn(altitudeServiceMock, 'getAltitude').withArgs(coordinateMock).and.returnValue(42);
			const administrationMock = spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.returnValue({ community: 'LDBV', district: 'Ref42' });
			const element = await setup();

			element.coordinate = coordinateMock;
			//after we set the coordinate, we need to trigger rendering manually in this case
			element.render();

			expect(element.shadowRoot.querySelector('.container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();

			expect(element.shadowRoot.querySelectorAll('.label')[0].innerText).toBe('map_contextMenuContent_community_label');
			expect(element.shadowRoot.querySelectorAll('.label')[1].innerText).toBe('map_contextMenuContent_district_label');
			expect(element.shadowRoot.querySelectorAll('.label')[2].innerText).toBe('code42');
			expect(element.shadowRoot.querySelectorAll('.label')[3].innerText).toBe('map_contextMenuContent_altitude_label');

			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelectorAll('.coordinate')[0].innerText).toEqual('LDBV');
				expect(element.shadowRoot.querySelectorAll('.coordinate')[1].innerText).toEqual('Ref42');
				expect(element.shadowRoot.querySelectorAll('.coordinate')[2].innerText).toBe('stringified coordinate');
				expect(element.shadowRoot.querySelectorAll('.coordinate')[3].innerText).toEqual('42 (m)');
			});

			const copyIcon = element.shadowRoot.querySelector('ba-icon');
			expect(copyIcon).toBeTruthy();
			expect(copyIcon.title).toBe('map_contextMenuContent_copy_icon');
			copyIcon.click();


			expect(copyToClipboardMock).toHaveBeenCalledWith('21, 21');
			expect(getSridDefinitionsForViewMock).toHaveBeenCalledOnceWith([1000, 2000]);
			expect(transformMock).toHaveBeenCalledOnceWith([1000, 2000], 3857, 42);
			expect(stringifyMock).toHaveBeenCalledOnceWith([21, 21], 42, { digits: 7 });
			expect(altitudeMock).toHaveBeenCalledOnceWith(coordinateMock);
			expect(administrationMock).toHaveBeenCalledOnceWith(coordinateMock);

		});

		it('copies a coordinate to the clipboard', async () => {
			spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42 }]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			spyOn(coordinateServiceMock, 'transform').and.returnValue([21, 21]);
			spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');
			const element = await setup();

			element.coordinate = [1000, 2000];
			//after we set the coordinate, we need to trigger rendering manually in this case
			element.render();
			const copyIcon = element.shadowRoot.querySelector('ba-icon');
			expect(copyIcon).toBeTruthy();
			copyIcon.click();


			expect(copyToClipboardMock).toHaveBeenCalledWith('21, 21');
		});

		it('logs a warn statement when Clipboard API is not available', async (done) => {
			spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42 }]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.reject(new Error('something got wrong')));
			spyOn(coordinateServiceMock, 'transform').and.returnValue([21, 21]);
			spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();

			element.coordinate = [1000, 2000];
			//after we set the coordinate, we need to trigger rendering manually in this case
			element.render();
			const copyIcon = element.shadowRoot.querySelector('ba-icon');
			expect(copyIcon).toBeTruthy();
			copyIcon.click();

			setTimeout(() => {
				expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
				done();
			});
		});

		it('logs a warn statement when Altitude Service is not available', async  (done) => {
			spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42 }]);
			spyOn(altitudeServiceMock, 'getAltitude').and.returnValue(Promise.reject(new Error('Altitude Error')));
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();

			element.coordinate = [1000, 2000];

			setTimeout(() => {
				expect(warnSpy).toHaveBeenCalledWith('Altitude Error');
				expect(element.shadowRoot.querySelectorAll('.coordinate')[3].innerText).toEqual('-');
				done();
			});
		});

		it('logs a warn statement when Administration Service is not available', async  (done) => {
			spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42 }]);
			spyOn(administrationServiceMock, 'getAdministration').and.returnValue(Promise.reject(new Error('Administration Error')));
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();

			element.coordinate = [1000, 2000];

			setTimeout(() => {
				expect(warnSpy).toHaveBeenCalledWith('Administration Error');
				expect(element.shadowRoot.querySelectorAll('.coordinate')[0].innerText).toEqual('-');
				expect(element.shadowRoot.querySelectorAll('.coordinate')[1].innerText).toEqual('-');
				done();
			});
		});
	});
});
