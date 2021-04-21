import { $injector } from '../../src/injection';
import { StoreService } from '../../src/services/StoreService';

describe('StoreService', () => {

	describe('constructor', () => {

		const measurementPluginMock = {
			register: () => { }
		};
		const geolocationPluginMock = {
			register: () => { }
		};
		const layersPluginMock = {
			register: () => { }
		};
		const topicsPluginMock = {
			register: () => { }
		};
		const positionPluginMock = {
			register() { }
		};
		const contextClickPluginMock = {
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
				.registerSingleton('MeasurementPlugin', measurementPluginMock)
				.registerSingleton('GeolocationPlugin', geolocationPluginMock)
				.registerSingleton('LayersPlugin', layersPluginMock)
				.registerSingleton('TopicsPlugin', topicsPluginMock)
				.registerSingleton('PositionPlugin', positionPluginMock)
				.registerSingleton('ContextClickPlugin', contextClickPluginMock)
				.registerSingleton('EnvironmentService', { getWindow: () => windowMock })
				.ready();
		};

		it('registers all reducers', () => {

			const instanceUnderTest = new StoreService();

			const store = instanceUnderTest.getStore();
			expect(store).toBeDefined();

			const reducerKeys = Object.keys(store.getState());
			expect(reducerKeys.length).toBe(16);
			expect(reducerKeys.includes('map')).toBeTrue();
			expect(reducerKeys.includes('pointer')).toBeTrue();
			expect(reducerKeys.includes('position')).toBeTrue();
			expect(reducerKeys.includes('sidePanel')).toBeTrue();
			expect(reducerKeys.includes('contentPanel')).toBeTrue();
			expect(reducerKeys.includes('toolBar')).toBeTrue();
			expect(reducerKeys.includes('toolContainer')).toBeTrue();
			expect(reducerKeys.includes('contextMenue')).toBeTrue();
			expect(reducerKeys.includes('modal')).toBeTrue();
			expect(reducerKeys.includes('uiTheme')).toBeTrue();
			expect(reducerKeys.includes('layers')).toBeTrue();
			expect(reducerKeys.includes('mapContextMenu')).toBeTrue();
			expect(reducerKeys.includes('measurement')).toBeTrue();
			expect(reducerKeys.includes('geolocation')).toBeTrue();
			expect(reducerKeys.includes('topics')).toBeTrue();
			expect(reducerKeys.includes('network')).toBeTrue();
		});

		it('registers all plugins', (done) => {

			const measurementPluginSpy = spyOn(measurementPluginMock, 'register');
			const geolocationPluginSpy = spyOn(geolocationPluginMock, 'register');
			const layersPluginSpy = spyOn(layersPluginMock, 'register');
			const topicsPluginSpy = spyOn(topicsPluginMock, 'register');
			const positionPluginSpy = spyOn(positionPluginMock, 'register');
			const contextClickPluginSpy = spyOn(contextClickPluginMock, 'register');
			const instanceUnderTest = new StoreService();

			setupInjector();
			const store = instanceUnderTest.getStore();

			setTimeout(() => {

				expect(measurementPluginSpy).toHaveBeenCalledWith(store);
				expect(geolocationPluginSpy).toHaveBeenCalledWith(store);
				expect(layersPluginSpy).toHaveBeenCalledWith(store);
				expect(topicsPluginSpy).toHaveBeenCalledWith(store);
				expect(positionPluginSpy).toHaveBeenCalledWith(store);
				expect(contextClickPluginSpy).toHaveBeenCalledWith(store);
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
