import { GeolocationHandler, GEOLOCATION_LAYER_ID, register } from '../../../../src/modules/map/store/geolocation.observer';
import { activate, deactivate } from '../../../../src/modules/map/store/geolocation.action';
import { TestUtils } from '../../../test-utils.js';
import { layersReducer } from '../../../../src/modules/map/store/layers.reducer';
import { geolocationReducer } from '../../../../src/modules/map/store/geolocation.reducer';
import { $injector } from '../../../../src/injection';
import { positionReducer } from '../../../../src/modules/map/store/position.reducer';


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
	};

	const setup = () => {

		const store = TestUtils.setupStoreAndDi(undefined, {
			geolocation: geolocationReducer,
			layers: layersReducer,
			position: positionReducer
		});
		$injector
			.registerSingleton('EnvironmentService', { getWindow: () => windowMock })
			.registerSingleton('CoordinateService', coordinateServiceMock)
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
	});

	describe('GeolocationHandler', () => {
		describe('constructor', () => {

			it('initializes the handler', () => {
				setup();
				const handler = new GeolocationHandler();

				expect(handler._coordinateService).toBeDefined();
				expect(handler._environmentService).toBeDefined();
				expect(handler._translationService).toBeDefined();
				expect(handler._firstTimeActivatingGeolocation).toBeTrue();
				expect(handler._geolocationWatcherId).toBeNull();
			});
		});

		describe('_transformPositionTo3857', () => {

			it('transforms a position to 3857', () => {
				setup();
				const handler = new GeolocationHandler();
				spyOn(coordinateServiceMock, 'fromLonLat').and.returnValue([38, 57]);

				const transformedCoord = handler._transformPositionTo3857({ coords: { longitude: 43, latitude: 26 } });

				expect(transformedCoord).toEqual([38, 57]);
			});
		});

		describe('_handlePositionError', () => {

			it('handles a position error', () => {
				const store = setup();
				const handler = new GeolocationHandler();
				spyOn(window, 'alert');
				const warnSpy = spyOn(console, 'warn');
				// code PERMISSION_DENIED
				const error = { code: 1, PERMISSION_DENIED: 1 };

				handler._handlePositionError(error);

				expect(store.getState().geolocation.denied).toBeTrue();
				expect(window.alert).toHaveBeenCalledWith('map_store_geolocation_denied');
				expect(warnSpy).toHaveBeenCalledWith('Geolocation activation failed', error);

			});
		});

		describe('_handlePositionAndUpdateStore', () => {

			it('handles a position update', () => {
				const store = setup();
				const state = store.getState();
				const handler = new GeolocationHandler();
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				spyOn(handler, '_transformPositionTo3857').withArgs(position).and.returnValue([38, 57]);

				handler._handlePositionAndUpdateStore(position, state);

				expect(store.getState().geolocation.position).toEqual([38, 57]);
				expect(store.getState().geolocation.accuracy).toBe(42);
			});

			it('handles a position update and changes center', () => {
				const store = setup();
				const state = {
					...store.getState(),
					geolocation: {
						tracking: true
					}
				};
				const handler = new GeolocationHandler();
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				spyOn(handler, '_transformPositionTo3857').withArgs(position).and.returnValue([38, 57]);

				handler._handlePositionAndUpdateStore(position, state);

				expect(store.getState().geolocation.position).toEqual([38, 57]);
				expect(store.getState().geolocation.accuracy).toBe(42);
				expect(store.getState().position.center).toEqual([38, 57]);
			});
		});

		describe('_handlePositionSuccess', () => {
			it('handles positioning success on first time', () => {
				const store = setup();
				const state = store.getState();
				const handler = new GeolocationHandler();
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				const handlePositionAndUpdateStoreSpy = spyOn(handler, '_handlePositionAndUpdateStore');
				spyOn(window.navigator.geolocation, 'watchPosition').withArgs(jasmine.anything(), jasmine.anything()).and.returnValue(4242);

				handler._handlePositionSuccess(position, state);

				expect(handlePositionAndUpdateStoreSpy).toHaveBeenCalledOnceWith(position, jasmine.anything());
				expect(store.getState().position.zoom).toBe(15.5);
				expect(handler._geolocationWatcherId).toBe(4242);
			});

			it('handles positioning success not the first time and with previous denial', () => {
				const store = setup();
				const state = {
					...store.getState(),
					geolocation: {
						denied: true
					}
				};
				const handler = new GeolocationHandler();
				handler._firstTimeActivatingGeolocation = false;
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				const handlePositionAndUpdateStoreSpy = spyOn(handler, '_handlePositionAndUpdateStore');
				spyOn(window.navigator.geolocation, 'watchPosition').withArgs(jasmine.anything(), jasmine.anything()).and.returnValue(4242);

				handler._handlePositionSuccess(position, state);

				expect(handlePositionAndUpdateStoreSpy).toHaveBeenCalledOnceWith(position, jasmine.anything());
				expect(store.getState().position.zoom).not.toBe(15.5);
				expect(store.getState().geolocation.denied).toBeFalse();
				expect(handler._geolocationWatcherId).toBe(4242);
			});
		});

		describe('_watchPosition', () => {


			it('watches position successfully ', (done) => {
				const store = setup();

				const handler = new GeolocationHandler();
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				const handlePositionAndUpdateStoreSpy = spyOn(handler, '_handlePositionAndUpdateStore');
				spyOn(window.navigator.geolocation, 'watchPosition').and.callFake(success => Promise.resolve(success(position)));

				handler._watchPosition(store.getState);

				setTimeout(function () {
					expect(handlePositionAndUpdateStoreSpy).toHaveBeenCalledOnceWith(position, jasmine.anything());
					done();

				});
			});

			it('watches position unsuccessfully ', (done) => {
				const store = setup();
				const errorMessage = 'some error';
				const handler = new GeolocationHandler();
				const handlePositionErrorSpy = spyOn(handler, '_handlePositionError');
				spyOn(window.navigator.geolocation, 'watchPosition').and.callFake((success, error) => Promise.resolve(error(errorMessage)));

				handler._watchPosition(store.getState);

				setTimeout(function () {
					expect(handlePositionErrorSpy).toHaveBeenCalledOnceWith(errorMessage);
					done();

				});
			});
		});

		describe('activate / deactivate', () => {


			it('activates the handler', (done) => {
				const store = setup();
				const position = {
					coords: {
						latitude: 51.1,
						longitude: 45.3
					}
				};
				const handler = new GeolocationHandler();

				const handlePositionSuccessSpy = spyOn(handler, '_handlePositionSuccess');
				const getCurrentPositionSpy = spyOn(window.navigator.geolocation, 'getCurrentPosition').and.callFake(success => Promise.resolve(success(position)));

				handler.activate(store.getState());

				expect(getCurrentPositionSpy).toHaveBeenCalledOnceWith(jasmine.anything(), jasmine.anything());
				setTimeout(function () {
					expect(handlePositionSuccessSpy).toHaveBeenCalledWith(position, store.getState());
					done();

				});

			});

			it('deactivates the handler', () => {
				setup();
				const handler = new GeolocationHandler();
				handler._geolocationWatcherId = 42;
				const clearWatchSpy = spyOn(window.navigator.geolocation, 'clearWatch');

				handler.deactivate();

				expect(clearWatchSpy).toHaveBeenCalledOnceWith(42);
			});

			it('calls deactivate on inactive handler', () => {
				setup();
				const handler = new GeolocationHandler();
				const clearWatchSpy = spyOn(window.navigator.geolocation, 'clearWatch');

				handler.deactivate();

				expect(clearWatchSpy).not.toHaveBeenCalledOnceWith(42);
			});
		});
	});
});