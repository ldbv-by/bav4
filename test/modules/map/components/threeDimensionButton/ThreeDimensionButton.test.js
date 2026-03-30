import { TestUtils } from '@test/test-utils.js';
import { $injector } from '@src/injection/index.js';
import { ThreeDimensionButton } from '@src/modules/map/components/threeDimensionButton/ThreeDimensionButton.js';
import { positionReducer } from '@src/store/position/position.reducer.js';
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

			expect(element.shadowRoot.querySelectorAll('.three-dimension-button')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.icon.three-dimension-icon')).toHaveLength(1);
		});
	});

	describe('when button is clicked', () => {
		it('opens the 3D view in an external window', async () => {
			const center3857 = [123, 345];
			const zoom = 8;
			const center4326 = [11.1111111, 22.2222222];
			const resolution = 42;
			const openSpy = vi.fn();
			const mockWindow = { open: openSpy };
			vi.spyOn(environmentService, 'getWindow').mockReturnValue(mockWindow);
			const coordinateServiceSpy = vi.spyOn(coordinateService, 'toLonLat').mockReturnValue(center4326);
			const mapServiceSpy = vi.spyOn(mapService, 'calcResolution').mockReturnValue(resolution);
			const shareServiceSpy = vi.spyOn(shareService, 'getParameters').mockReturnValue(new Map());
			const element = await setup({
				position: {
					center: [...center3857],
					zoom
				}
			});
			const button = element.shadowRoot.querySelector('.three-dimension-button');

			button.click();

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(openSpy).toHaveBeenCalledWith('https://geodaten.bayern.de/bayernatlas_3d_preview?c=11.11111,22.22222&res=42.0');
			expect(coordinateServiceSpy).toHaveBeenCalledWith(center3857);
			expect(mapServiceSpy).toHaveBeenCalledWith(zoom, center3857);
		});
	});
});
