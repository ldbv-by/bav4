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
		const measurementPluginMock = {
			register: () => { }
		};
		const drawPluginMock = {
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
		const highlightPluginMock = {
			register() { }
		};
		const featureInfoPluginMock = {
			register() { }
		};
		const importPluginMock = {
			register: () => { }
		};
		const mainMenuPluginMock = {
			register() { }
		};
		const mediaPluginMock = {
			register() { }
		};
		const windowMock = {
			history: {
				replaceState() { }
			}
		};
		const configService = {
			getValue: () => { }
		};

		const setupInjector = () => {
			$injector
				.reset()
				.registerSingleton('TopicsService', topicsServiceMock)
				.registerSingleton('GeoResourceService', geoResourceServiceMock)
				.registerSingleton('MeasurementPlugin', measurementPluginMock)
				.registerSingleton('DrawPlugin', drawPluginMock)
				.registerSingleton('GeolocationPlugin', geolocationPluginMock)
				.registerSingleton('LayersPlugin', layersPluginMock)
				.registerSingleton('TopicsPlugin', topicsPluginMock)
				.registerSingleton('PositionPlugin', positionPluginMock)
				.registerSingleton('ContextClickPlugin', contextClickPluginMock)
				.registerSingleton('HighlightPlugin', highlightPluginMock)
				.registerSingleton('FeatureInfoPlugin', featureInfoPluginMock)
				.registerSingleton('MainMenuPlugin', mainMenuPluginMock)
				.registerSingleton('MediaPlugin', mediaPluginMock)
				.registerSingleton('ImportPlugin', importPluginMock)
				.registerSingleton('EnvironmentService', { getWindow: () => windowMock })
				.registerSingleton('ConfigService', configService)

				.ready();
		};

		it('registers all reducers', () => {

			const instanceUnderTest = new StoreService();

			const store = instanceUnderTest.getStore();
			expect(store).toBeDefined();

			const reducerKeys = Object.keys(store.getState());
			expect(reducerKeys.length).toBe(21);
			expect(reducerKeys.includes('map')).toBeTrue();
			expect(reducerKeys.includes('pointer')).toBeTrue();
			expect(reducerKeys.includes('position')).toBeTrue();
			expect(reducerKeys.includes('mainMenu')).toBeTrue();
			expect(reducerKeys.includes('tools')).toBeTrue();
			expect(reducerKeys.includes('modal')).toBeTrue();
			expect(reducerKeys.includes('layers')).toBeTrue();
			expect(reducerKeys.includes('mapContextMenu')).toBeTrue();
			expect(reducerKeys.includes('measurement')).toBeTrue();
			expect(reducerKeys.includes('draw')).toBeTrue();
			expect(reducerKeys.includes('shared')).toBeTrue();
			expect(reducerKeys.includes('geolocation')).toBeTrue();
			expect(reducerKeys.includes('topics')).toBeTrue();
			expect(reducerKeys.includes('network')).toBeTrue();
			expect(reducerKeys.includes('search')).toBeTrue();
			expect(reducerKeys.includes('topicsContentPanel')).toBeTrue();
			expect(reducerKeys.includes('highlight')).toBeTrue();
			expect(reducerKeys.includes('notifications')).toBeTrue();
			expect(reducerKeys.includes('featureInfo')).toBeTrue();
			expect(reducerKeys.includes('media')).toBeTrue();
			expect(reducerKeys.includes('import')).toBeTrue();
		});

		it('registers all plugins', (done) => {

			const measurementPluginSpy = spyOn(measurementPluginMock, 'register');
			const drawPluginSpy = spyOn(drawPluginMock, 'register');
			const geolocationPluginSpy = spyOn(geolocationPluginMock, 'register');
			const layersPluginSpy = spyOn(layersPluginMock, 'register');
			const topicsPluginSpy = spyOn(topicsPluginMock, 'register');
			const positionPluginSpy = spyOn(positionPluginMock, 'register');
			const contextClickPluginSpy = spyOn(contextClickPluginMock, 'register');
			const highlightPluginSpy = spyOn(highlightPluginMock, 'register');
			const featureInfoPluginSpy = spyOn(featureInfoPluginMock, 'register');
			const mainMenuPluginSpy = spyOn(mainMenuPluginMock, 'register');
			const mediaPluginSpy = spyOn(mediaPluginMock, 'register');
			const importPluginSpy = spyOn(importPluginMock, 'register');
			const instanceUnderTest = new StoreService();

			setupInjector();
			const store = instanceUnderTest.getStore();

			//we need setTimeout calls: async plugins registration is done within a timeout function
			setTimeout(() => {
				setTimeout(() => {

					expect(measurementPluginSpy).toHaveBeenCalledWith(store);
					expect(drawPluginSpy).toHaveBeenCalledWith(store);
					expect(geolocationPluginSpy).toHaveBeenCalledWith(store);
					expect(layersPluginSpy).toHaveBeenCalledWith(store);
					expect(topicsPluginSpy).toHaveBeenCalledWith(store);
					expect(positionPluginSpy).toHaveBeenCalledWith(store);
					expect(contextClickPluginSpy).toHaveBeenCalledWith(store);
					expect(highlightPluginSpy).toHaveBeenCalledWith(store);
					expect(featureInfoPluginSpy).toHaveBeenCalledWith(store);
					expect(mainMenuPluginSpy).toHaveBeenCalledWith(store);
					expect(mediaPluginSpy).toHaveBeenCalledWith(store);
					expect(importPluginSpy).toHaveBeenCalledWith(store);
					done();
				});
			});
		});

		describe('query parameter', () => {

			it('removes all query params by calling #replaceState on history', (done) => {
				const replaceStateMock = spyOn(windowMock.history, 'replaceState');
				new StoreService();

				setupInjector();

				//we need two setTimeout calls: window history is manipulated within a timeout function
				setTimeout(() => {
					setTimeout(() => {

						expect(replaceStateMock).toHaveBeenCalled();
						done();
					});
				});
			});

			it('does NOT remove query params in deployment mode', (done) => {
				const replaceStateMock = spyOn(windowMock.history, 'replaceState');
				spyOn(configService, 'getValue').and.returnValue('development');
				new StoreService();

				setupInjector();

				//we need two setTimeout calls: window history is manipulated within a timeout function
				setTimeout(() => {
					setTimeout(() => {

						expect(replaceStateMock).not.toHaveBeenCalled();
						done();
					});
				});
			});
		});
	});
});
