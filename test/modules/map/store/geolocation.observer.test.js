import { GeolocationHandler, GEOLOCATION_LAYER_ID, register } from '../../../../src/modules/map/store/geolocation.observer';
import { activate, deactivate, setTracking } from '../../../../src/modules/map/store/geolocation.action';
import { TestUtils } from '../../../test-utils.js';
import { layersReducer } from '../../../../src/modules/map/store/layers.reducer';
import { geolocationReducer } from '../../../../src/modules/map/store/geolocation.reducer';
import { $injector } from '../../../../src/injection';
import { positionReducer } from '../../../../src/modules/map/store/position.reducer';
import { mapReducer } from '../../../../src/modules/map/store/map.reducer';
import { setMoveStart } from '../../../../src/modules/map/store/map.action';


describe('geolocationObserver', () => {

	const windowMock = {
		navigator: {
			geolocation: {
				getCurrentPosition() { },
				watchPosition() { },
				clearWatch() { }
			}
		}
	};

	const coordinateServiceMock = {
		fromLonLat() { },
		transformExtent() { },
		buffer() { }
	};

	const mapServiceMock = {
		getDefaultGeodeticSrid() { },
		getSrid() { },
	};

	const setup = () => {

		const store = TestUtils.setupStoreAndDi(undefined, {
			map: mapReducer,
			geolocation: geolocationReducer,
			layers: layersReducer,
			position: positionReducer
		});
		$injector
			.registerSingleton('EnvironmentService', { getWindow: () => windowMock })
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return store;
	};

	describe('register', () => {

		it('activates and deactivates the geolocation handler', () => {
			const store = setup();

			const mockGeolocationHandler = jasmine.createSpyObj('GeolocationHandler', ['activate', 'deactivate']);
			register(store, mockGeolocationHandler);

			expect(mockGeolocationHandler.activate).not.toHaveBeenCalled();
			expect(mockGeolocationHandler.deactivate).not.toHaveBeenCalled();

			activate();

			expect(mockGeolocationHandler.activate).toHaveBeenCalledWith(jasmine.anything());
			expect(mockGeolocationHandler.deactivate).not.toHaveBeenCalled();

			deactivate();

			expect(mockGeolocationHandler.activate).toHaveBeenCalled();
			expect(mockGeolocationHandler.deactivate).toHaveBeenCalled();
		});

		it('adds and removes the geolocation layer', () => {
			const store = setup();
			const mockGeolocationHandler = jasmine.createSpyObj('GeolocationHandler', ['activate', 'deactivate']);
			register(store, mockGeolocationHandler);

			activate();

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe(GEOLOCATION_LAYER_ID);

			deactivate();

			expect(store.getState().layers.active.length).toBe(0);
		});

		it('registers an observer for movestart changes', () => {
			const store = setup();
			register(store);
			setTracking(true);

			setMoveStart();

			expect(store.getState().geolocation.tracking).toBeFalse();
		});
	});

	describe('GeolocationHandler', () => {
		let store, instanceUnderTest;

		beforeEach(() => {
			store = setup();
			instanceUnderTest = new GeolocationHandler();
		});

		describe('constructor', () => {

			it('initializes the handler', () => {

				expect(instanceUnderTest._coordinateService).toBeDefined();
				expect(instanceUnderTest._environmentService).toBeDefined();
				expect(instanceUnderTest._translationService).toBeDefined();
				expect(instanceUnderTest._firstTimeActivatingGeolocation).toBeTrue();
				expect(instanceUnderTest._geolocationWatcherId).toBeNull();
			});
		});

		describe('_transformPositionTo3857', () => {

			it('transforms a position to 3857', () => {
				spyOn(coordinateServiceMock, 'fromLonLat').and.returnValue([38, 57]);

				const transformedCoord = instanceUnderTest._transformPositionTo3857({ coords: { longitude: 43, latitude: 26 } });

				expect(transformedCoord).toEqual([38, 57]);
			});
		});

		describe('_handlePositionError', () => {

			it('handles a position error', () => {
				spyOn(window, 'alert');
				const warnSpy = spyOn(console, 'warn');
				// code PERMISSION_DENIED
				const error = { code: 1, PERMISSION_DENIED: 1 };

				instanceUnderTest._handlePositionError(error);

				expect(store.getState().geolocation.denied).toBeTrue();
				expect(window.alert).toHaveBeenCalledWith('map_store_geolocation_denied');
				expect(warnSpy).toHaveBeenCalledWith('Geolocation activation failed', error);

			});
		});

		describe('_handlePositionAndUpdateStore', () => {

			it('handles a position update', () => {
				const state = store.getState();
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				spyOn(instanceUnderTest, '_transformPositionTo3857').withArgs(position).and.returnValue([38, 57]);

				instanceUnderTest._handlePositionAndUpdateStore(position, state);

				expect(store.getState().geolocation.position).toEqual([38, 57]);
				expect(store.getState().geolocation.accuracy).toBe(42);
			});

			it('handles a position update and changes center', () => {
				const state = {
					...store.getState(),
					geolocation: {
						tracking: true
					}
				};
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				spyOn(instanceUnderTest, '_transformPositionTo3857').withArgs(position).and.returnValue([38, 57]);

				instanceUnderTest._handlePositionAndUpdateStore(position, state);

				expect(store.getState().geolocation.position).toEqual([38, 57]);
				expect(store.getState().geolocation.accuracy).toBe(42);
				expect(store.getState().position.center).toEqual([38, 57]);
			});
		});

		describe('_handlePositionSuccess', () => {
			it('handles positioning success on first time', () => {
				const state = store.getState();
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				const handlePositionAndUpdateStoreSpy = spyOn(instanceUnderTest, '_handlePositionAndUpdateStore');
				spyOn(window.navigator.geolocation, 'watchPosition').withArgs(jasmine.anything(), jasmine.anything()).and.returnValue(4242);
				const fitSpy = spyOn(instanceUnderTest, '_fit');

				instanceUnderTest._handlePositionSuccess(position, state);

				expect(handlePositionAndUpdateStoreSpy).toHaveBeenCalledOnceWith(position, jasmine.anything());
				// expect(store.getState().position.zoom).toBe(15.5);
				expect(fitSpy).toHaveBeenCalledOnceWith(position);
				expect(store.getState().geolocation.tracking).toBeTrue();
				expect(instanceUnderTest._geolocationWatcherId).toBe(4242);
			});

			it('handles positioning success not the first time and with previous denial', () => {
				const state = {
					...store.getState(),
					geolocation: {
						denied: true
					}
				};
				instanceUnderTest._firstTimeActivatingGeolocation = false;
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				const handlePositionAndUpdateStoreSpy = spyOn(instanceUnderTest, '_handlePositionAndUpdateStore');
				spyOn(window.navigator.geolocation, 'watchPosition').withArgs(jasmine.anything(), jasmine.anything()).and.returnValue(4242);

				instanceUnderTest._handlePositionSuccess(position, state);

				expect(handlePositionAndUpdateStoreSpy).toHaveBeenCalledOnceWith(position, jasmine.anything());
				expect(store.getState().position.zoom).not.toBe(15.5);
				expect(store.getState().geolocation.denied).toBeFalse();
				expect(store.getState().geolocation.tracking).toBeFalse();
				expect(instanceUnderTest._geolocationWatcherId).toBe(4242);
			});
		});

		describe('_watchPosition', () => {


			it('watches position successfully ', (done) => {

				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				const handlePositionAndUpdateStoreSpy = spyOn(instanceUnderTest, '_handlePositionAndUpdateStore');
				spyOn(window.navigator.geolocation, 'watchPosition').and.callFake(success => Promise.resolve(success(position)));

				instanceUnderTest._watchPosition(store.getState);

				setTimeout(() => {
					expect(handlePositionAndUpdateStoreSpy).toHaveBeenCalledOnceWith(position, jasmine.anything());
					done();

				});
			});

			it('watches position unsuccessfully ', (done) => {
				const errorMessage = 'some error';
				const handlePositionErrorSpy = spyOn(instanceUnderTest, '_handlePositionError');
				spyOn(window.navigator.geolocation, 'watchPosition').and.callFake((success, error) => Promise.resolve(error(errorMessage)));

				instanceUnderTest._watchPosition(store.getState);

				setTimeout(() => {
					expect(handlePositionErrorSpy).toHaveBeenCalledOnceWith(errorMessage);
					done();

				});
			});
		});

		describe('_fit', () => {
			it('calculates an extent and updates the state', () => {

				const mapSrid = 2100;
				const geodeticSrid = 4200;
				const geodeticExtent = [42, 10, 42, 10];
				const bufferedGeodeticExtent = [52, 0, 52, 0];
				const bufferedMapExtent = [11, 22, 33, 44];
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 10 } };
				spyOn(mapServiceMock, 'getSrid').and.returnValue(mapSrid);
				spyOn(mapServiceMock, 'getDefaultGeodeticSrid').and.returnValue(geodeticSrid);
				spyOn(instanceUnderTest, '_transformPositionTo3857').and.returnValue([38, 57]);
				spyOn(coordinateServiceMock, 'transformExtent').and.callFake((extent, sourceSrid, targetSrid) => {
					return targetSrid === geodeticSrid ? geodeticExtent : bufferedMapExtent;
				});
				spyOn(coordinateServiceMock, 'buffer').withArgs([42, 10, 42, 10], 10).and.returnValue(bufferedGeodeticExtent);

				instanceUnderTest._fit(position);

				expect(store.getState().position.fitRequest.payload.extent).toEqual(bufferedMapExtent);
			});
		});


		describe('activate / deactivate', () => {

			it('activates the handler', (done) => {
				const position = {
					coords: {
						latitude: 51.1,
						longitude: 45.3
					}
				};

				const handlePositionSuccessSpy = spyOn(instanceUnderTest, '_handlePositionSuccess');
				const getCurrentPositionSpy = spyOn(window.navigator.geolocation, 'getCurrentPosition').and.callFake(success => Promise.resolve(success(position)));

				instanceUnderTest.activate(store.getState());

				expect(getCurrentPositionSpy).toHaveBeenCalledOnceWith(jasmine.anything(), jasmine.anything());
				setTimeout(() => {
					expect(handlePositionSuccessSpy).toHaveBeenCalledWith(position, store.getState());
					done();

				});

			});

			it('deactivates the handler', () => {
				instanceUnderTest._geolocationWatcherId = 42;
				instanceUnderTest._firstTimeActivatingGeolocation = false;
				const clearWatchSpy = spyOn(window.navigator.geolocation, 'clearWatch');

				instanceUnderTest.deactivate();

				expect(clearWatchSpy).toHaveBeenCalledOnceWith(42);
				expect(instanceUnderTest._firstTimeActivatingGeolocation).toBeTrue();
			});

			it('calls deactivate on inactive handler', () => {
				const clearWatchSpy = spyOn(window.navigator.geolocation, 'clearWatch');

				instanceUnderTest.deactivate();

				expect(clearWatchSpy).not.toHaveBeenCalledOnceWith(42);
			});
		});
	});
});