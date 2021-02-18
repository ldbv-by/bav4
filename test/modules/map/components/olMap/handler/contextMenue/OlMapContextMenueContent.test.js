/* eslint-disable no-undef */
import { OlMapContextMenueContent } from '../../../../../../../src/modules/map/components/olMap/handler/contextMenue/OlMapContextMenueContent';
// import { initialState, mapContextMenueReducer } from '../../../../../src/modules/map/store/mapContextMenue.reducer';
import { TestUtils } from '../../../../../../test-utils';
// import { close, open } from '../../../../../src/modules/map/store/mapContextMenue.action';
import { $injector } from '../../../../../../../src/injection';
window.customElements.define(OlMapContextMenueContent.tag, OlMapContextMenueContent);

describe('OlMapContextMenueContent', () => {


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

	const setup = () => {

		TestUtils.setupStoreAndDi();
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(OlMapContextMenueContent.tag);
	};

	describe('when initialized', () => {
		it('renders nothing', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});

	describe('when screen coordinate available', () => {
		it('renders the content', async () => {
			const getSridDefinitionsForViewMock = spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42 }]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard');
			const transformMock =  spyOn(coordinateServiceMock, 'transform').and.returnValue([21, 21]);
			const stringifyMock = spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');
			const element = await setup();

			element.coordinate = [1000, 2000];
			//after we set the coordinate, we need to trigger rendering manually in this case
			element.render();

			expect(element.shadowRoot.querySelector('.container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();
			
			expect(element.shadowRoot.querySelector('.label').innerText).toBe('code42');
			expect(element.shadowRoot.querySelector('.coordinate').innerText).toBe('stringified coordinate');
			const copyIcon = element.shadowRoot.querySelector('ba-icon'); 
			expect(copyIcon).toBeTruthy();
			copyIcon.click();

			
			expect(copyToClipboardMock).toHaveBeenCalledWith('21, 21');
			expect(getSridDefinitionsForViewMock).toHaveBeenCalledOnceWith([1000, 2000]);
			expect(transformMock).toHaveBeenCalledOnceWith([1000, 2000], 3857, 42);
			expect(stringifyMock).toHaveBeenCalledOnceWith([21, 21], 42);

		});

		it('copies a coordinate to the clipboard', async () => {
			spyOn(mapServiceMock, 'getSridDefinitionsForView').and.returnValue([{ label: 'code42', code: 42 }]);
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard');
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
	});
});