import { $injector } from '@src/injection';
import { StoreService } from '@src/services/StoreService';
import { TestUtils } from '@test/test-utils';

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
		const routingPluginMock = {
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
		const navigationRailPluginMock = {
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
		const iframeContainerPluginMock = {
			register: () => {}
		};
		const sharePluginMock = {
			register: () => {}
		};
		const fileStoragePluginMock = {
			register: () => {}
		};
		const toolsPluginMock = {
			register: () => {}
		};
		const beforeUnloadPluginMock = {
			register: () => {}
		};
		const iframeGeometryIdPluginMock = {
			register: () => {}
		};
		const encodeStatePlugin = {
			register: () => {}
		};
		const publicWebComponentPluginMock = {
			register: () => {}
		};
		const observeStateForEncodingPluginMock = {
			register: () => {}
		};
		const globalErrorPluginMock = {
			register: () => {}
		};
		const authPluginMock = {
			register: () => {}
		};
		const timeTravelPluginMock = {
			register: () => {}
		};
		const comparePluginMock = {
			register: () => {}
		};
		const featureCollectionPluginMock = {
			register: () => {}
		};
		const embedReadyPluginMock = {
			register: () => {}
		};

		const setupInjector = () => {
			$injector
				.reset()
				.registerSingleton('TopicsService', topicsServiceMock)
				.registerSingleton('GeoResourceService', geoResourceServiceMock)
				.registerSingleton('GlobalErrorPlugin', globalErrorPluginMock)
				.registerSingleton('AuthPlugin', authPluginMock)
				.registerSingleton('MeasurementPlugin', measurementPluginMock)
				.registerSingleton('DrawPlugin', drawPluginMock)
				.registerSingleton('RoutingPlugin', routingPluginMock)
				.registerSingleton('GeolocationPlugin', geolocationPluginMock)
				.registerSingleton('LayersPlugin', layersPluginMock)
				.registerSingleton('TopicsPlugin', topicsPluginMock)
				.registerSingleton('PositionPlugin', positionPluginMock)
				.registerSingleton('ContextClickPlugin', contextClickPluginMock)
				.registerSingleton('HighlightPlugin', highlightPluginMock)
				.registerSingleton('FeatureInfoPlugin', featureInfoPluginMock)
				.registerSingleton('MainMenuPlugin', mainMenuPluginMock)
				.registerSingleton('NavigationRailPlugin', navigationRailPluginMock)
				.registerSingleton('MediaPlugin', mediaPluginMock)
				.registerSingleton('ImportPlugin', importPluginMock)
				.registerSingleton('SearchPlugin', searchPluginMock)
				.registerSingleton('ExportMfpPlugin', exportMfpPluginMock)
				.registerSingleton('ElevationProfilePlugin', elevationProfilePluginMock)
				.registerSingleton('ChipsPlugin', chipsPlugin)
				.registerSingleton('IframeStatePlugin', iframeStatePluginMock)
				.registerSingleton('IframeContainerPlugin', iframeContainerPluginMock)
				.registerSingleton('SharePlugin', sharePluginMock)
				.registerSingleton('FileStoragePlugin', fileStoragePluginMock)
				.registerSingleton('ToolsPlugin', toolsPluginMock)
				.registerSingleton('BeforeUnloadPlugin', beforeUnloadPluginMock)
				.registerSingleton('IframeGeometryIdPlugin', iframeGeometryIdPluginMock)
				.registerSingleton('EncodeStatePlugin', encodeStatePlugin)
				.registerSingleton('ObserveStateForEncodingPlugin', observeStateForEncodingPluginMock)
				.registerSingleton('TimeTravelPlugin', timeTravelPluginMock)
				.registerSingleton('ComparePlugin', comparePluginMock)
				.registerSingleton('FeatureCollectionPlugin', featureCollectionPluginMock)
				.registerSingleton('PublicWebComponentPlugin', publicWebComponentPluginMock)
				.registerSingleton('EmbedReadyPlugin', embedReadyPluginMock)
				.ready();
		};

		it('registers all reducers', () => {
			const instanceUnderTest = new StoreService();

			const store = instanceUnderTest.getStore();
			expect(store).toBeDefined();

			const reducerKeys = Object.keys(store.getState());
			expect(reducerKeys.length).toBe(35);
			expect(reducerKeys.includes('map')).toBe(true);
			expect(reducerKeys.includes('pointer')).toBe(true);
			expect(reducerKeys.includes('position')).toBe(true);
			expect(reducerKeys.includes('mainMenu')).toBe(true);
			expect(reducerKeys.includes('tools')).toBe(true);
			expect(reducerKeys.includes('modal')).toBe(true);
			expect(reducerKeys.includes('layers')).toBe(true);
			expect(reducerKeys.includes('mapContextMenu')).toBe(true);
			expect(reducerKeys.includes('measurement')).toBe(true);
			expect(reducerKeys.includes('draw')).toBe(true);
			expect(reducerKeys.includes('shared')).toBe(true);
			expect(reducerKeys.includes('geolocation')).toBe(true);
			expect(reducerKeys.includes('topics')).toBe(true);
			expect(reducerKeys.includes('network')).toBe(true);
			expect(reducerKeys.includes('search')).toBe(true);
			expect(reducerKeys.includes('topicsContentPanel')).toBe(true);
			expect(reducerKeys.includes('highlight')).toBe(true);
			expect(reducerKeys.includes('notifications')).toBe(true);
			expect(reducerKeys.includes('featureInfo')).toBe(true);
			expect(reducerKeys.includes('media')).toBe(true);
			expect(reducerKeys.includes('import')).toBe(true);
			expect(reducerKeys.includes('mfp')).toBe(true);
			expect(reducerKeys.includes('bottomSheet')).toBe(true);
			expect(reducerKeys.includes('elevationProfile')).toBe(true);
			expect(reducerKeys.includes('chips')).toBe(true);
			expect(reducerKeys.includes('stateForEncoding')).toBe(true);
			expect(reducerKeys.includes('iframeContainer')).toBe(true);
			expect(reducerKeys.includes('routing')).toBe(true);
			expect(reducerKeys.includes('navigationRail')).toBe(true);
			expect(reducerKeys.includes('auth')).toBe(true);
			expect(reducerKeys.includes('fileStorage')).toBe(true);
			expect(reducerKeys.includes('timeTravel')).toBe(true);
			expect(reducerKeys.includes('layerSwipe')).toBe(true);
			expect(reducerKeys.includes('catalog')).toBe(true);
			expect(reducerKeys.includes('featureCollection')).toBe(true);
		});

		it('registers all plugins', async () => {
			const globalErrorPluginSpy = vi.spyOn(globalErrorPluginMock, 'register');
			const authPluginSpy = vi.spyOn(authPluginMock, 'register');
			const measurementPluginSpy = vi.spyOn(measurementPluginMock, 'register');
			const drawPluginSpy = vi.spyOn(drawPluginMock, 'register');
			const routingPluginSpy = vi.spyOn(routingPluginMock, 'register');
			const geolocationPluginSpy = vi.spyOn(geolocationPluginMock, 'register');
			const layersPluginSpy = vi.spyOn(layersPluginMock, 'register');
			const topicsPluginSpy = vi.spyOn(topicsPluginMock, 'register');
			const positionPluginSpy = vi.spyOn(positionPluginMock, 'register');
			const contextClickPluginSpy = vi.spyOn(contextClickPluginMock, 'register');
			const highlightPluginSpy = vi.spyOn(highlightPluginMock, 'register');
			const featureInfoPluginSpy = vi.spyOn(featureInfoPluginMock, 'register');
			const mainMenuPluginSpy = vi.spyOn(mainMenuPluginMock, 'register');
			const navigationRailPluginSpy = vi.spyOn(navigationRailPluginMock, 'register');
			const mediaPluginSpy = vi.spyOn(mediaPluginMock, 'register');
			const importPluginSpy = vi.spyOn(importPluginMock, 'register');
			const searchPluginSpy = vi.spyOn(searchPluginMock, 'register');
			const exportMfpPluginSpy = vi.spyOn(exportMfpPluginMock, 'register');
			const elevationProfilePluginSpy = vi.spyOn(elevationProfilePluginMock, 'register');
			const iframeStatePluginSpy = vi.spyOn(iframeStatePluginMock, 'register');
			const iframeContainerPluginSpy = vi.spyOn(iframeContainerPluginMock, 'register');
			const sharePluginSpy = vi.spyOn(sharePluginMock, 'register');
			const fileStoragePluginSpy = vi.spyOn(fileStoragePluginMock, 'register');
			const toolsPluginSpy = vi.spyOn(toolsPluginMock, 'register');
			const beforeUnloadPluginSpy = vi.spyOn(beforeUnloadPluginMock, 'register');
			const iframeGeometryIdPluginSpy = vi.spyOn(iframeGeometryIdPluginMock, 'register');
			const observeStateForEncodingPluginSpy = vi.spyOn(observeStateForEncodingPluginMock, 'register');
			const publicWebComponentPluginSpy = vi.spyOn(publicWebComponentPluginMock, 'register');
			const timeTravelPluginSpy = vi.spyOn(timeTravelPluginMock, 'register');
			const comparePluginSpy = vi.spyOn(comparePluginMock, 'register');
			const featureCollectionPluginSpy = vi.spyOn(featureCollectionPluginMock, 'register');
			const embedReadyPluginSpy = vi.spyOn(embedReadyPluginMock, 'register');
			const instanceUnderTest = new StoreService();

			setupInjector();
			const store = instanceUnderTest.getStore();

			//we need two timeout calls: async plugins registration is done within a timeout function
			await TestUtils.timeout();
			await TestUtils.timeout();

			expect(globalErrorPluginSpy).toHaveBeenCalledWith(store);
			expect(authPluginSpy).toHaveBeenCalledWith(store);
			expect(measurementPluginSpy).toHaveBeenCalledWith(store);
			expect(drawPluginSpy).toHaveBeenCalledWith(store);
			expect(routingPluginSpy).toHaveBeenCalledWith(store);
			expect(geolocationPluginSpy).toHaveBeenCalledWith(store);
			expect(layersPluginSpy).toHaveBeenCalledWith(store);
			expect(topicsPluginSpy).toHaveBeenCalledWith(store);
			expect(positionPluginSpy).toHaveBeenCalledWith(store);
			expect(contextClickPluginSpy).toHaveBeenCalledWith(store);
			expect(highlightPluginSpy).toHaveBeenCalledWith(store);
			expect(featureInfoPluginSpy).toHaveBeenCalledWith(store);
			expect(mainMenuPluginSpy).toHaveBeenCalledWith(store);
			expect(navigationRailPluginSpy).toHaveBeenCalledWith(store);
			expect(mediaPluginSpy).toHaveBeenCalledWith(store);
			expect(importPluginSpy).toHaveBeenCalledWith(store);
			expect(searchPluginSpy).toHaveBeenCalledWith(store);
			expect(exportMfpPluginSpy).toHaveBeenCalledWith(store);
			expect(elevationProfilePluginSpy).toHaveBeenCalledWith(store);
			expect(iframeStatePluginSpy).toHaveBeenCalledWith(store);
			expect(iframeContainerPluginSpy).toHaveBeenCalledWith(store);
			expect(sharePluginSpy).toHaveBeenCalledWith(store);
			expect(fileStoragePluginSpy).toHaveBeenCalledWith(store);
			expect(toolsPluginSpy).toHaveBeenCalledWith(store);
			expect(beforeUnloadPluginSpy).toHaveBeenCalledWith(store);
			expect(iframeGeometryIdPluginSpy).toHaveBeenCalledWith(store);
			expect(observeStateForEncodingPluginSpy).toHaveBeenCalledWith(store);
			expect(publicWebComponentPluginSpy).toHaveBeenCalledWith(store);
			expect(timeTravelPluginSpy).toHaveBeenCalledWith(store);
			expect(comparePluginSpy).toHaveBeenCalledWith(store);
			expect(featureCollectionPluginSpy).toHaveBeenCalledWith(store);
			expect(embedReadyPluginSpy).toHaveBeenCalledWith(store);
		});
	});
});
