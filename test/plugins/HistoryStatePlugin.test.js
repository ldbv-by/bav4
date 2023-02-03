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
		getWindow: () => { },
		isEmbedded: () => { }
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
		const mockHistory = { replaceState: () => { } };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
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
		const mockHistory = { replaceState: () => { } };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
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
		const mockHistory = { replaceState: () => { } };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
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
		const mockHistory = { replaceState: () => { } };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
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
		const mockHistory = { replaceState: () => { } };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
		spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new HistoryStatePlugin();
		await instanceUnderTest.register(store);

		await TestUtils.timeout(0);
		expect(historySpy).toHaveBeenCalledWith(null, '', expectedEncodedState);
	});

	it('does nothing when encoded state has\'nt changed', async () => {
		const expectedEncodedState = 'foo';
		const mockHistory = { replaceState: () => { } };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
		spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new HistoryStatePlugin();
		await instanceUnderTest.register(store);
		await TestUtils.timeout(0);

		// Let's trigger one observer multiple times
		changeCenter([1, 1]);
		changeCenter([1, 2]);
		changeCenter([1, 3]);
		changeCenter([1, 4]);

		// We always return the same encoded state from the ShareService,
		// so the history API should be called only once
		expect(historySpy).toHaveBeenCalledOnceWith(null, '', expectedEncodedState);
	});

	it('does nothing when we are in \'embed\' mode', async () => {
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const store = setup();
		const instanceUnderTest = new HistoryStatePlugin();
		const updateHistorySpy = spyOn(instanceUnderTest, '_updateHistory');
		await instanceUnderTest.register(store);

		await TestUtils.timeout(0);
		expect(updateHistorySpy).not.toHaveBeenCalled();
	});
});
