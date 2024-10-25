import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection/index.js';
import { ThreeDimensionButton } from '../../../../../src/modules/map/components/threeDimensionButton/ThreeDimensionButton.js';
import { positionReducer } from '../../../../../src/store/position/position.reducer.js';
window.customElements.define(ThreeDimensionButton.tag, ThreeDimensionButton);

describe('ThreeDimensionButton', () => {
	const environmentService = {
		getWindow: () => {}
	};
	const shareService = {
		getParameters: () => {}
	};
	const coordinateService = {
		toLonLat: () => {}
	};
	const mapService = {
		calcResolution: () => {}
	};

	const setup = async (state = {}) => {
		const initialState = { ...state };

		TestUtils.setupStoreAndDi(initialState, { position: positionReducer });

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('ShareService', shareService)
			.registerSingleton('CoordinateService', coordinateService)
			.registerSingleton('MapService', mapService);

		return await TestUtils.render(ThreeDimensionButton.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new ThreeDimensionButton();

			expect(element.getModel()).toEqual({});
		});
	});

	describe('when initialized', () => {
		it('shows a 3D button', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.three-dimension-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.icon.three-dimension-icon')).toHaveSize(1);
		});
	});

	describe('when button is clicked', () => {
		it('opens the 3D view in an external window', async () => {
			const center3857 = [123, 345];
			const zoom = 8;
			const center4326 = [11.1111111, 22.2222222];
			const resolution = 42;
			const openSpy = jasmine.createSpy();
			const mockWindow = { open: openSpy };
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			spyOn(coordinateService, 'toLonLat').withArgs(center3857).and.returnValue(center4326);
			spyOn(mapService, 'calcResolution').withArgs(zoom, center3857).and.returnValue(resolution);
			const shareServiceSpy = spyOn(shareService, 'getParameters').and.returnValue(new Map());
			const element = await setup({
				position: {
					center: [...center3857],
					zoom
				}
			});
			const button = element.shadowRoot.querySelector('.three-dimension-button');

			button.click();

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(openSpy).toHaveBeenCalledWith('https://cert42.bayern.de/bayernatlas_3d_preview?c=11.11111,22.22222&res=42.0');
		});
	});
});
