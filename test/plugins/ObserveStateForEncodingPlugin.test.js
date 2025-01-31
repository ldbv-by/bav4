import { $injector } from '../../src/injection';
import { ObserveStateForEncodingPlugin } from '../../src/plugins/ObserveStateForEncodingPlugin';
import { stateForEncodingReducer, initialState } from '../../src/store/stateForEncoding/stateForEncoding.reducer';
import { addLayer } from '../../src/store/layers/layers.action';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { changeCenter, changeRotation, increaseZoom } from '../../src/store/position/position.action';
import { positionReducer } from '../../src/store/position/position.reducer';
import { TestUtils } from '../test-utils';
import { setCategory, setWaypoints } from '../../src/store/routing/routing.action';
import { routingReducer } from '../../src/store/routing/routing.reducer';
import { toolsReducer } from '../../src/store/tools/tools.reducer';
import { setCurrentTool } from '../../src/store/tools/tools.action';
import { updateRatio } from '../../src/store/layerSwipe/layerSwipe.action';
import { layerSwipeReducer } from '../../src/store/layerSwipe/layerSwipe.reducer';

describe('ObserveStateForEncodingPlugin', () => {
	const shareService = {
		encodeState() {}
	};
	const mapService = {
		getMaxZoomLevel: () => 2,
		getMinZoomLevel: () => 0
	};

	const setup = () => {
		const state = {
			encodedState: initialState
		};

		const store = TestUtils.setupStoreAndDi(state, {
			position: positionReducer,
			layers: layersReducer,
			routing: routingReducer,
			tools: toolsReducer,
			layerSwipe: layerSwipeReducer,
			encodedState: stateForEncodingReducer
		});
		$injector.registerSingleton('ShareService', shareService).registerSingleton('MapService', mapService);
		return store;
	};

	it('registers a position.zoom change listener and indicates its changes', async () => {
		const store = setup();
		spyOn(shareService, 'encodeState').and.callFake(() => {
			// let's return a different state each call
			return `state_${Math.random()}`;
		});
		const instanceUnderTest = new ObserveStateForEncodingPlugin();
		await instanceUnderTest.register(store);

		increaseZoom();

		expect(store.getState().encodedState.changed).not.toEqual(initialState.changed);
	});

	it('registers a position.center change listener and indicates its changes', async () => {
		const store = setup();
		spyOn(shareService, 'encodeState').and.callFake(() => {
			// let's return a different state each call
			return `state_${Math.random()}`;
		});
		const instanceUnderTest = new ObserveStateForEncodingPlugin();
		await instanceUnderTest.register(store);

		changeCenter([1, 1]);

		expect(store.getState().encodedState.changed).not.toEqual(initialState.changed);
	});

	it('registers a position.rotation change listener and indicates its changes', async () => {
		const store = setup();
		spyOn(shareService, 'encodeState').and.callFake(() => {
			// let's return a different state each call
			return `state_${Math.random()}`;
		});
		const instanceUnderTest = new ObserveStateForEncodingPlugin();
		await instanceUnderTest.register(store);

		changeRotation(1);

		expect(store.getState().encodedState.changed).not.toEqual(initialState.changed);
	});

	it('register a layers.active change listener and indicates its changes', async () => {
		const store = setup();
		spyOn(shareService, 'encodeState').and.callFake(() => {
			// let's return a different state each call
			return `state_${Math.random()}`;
		});
		const instanceUnderTest = new ObserveStateForEncodingPlugin();
		await instanceUnderTest.register(store);

		addLayer('some');

		expect(store.getState().encodedState.changed).not.toEqual(initialState.changed);
	});

	it('registers a routing.waypoints change listener and indicates its changes', async () => {
		const store = setup();
		spyOn(shareService, 'encodeState').and.callFake(() => {
			// let's return a different state each call
			return `state_${Math.random()}`;
		});
		const instanceUnderTest = new ObserveStateForEncodingPlugin();
		await instanceUnderTest.register(store);

		setWaypoints([
			[1, 2],
			[3, 4]
		]);

		expect(store.getState().encodedState.changed).not.toEqual(initialState.changed);
	});

	it('registers routing.categoryId change listeners and indicates its changes', async () => {
		const store = setup();
		spyOn(shareService, 'encodeState').and.callFake(() => {
			// let's return a different state each call
			return `state_${Math.random()}`;
		});
		const instanceUnderTest = new ObserveStateForEncodingPlugin();
		await instanceUnderTest.register(store);

		setCategory('catId');

		expect(store.getState().encodedState.changed).not.toEqual(initialState.changed);
	});

	it('registers a tool change listener and indicates its changes', async () => {
		const store = setup();
		spyOn(shareService, 'encodeState').and.callFake(() => {
			// let's return a different state each call
			return `state_${Math.random()}`;
		});
		const instanceUnderTest = new ObserveStateForEncodingPlugin();
		await instanceUnderTest.register(store);

		setCurrentTool('someTool');

		expect(store.getState().encodedState.changed).not.toEqual(initialState.changed);
	});

	it('registers a swipeLayer ratio change listener and indicates its changes', async () => {
		const store = setup();
		spyOn(shareService, 'encodeState').and.callFake(() => {
			// let's return a different state each call
			return `state_${Math.random()}`;
		});
		const instanceUnderTest = new ObserveStateForEncodingPlugin();
		await instanceUnderTest.register(store);

		updateRatio(42);

		expect(store.getState().encodedState.changed).not.toEqual(initialState.changed);
	});

	it('indicates its changes in an asynchronous manner after plugin registration is done', async () => {
		const store = setup();
		spyOn(shareService, 'encodeState').and.callFake(() => {
			// let's return a different state each call
			return `state_${Math.random()}`;
		});
		const instanceUnderTest = new ObserveStateForEncodingPlugin();
		await instanceUnderTest.register(store);

		await TestUtils.timeout(0);
		expect(store.getState().encodedState.changed).not.toEqual(initialState.changed);
	});

	it("does nothing when encoded state hasn't changed", async () => {
		const store = setup();
		// We always return the same encoded state from the ShareService,
		spyOn(shareService, 'encodeState').and.returnValue('state');
		const instanceUnderTest = new ObserveStateForEncodingPlugin();
		await instanceUnderTest.register(store);
		await TestUtils.timeout(0);

		// Let's trigger one observer multiple times
		changeCenter([1, 1]);
		const changedPropertyAfterFirstMutation = store.getState().encodedState.changed;
		changeCenter([1, 2]);
		changeCenter([1, 3]);
		changeCenter([1, 4]);

		expect(changedPropertyAfterFirstMutation).toEqual(store.getState().encodedState.changed);
	});
});
