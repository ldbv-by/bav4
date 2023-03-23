import { $injector } from '../../src/injection';
import { StoreService } from '../../src/services/StoreService';
import { TestUtils } from '../test-utils';

describe('StoreService', () => {
	describe('constructor', () => {
		const topicsServiceMock = {
			init: () => {}
		};
		const geoResourceServiceMock = {
			init: () => {}
		};
		const measurementPluginMock = {
			register: () => {}
		};
		const drawPluginMock = {
			register: () => {}
		};
		const geolocationPluginMock = {
			register: () => {}
		};
		const layersPluginMock = {
			register: () => {}
		};
		const topicsPluginMock = {
			register: () => {}
		};
		const positionPluginMock = {
			register() {}
		};
		const contextClickPluginMock = {
			register() {}
		};
		const highlightPluginMock = {
			register() {}
		};
		const featureInfoPluginMock = {
			register() {}
		};
		const importPluginMock = {
			register: () => {}
		};
		const searchPluginMock = {
			register: () => {}
		};
		const exportMfpPluginMock = {
			register: () => {}
		};
		const mainMenuPluginMock = {
			register() {}
		};
		const mediaPluginMock = {
			register() {}
		};
		const chipsPlugin = {
			register() {}
		};
		const elevationProfilePluginMock = {
			register() {}
		};
		const iframeStatePluginMock = {
			register: () => {}
		};
		const historyStatePluginMock = {
			register: () => {}
		};
		const observeStateForEncodingPluginMock = {
			register: () => {}
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
				.registerSingleton('SearchPlugin', searchPluginMock)
				.registerSingleton('ExportMfpPlugin', exportMfpPluginMock)
				.registerSingleton('ElevationProfilePlugin', elevationProfilePluginMock)
				.registerSingleton('ChipsPlugin', chipsPlugin)
				.registerSingleton('IframeStatePlugin', iframeStatePluginMock)
				.registerSingleton('HistoryStatePlugin', historyStatePluginMock)
				.registerSingleton('ObserveStateForEncodingPlugin', observeStateForEncodingPluginMock)

				.ready();
		};

		it('registers all reducers', () => {
			const instanceUnderTest = new StoreService();

			const store = instanceUnderTest.getStore();
			expect(store).toBeDefined();

			const reducerKeys = Object.keys(store.getState());
			expect(reducerKeys.length).toBe(27);
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
			expect(reducerKeys.includes('mfp')).toBeTrue();
			expect(reducerKeys.includes('bottomSheet')).toBeTrue();
			expect(reducerKeys.includes('elevationProfile')).toBeTrue();
			expect(reducerKeys.includes('chips')).toBeTrue();
			expect(reducerKeys.includes('stateForEncoding')).toBeTrue();
			expect(reducerKeys.includes('iframeContainer')).toBeTrue();
		});

		it('registers all plugins', async () => {
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
			const searchPluginSpy = spyOn(searchPluginMock, 'register');
			const exportMfpPluginSpy = spyOn(exportMfpPluginMock, 'register');
			const elevationProfilePluginSpy = spyOn(elevationProfilePluginMock, 'register');
			const iframeStatePluginSpy = spyOn(iframeStatePluginMock, 'register');
			const historyStatePluginSpy = spyOn(historyStatePluginMock, 'register');
			const observeStateForEncodingPluginSpy = spyOn(observeStateForEncodingPluginMock, 'register');
			const instanceUnderTest = new StoreService();

			setupInjector();
			const store = instanceUnderTest.getStore();

			//we need two timeout calls: async plugins registration is done within a timeout function
			await TestUtils.timeout();
			await TestUtils.timeout();

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
			expect(searchPluginSpy).toHaveBeenCalledWith(store);
			expect(exportMfpPluginSpy).toHaveBeenCalledWith(store);
			expect(elevationProfilePluginSpy).toHaveBeenCalledWith(store);
			expect(iframeStatePluginSpy).toHaveBeenCalledWith(store);
			expect(historyStatePluginSpy).toHaveBeenCalledWith(store);
			expect(observeStateForEncodingPluginSpy).toHaveBeenCalledWith(store);
		});
	});
});
