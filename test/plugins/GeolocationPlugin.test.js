import { GeolocationPlugin, GEOLOCATION_LAYER_ID } from '@src/plugins/GeolocationPlugin';
import { activate, deactivate, setTracking } from '@src/store/geolocation/geolocation.action';
import { TestUtils } from '@test/test-utils.js';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { $injector } from '@src/injection';
import { positionReducer } from '@src/store/position/position.reducer';
import { geolocationReducer } from '@src/store/geolocation/geolocation.reducer';
import { pointerReducer } from '@src/store/pointer/pointer.reducer';
import { setBeingDragged } from '@src/store/pointer/pointer.action';
import { QueryParameters } from '@src/domain/queryParameters.js';

describe('GeolocationPlugin', () => {
	const coordinateServiceMock = {
		fromLonLat() {},
		transformExtent() {},
		buffer() {}
	};

	const mapServiceMock = {
		getLocalProjectedSrid() {},
		getSrid() {}
	};

	const translationService = {
		translate: (key) => key
	};

	const environmentService = {
		getQueryParams: () => new URLSearchParams()
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			pointer: pointerReducer,
			geolocation: geolocationReducer,
			layers: layersReducer,
			position: positionReducer
		});
		$injector
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('TranslationService', translationService)
			.registerSingleton('EnvironmentService', environmentService);

		return store;
	};

	describe('constructor', () => {
		it('setups local state', () => {
			setup();
			const instanceUnderTest = new GeolocationPlugin();

			expect(instanceUnderTest._firstTimeActivatingGeolocation).toBe(true);
			expect(instanceUnderTest._geolocationWatcherId).toBeNull();
		});
	});

	describe('register', () => {
		it('activates and deactivates the geolocation plugin', async () => {
			const store = setup();
			const instanceUnderTest = new GeolocationPlugin();
			const activateSpy = vi.spyOn(instanceUnderTest, '_activate').mockImplementation(() => {});
			const deactivateSpy = vi.spyOn(instanceUnderTest, '_deactivate').mockImplementation(() => {});

			await instanceUnderTest.register(store);

			expect(activateSpy).not.toHaveBeenCalled();
			expect(deactivateSpy).not.toHaveBeenCalled();

			activate();

			expect(activateSpy).toHaveBeenCalledWith();
			expect(deactivateSpy).not.toHaveBeenCalled();

			deactivate();

			expect(activateSpy).toHaveBeenCalled();
			expect(deactivateSpy).toHaveBeenCalled();
		});

		it('adds and removes the geolocation layer', async () => {
			const store = setup();
			const instanceUnderTest = new GeolocationPlugin();
			vi.spyOn(instanceUnderTest, '_activate').mockImplementation(() => {});
			vi.spyOn(instanceUnderTest, '_deactivate').mockImplementation(() => {});

			await instanceUnderTest.register(store);

			activate();

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe(GEOLOCATION_LAYER_ID);
			expect(store.getState().layers.active[0].constraints.alwaysTop).toBe(true);
			expect(store.getState().layers.active[0].constraints.hidden).toBe(true);

			deactivate();

			expect(store.getState().layers.active.length).toBe(0);
		});

		it('registers an observer for beingDragged changes', async () => {
			const store = setup();
			const instanceUnderTest = new GeolocationPlugin();
			vi.spyOn(instanceUnderTest, '_activate').mockImplementation(() => {});

			await instanceUnderTest.register(store);

			setTracking(true);
			activate();
			setBeingDragged(true);

			expect(store.getState().geolocation.tracking).toBe(false);
		});

		describe('when geolocation related query params is available', () => {
			describe('and its value is `true`', () => {
				it('activates the geolocation', async () => {
					const store = setup();
					const queryParams = new URLSearchParams(`${QueryParameters.GEOLOCATION}=true`);
					vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParams);
					const instanceUnderTest = new GeolocationPlugin();
					vi.spyOn(instanceUnderTest, '_activate').mockImplementation(() => {});

					await instanceUnderTest.register(store);
					await TestUtils.timeout();

					expect(store.getState().geolocation.active).toBe(true);
				});
			});

			describe('and its value is NOT `true`', () => {
				it('does nothing', async () => {
					const store = setup();
					const queryParams = new URLSearchParams(`${QueryParameters.GEOLOCATION}=some`);
					vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParams);
					const instanceUnderTest = new GeolocationPlugin();
					vi.spyOn(instanceUnderTest, '_activate').mockImplementation(() => {});

					await instanceUnderTest.register(store);
					await TestUtils.timeout();

					expect(store.getState().geolocation.active).toBe(false);
				});
			});
		});
	});

	describe('_transformPositionTo3857', () => {
		it('transforms a position to 3857', () => {
			setup();
			const expectedCoord = [38, 57];
			const instanceUnderTest = new GeolocationPlugin();
			vi.spyOn(coordinateServiceMock, 'fromLonLat').mockReturnValue(expectedCoord);

			const transformedCoord = instanceUnderTest._transformPositionTo3857({ coords: { longitude: 43, latitude: 26 } });

			expect(transformedCoord).toEqual(expectedCoord);
		});
	});

	describe('_handlePositionError', () => {
		it('handles a PERMISSION_DENIED position error', () => {
			const store = setup();
			const instanceUnderTest = new GeolocationPlugin();
			vi.spyOn(window, 'alert').mockImplementation(() => {});
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			// code PERMISSION_DENIED
			const error = { code: 1, PERMISSION_DENIED: 1 };

			instanceUnderTest._handlePositionError(error);

			expect(store.getState().geolocation.denied).toBe(true);
			expect(window.alert).toHaveBeenCalledWith('global_geolocation_denied');
			expect(warnSpy).toHaveBeenCalledWith('Geolocation activation failed', error);
		});

		it('handles other position errors', () => {
			setup();
			const instanceUnderTest = new GeolocationPlugin();
			vi.spyOn(window, 'alert').mockImplementation(() => {});
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			// code PERMISSION_DENIED
			const error = { code: 2, POSITION_UNAVAILABLE: 2 };

			instanceUnderTest._handlePositionError(error);

			expect(window.alert).toHaveBeenCalledWith('global_geolocation_not_available');
			expect(warnSpy).toHaveBeenCalledWith('Geolocation activation failed', error);
		});
	});

	describe('_handlePositionAndUpdateStore', () => {
		it('handles a position update', () => {
			const expectedCoord = [38, 57];
			const expectedAccuracy = 42;
			const store = setup();
			const instanceUnderTest = new GeolocationPlugin();
			const position = { coords: { longitude: 43, latitude: 26, accuracy: expectedAccuracy } };
			const transformSpy = vi.spyOn(instanceUnderTest, '_transformPositionTo3857').mockReturnValue(expectedCoord);

			instanceUnderTest._handlePositionAndUpdateStore(position);

			expect(transformSpy).toHaveBeenCalledWith(position);
			expect(store.getState().geolocation.position).toEqual(expectedCoord);
			expect(store.getState().geolocation.accuracy).toBe(expectedAccuracy);
		});

		it('changes center when tracking is enabled', () => {
			const expectedCoord = [38, 57];
			const state = {
				geolocation: {
					tracking: true
				}
			};
			const store = setup(state);
			const instanceUnderTest = new GeolocationPlugin();
			instanceUnderTest._firstTimeActivatingGeolocation = false;

			const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
			const transformSpy = vi.spyOn(instanceUnderTest, '_transformPositionTo3857').mockReturnValue(expectedCoord);

			instanceUnderTest._handlePositionAndUpdateStore(position);

			expect(transformSpy).toHaveBeenCalledExactlyOnceWith(position);
			expect(store.getState().position.center).toEqual(expectedCoord);
		});

		it('places a fit request on first time after activation', () => {
			const state = {
				geolocation: {
					denied: true
				}
			};
			const store = setup(state);
			const instanceUnderTest = new GeolocationPlugin();
			const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
			const transformSpy = vi.spyOn(instanceUnderTest, '_transformPositionTo3857').mockReturnValue([38, 57]);

			instanceUnderTest._handlePositionAndUpdateStore(position);

			expect(transformSpy).toHaveBeenCalledWith(position);
			expect(store.getState().geolocation.denied).toBe(false);
		});

		it('disables the denied flag', () => {
			setup();
			const instanceUnderTest = new GeolocationPlugin();
			const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
			const transformSpy = vi.spyOn(instanceUnderTest, '_transformPositionTo3857').mockReturnValue([38, 57]);
			const fitSpy = vi.spyOn(instanceUnderTest, '_fit').mockImplementation(() => {});

			instanceUnderTest._handlePositionAndUpdateStore(position);

			expect(fitSpy).toHaveBeenCalledExactlyOnceWith(position);
			expect(transformSpy).toHaveBeenCalledExactlyOnceWith(position);
		});
	});

	describe('_watchPosition', () => {
		it('watches position successfully ', async () => {
			const store = setup();
			const instanceUnderTest = new GeolocationPlugin();
			const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
			const handlePositionAndUpdateStoreSpy = vi.spyOn(instanceUnderTest, '_handlePositionAndUpdateStore').mockImplementation(() => {});
			vi.spyOn(window.navigator.geolocation, 'watchPosition').mockImplementation((success) => Promise.resolve(success(position)));

			instanceUnderTest._watchPosition(store.getState);

			await TestUtils.timeout();
			expect(handlePositionAndUpdateStoreSpy).toHaveBeenCalledExactlyOnceWith(position);
		});

		it('watches position unsuccessfully ', async () => {
			const store = setup();
			const instanceUnderTest = new GeolocationPlugin();
			const errorMessage = 'some error';
			const handlePositionErrorSpy = vi.spyOn(instanceUnderTest, '_handlePositionError').mockImplementation(() => {});
			vi.spyOn(window.navigator.geolocation, 'watchPosition').mockImplementation((success, error) => Promise.resolve(error(errorMessage)));

			instanceUnderTest._watchPosition(store.getState);

			await TestUtils.timeout();
			expect(handlePositionErrorSpy).toHaveBeenCalledExactlyOnceWith(errorMessage);
		});
	});

	describe('_fit', () => {
		it('calculates an extent and updates the state', () => {
			const store = setup();
			const instanceUnderTest = new GeolocationPlugin();
			const mapSrid = 2100;
			const geodeticSrid = 4200;
			const geodeticExtent = [42, 10, 42, 10];
			const bufferedGeodeticExtent = [52, 0, 52, 0];
			const bufferedMapExtent = [11, 22, 33, 44];
			const position = { coords: { longitude: 43, latitude: 26, accuracy: 10 } };
			vi.spyOn(mapServiceMock, 'getSrid').mockReturnValue(mapSrid);
			vi.spyOn(mapServiceMock, 'getLocalProjectedSrid').mockReturnValue(geodeticSrid);
			vi.spyOn(instanceUnderTest, '_transformPositionTo3857').mockReturnValue([38, 57]);
			vi.spyOn(coordinateServiceMock, 'transformExtent').mockImplementation((extent, sourceSrid, targetSrid) => {
				return targetSrid === geodeticSrid ? geodeticExtent : bufferedMapExtent;
			});
			const bufferSpy = vi.spyOn(coordinateServiceMock, 'buffer').mockReturnValue(bufferedGeodeticExtent);

			instanceUnderTest._fit(position);

			expect(store.getState().position.fitRequest.payload.extent).toEqual(bufferedMapExtent);
			expect(store.getState().position.fitRequest.payload.options.maxZoom).toEqual(16);
			expect(bufferSpy).toHaveBeenCalledExactlyOnceWith([42, 10, 42, 10], 10);
		});
	});

	describe('activate / deactivate', () => {
		it('activates the plugin', () => {
			const store = setup();
			const instanceUnderTest = new GeolocationPlugin();
			const watchPositionSpy = vi.spyOn(instanceUnderTest, '_watchPosition').mockImplementation(() => {});

			instanceUnderTest._activate();

			expect(store.getState().geolocation.tracking).toBe(true);
			expect(watchPositionSpy).toHaveBeenCalled();
		});

		it('deactivates the plugin', () => {
			setup();
			const instanceUnderTest = new GeolocationPlugin();
			instanceUnderTest._geolocationWatcherId = 0;
			instanceUnderTest._firstTimeActivatingGeolocation = false;
			const clearWatchSpy = vi.spyOn(window.navigator.geolocation, 'clearWatch').mockImplementation(() => {});

			instanceUnderTest._deactivate();

			expect(clearWatchSpy).toHaveBeenCalledExactlyOnceWith(0);
		});

		it('calls deactivate on inactive plugin', () => {
			setup();
			const instanceUnderTest = new GeolocationPlugin();
			const clearWatchSpy = vi.spyOn(window.navigator.geolocation, 'clearWatch').mockImplementation(() => {});

			instanceUnderTest._deactivate();

			expect(clearWatchSpy).not.toHaveBeenCalled();
		});
	});
});
