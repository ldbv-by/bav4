/* eslint-disable no-undef */
import { OlMapContextMenuContent } from '../../../../../../../src/modules/map/components/olMap/handler/contextMenu/OlMapContextMenuContent';
import { TestUtils } from '../../../../../../test-utils';
import { $injector } from '../../../../../../../src/injection';
window.customElements.define(OlMapContextMenuContent.tag, OlMapContextMenuContent);

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
		copyToClipboard() { },
	};
	const altitudeServiceMock = {
		getAltitude() {
		} 
	}; 

	const setup = () => {

		TestUtils.setupStoreAndDi();
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('AltitudeService', altitudeServiceMock);
		return TestUtils.render(OlMapContextMenuContent.tag);
	};

	describe('when initialized', () => {
		it('renders nothing', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});

	describe('when screen coordinate available', () => {
		it('renders the content', async () => {
			const getSridDefinitionsForViewMock = spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42, digits: 7 }]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			const transformMock = spyOn(coordinateServiceMock, 'transform').and.returnValue([21, 21]);
			const stringifyMock = spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');
			const altitudeMock = spyOn(altitudeServiceMock, 'getAltitude').withArgs([1000, 2000]).and.returnValue(42);
			const element = await setup();

			element.coordinate = [1000, 2000];
			//after we set the coordinate, we need to trigger rendering manually in this case
			element.render();

			expect(element.shadowRoot.querySelector('.container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();

			expect(element.shadowRoot.querySelector('.label').innerText).toBe('code42');
			expect(element.shadowRoot.querySelector('.coordinate').innerText).toBe('stringified coordinate');

			expect(element.shadowRoot.querySelectorAll('.label')[1].innerText).toBe('map_olMap_handler_contextMenu_content_altitude_label');
	
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelectorAll('.coordinate')[1].innerText).toEqual('42 (m)');
			});

			const copyIcon = element.shadowRoot.querySelector('ba-icon');
			expect(copyIcon).toBeTruthy();
			copyIcon.click();


			expect(copyToClipboardMock).toHaveBeenCalledWith('21, 21');
			expect(getSridDefinitionsForViewMock).toHaveBeenCalledOnceWith([1000, 2000]);
			expect(transformMock).toHaveBeenCalledOnceWith([1000, 2000], 3857, 42);
			expect(stringifyMock).toHaveBeenCalledOnceWith([21, 21], 42, { digits: 7 });
			expect(altitudeMock).toHaveBeenCalledOnceWith([1000, 2000]);

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
				expect(element.shadowRoot.querySelectorAll('.coordinate')[1].innerText).toEqual('-');
				done();
			});
		});
	});
});