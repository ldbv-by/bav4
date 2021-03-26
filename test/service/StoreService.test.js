import { $injector } from '../../src/injection';
import { StoreService } from '../../src/services/StoreService';

describe('StoreService', () => {

	describe('constructor', () => {

		const topicsServiceMock = {
			init: () => { }
		};
		const geoResourceServiceMock = {
			init: () => { }
		};
		const measurementObserverMock = {
			register: () => { }
		};
		const geolocationObserverMock = {
			register: () => { }
		};
		const layersObserverMock = {
			register: () => { }
		};
		const topicsObserverMock = {
			register: () => { }
		};
		const positionObserverMock = {
			register() { }
		};
		const contextClickObserverMock = {
			register() { }
		};
		const windowMock = {
			history: {
				replaceState() { }
			}
		};

		const setupInjector = () => {
			$injector
				.reset()

				.registerSingleton('TopicsService', topicsServiceMock)
				.registerSingleton('GeoResourceService', geoResourceServiceMock)

				.registerSingleton('MeasurementObserver', measurementObserverMock)
				.registerSingleton('GeolocationObserver', geolocationObserverMock)
				.registerSingleton('LayersObserver', layersObserverMock)
				.registerSingleton('TopicsObserver', topicsObserverMock)
				.registerSingleton('PositionObserver', positionObserverMock)
				.registerSingleton('ContextClickObserver', contextClickObserverMock)
				.registerSingleton('EnvironmentService', { getWindow: () => windowMock })

				.ready();
		};

		it('registers all reducers', () => {

			const instanceUnderTest = new StoreService();

			const store = instanceUnderTest.getStore();
			expect(store).toBeDefined();

			const reducerKeys = Object.keys(store.getState());
			expect(reducerKeys.length).toBe(12);
			expect(reducerKeys.includes('map')).toBeTrue();
			expect(reducerKeys.includes('pointer')).toBeTrue();
			expect(reducerKeys.includes('sidePanel')).toBeTrue();
			expect(reducerKeys.includes('contextMenue')).toBeTrue();
			expect(reducerKeys.includes('modal')).toBeTrue();
			expect(reducerKeys.includes('uiTheme')).toBeTrue();
			expect(reducerKeys.includes('layers')).toBeTrue();
			expect(reducerKeys.includes('mapContextMenu')).toBeTrue();
			expect(reducerKeys.includes('measurement')).toBeTrue();
			expect(reducerKeys.includes('geolocation')).toBeTrue();
			expect(reducerKeys.includes('topics')).toBeTrue();
		});

		it('initializes global services', (done) => {
		
			const topicsServicSpy = spyOn(topicsServiceMock, 'init');
			const geoResourceServicSpy = spyOn(geoResourceServiceMock, 'init');
			new StoreService();

			setupInjector();

			setTimeout(() => {

				expect(topicsServicSpy).toHaveBeenCalled();
				expect(geoResourceServicSpy).toHaveBeenCalled();
				done();
			});
		});

		it('registers all observers', (done) => {

			const measurementObserverSpy = spyOn(measurementObserverMock, 'register');
			const geolocationObserverSpy = spyOn(geolocationObserverMock, 'register');
			const layersObserverSpy = spyOn(layersObserverMock, 'register');
			const topicsObserverSpy = spyOn(topicsObserverMock, 'register');
			const positionObserverSpy = spyOn(positionObserverMock, 'register');
			const contextClickObserverSpy = spyOn(contextClickObserverMock, 'register');
			const instanceUnderTest = new StoreService();

			setupInjector();
			const store = instanceUnderTest.getStore();

			setTimeout(() => {

				expect(measurementObserverSpy).toHaveBeenCalledWith(store);
				expect(geolocationObserverSpy).toHaveBeenCalledWith(store);
				expect(layersObserverSpy).toHaveBeenCalledWith(store);
				expect(topicsObserverSpy).toHaveBeenCalledWith(store);
				expect(positionObserverSpy).toHaveBeenCalledWith(store);
				expect(contextClickObserverSpy).toHaveBeenCalledWith(store);
				done();
			});
		});

		it('removes all query params by calling #replaceState on history', (done) => {
			const replaceStateMock = spyOn(windowMock.history, 'replaceState');
			new StoreService();

			setupInjector();

			setTimeout(() => {
				setTimeout(() => {
					expect(replaceStateMock).toHaveBeenCalled();
					done();
				});
			});
		});
	});
});
