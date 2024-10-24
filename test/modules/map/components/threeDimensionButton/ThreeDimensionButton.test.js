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

	const setup = async () => {
		const state = {};

		TestUtils.setupStoreAndDi(state, { position: positionReducer });

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('ShareService', shareService)
			.registerSingleton('CoordinateService', coordinateService);

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
		it('it opens the 3D view in an external window', async () => {
			const openSpy = jasmine.createSpy();
			const mockWindow = { open: openSpy };
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const coord4326 = [11.1111111, 22.2222222];
			spyOn(coordinateService, 'toLonLat').and.returnValue(coord4326);
			const shareServiceSpy = spyOn(shareService, 'getParameters').and.returnValue(new Map());
			const element = await setup();
			const button = element.shadowRoot.querySelector('.three-dimension-button');

			button.click();

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(openSpy).toHaveBeenCalledWith('https://cert42.bayern.de/bayernatlas_3d_preview?c=11.11111,22.22222');
		});
	});
});
