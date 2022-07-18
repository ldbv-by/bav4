import { $injector } from '../../src/injection';
import { HistoryStatePlugin } from '../../src/plugins/HistoryStatePlugin';
import { addLayer } from '../../src/store/layers/layers.action';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { changeCenter, changeRotation, increaseZoom } from '../../src/store/position/position.action';
import { positionReducer } from '../../src/store/position/position.reducer';
import { TestUtils } from '../test-utils';

describe('HistoryState', () => {

	const shareService = {
		encodeState() { }
	};
	const environmentService = {
		getWindow: () => { }
	};
	const mapService = {
		getMaxZoomLevel: () => 1,
		getMinZoomLevel: () => 0
	};

	const setup = () => {

		const state = {
			position: {
				zoom: 0,
				pointerPosition: [0, 0],
				rotation: 0
			}
		};

		const store = TestUtils.setupStoreAndDi(state, {
			position: positionReducer,
			layers: layersReducer
		});
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('ShareService', shareService)
			.registerSingleton('MapService', mapService);
		return store;
	};

	it('registers postion.zoom change listeners and updates the window history state', async () => {
		const expectedEncodedState = 'foo';
		const mockHistory = { replaceState: () => {} };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new HistoryStatePlugin();
		await instanceUnderTest.register(store);

		increaseZoom();

		expect(historySpy).toHaveBeenCalledWith(null, '', expectedEncodedState);
		await TestUtils.timeout(0);
	});

	it('registers postion.center change listeners and updates the window history state', async () => {
		const expectedEncodedState = 'foo';
		const mockHistory = { replaceState: () => {} };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new HistoryStatePlugin();
		await instanceUnderTest.register(store);

		changeCenter([1, 1]);

		expect(historySpy).toHaveBeenCalledWith(null, '', expectedEncodedState);
		await TestUtils.timeout(0);
	});


	it('registers postion.rotation change listeners and updates the window history state', async () => {
		const expectedEncodedState = 'foo';
		const mockHistory = { replaceState: () => {} };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new HistoryStatePlugin();
		await instanceUnderTest.register(store);

		changeRotation(1);

		expect(historySpy).toHaveBeenCalledWith(null, '', expectedEncodedState);
		await TestUtils.timeout(0);
	});

	it('registers layers.active change listeners and updates the window history state', async () => {
		const expectedEncodedState = 'foo';
		const mockHistory = { replaceState: () => {} };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new HistoryStatePlugin();
		await instanceUnderTest.register(store);

		addLayer('some');

		expect(historySpy).toHaveBeenCalledWith(null, '', expectedEncodedState);
		await TestUtils.timeout(0);
	});

	it('updates the window history state in an asynchronous manner after plugin registration is done', async () => {
		const expectedEncodedState = 'foo';
		const mockHistory = { replaceState: () => {} };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new HistoryStatePlugin();
		await instanceUnderTest.register(store);


		await TestUtils.timeout(0);
		expect(historySpy).toHaveBeenCalledWith(null, '', expectedEncodedState);
	});
});
