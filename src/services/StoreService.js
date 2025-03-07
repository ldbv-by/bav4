/**
 * @module services/StoreService
 */
import { combineReducers, createStore } from 'redux';
import { positionReducer } from '../store/position/position.reducer';
import { extendedLayersReducer } from '../store/layers/layers.reducer';
import { $injector } from '../injection';
import { topicsReducer } from '../store/topics/topics.reducer';
import { networkReducer } from '../store/network/network.reducer';
import { searchReducer } from '../store/search/search.reducer';
import { highlightReducer } from '../store/highlight/highlight.reducer';
import { notificationReducer } from '../store/notifications/notifications.reducer';
import { createMediaReducer } from '../store/media/media.reducer';
import { topicsContentPanelReducer } from '../store/topicsContentPanel/topicsContentPanel.reducer';
import { modalReducer } from '../store/modal/modal.reducer';
import { toolsReducer } from '../store/tools/tools.reducer';
import { drawReducer } from '../store/draw/draw.reducer';
import { sharedReducer } from '../store/shared/shared.reducer';
import { geolocationReducer } from '../store/geolocation/geolocation.reducer';
import { mapReducer } from '../store/map/map.reducer';
import { measurementReducer } from '../store/measurement/measurement.reducer';
import { pointerReducer } from '../store/pointer/pointer.reducer';
import { mapContextMenuReducer } from '../store/mapContextMenu/mapContextMenu.reducer';
import { createMainMenuReducer } from '../store/mainMenu/mainMenu.reducer';
import { createNavigationRailReducer } from '../store/navigationRail/navigationRail.reducer';
import { featureInfoReducer } from '../store/featureInfo/featureInfo.reducer';
import { importReducer } from '../store/import/import.reducer';
import { mfpReducer } from '../store/mfp/mfp.reducer';
import { bottomSheetReducer } from '../store/bottomSheet/bottomSheet.reducer';
import { elevationProfileReducer } from '../store/elevationProfile/elevationProfile.reducer';
import { chipsReducer } from '../store/chips/chips.reducer';
import { stateForEncodingReducer } from '../store/stateForEncoding/stateForEncoding.reducer';
import { iframeContainerReducer } from '../store/iframeContainer/iframeContainer.reducer';
import { routingReducer } from '../store/routing/routing.reducer';
import { authReducer } from '../store/auth/auth.reducer';
import { wcAttributeReducer } from '../store/wcAttribute/wcAttribute.reducer';
import { fileStorageReducer } from '../store/fileStorage/fileStorage.reducer';
import { timeTravelReducer } from '../store/timeTravel/timeTravel.reducer';
import { layerSwipeReducer } from '../store/layerSwipe/layerSwipe.reducer';
import { catalogReducer } from '../store/catalog/catalog.reducer';
import { featureCollectionReducer } from '../store/featureCollection/featureCollection.reducer';

/**
 * Service which configures, initializes and holds the redux store.
 * @class
 * @author taulinger
 */
export class StoreService {
	constructor() {
		const rootReducer = combineReducers({
			/*
			 * must be named like the field of the state
			 * see: https://redux.js.org/recipes/structuring-reducers/initializing-state#combined-reducers
			 */
			map: mapReducer,
			pointer: pointerReducer,
			position: positionReducer,
			mainMenu: createMainMenuReducer(),
			navigationRail: createNavigationRailReducer(),
			tools: toolsReducer,
			modal: modalReducer,
			layers: extendedLayersReducer,
			mapContextMenu: mapContextMenuReducer,
			measurement: measurementReducer,
			draw: drawReducer,
			shared: sharedReducer,
			geolocation: geolocationReducer,
			topics: topicsReducer,
			network: networkReducer,
			search: searchReducer,
			topicsContentPanel: topicsContentPanelReducer,
			highlight: highlightReducer,
			notifications: notificationReducer,
			featureInfo: featureInfoReducer,
			media: createMediaReducer(),
			import: importReducer,
			mfp: mfpReducer,
			bottomSheet: bottomSheetReducer,
			elevationProfile: elevationProfileReducer,
			chips: chipsReducer,
			stateForEncoding: stateForEncodingReducer,
			iframeContainer: iframeContainerReducer,
			routing: routingReducer,
			auth: authReducer,
			wcAttribute: wcAttributeReducer,
			fileStorage: fileStorageReducer,
			timeTravel: timeTravelReducer,
			layerSwipe: layerSwipeReducer,
			catalog: catalogReducer,
			featureCollection: featureCollectionReducer
		});

		this._store = createStore(rootReducer);

		$injector.onReady(async () => {
			const {
				GlobalErrorPlugin: globalErrorPlugin,
				AuthPlugin: authPlugin,
				LayersPlugin: layersPlugin,
				TopicsPlugin: topicsPlugin,
				ChipsPlugin: chipsPlugin,
				GeolocationPlugin: geolocationPlugin,
				MeasurementPlugin: measurementPlugin,
				DrawPlugin: drawPlugin,
				RoutingPlugin: routingPlugin,
				PositionPlugin: positionPlugin,
				ContextClickPlugin: contextClickPlugin,
				HighlightPlugin: highlightPlugin,
				MediaPlugin: mediaPlugin,
				FeatureInfoPlugin: featureInfoPlugin,
				MainMenuPlugin: mainMenuPlugin,
				NavigationRailPlugin: navigationRailPlugin,
				ImportPlugin: importPlugin,
				SearchPlugin: searchPlugin,
				ExportMfpPlugin: exportMfpPlugin,
				ElevationProfilePlugin: elevationProfilePlugin,
				IframeStatePlugin: iframeStatePlugin,
				IframeContainerPlugin: iframeContainerPlugin,
				SharePlugin: sharePlugin,
				ToolsPlugin: toolsPlugin,
				FileStoragePlugin: fileStoragePlugin,
				BeforeUnloadPlugin: beforeUnloadPlugin,
				IframeGeometryIdPlugin: iframeGeometryIdPlugin,
				ObserveWcAttributesPlugin: observeWcAttributesPlugin,
				EncodeStatePlugin: encodeStatePlugin,
				TimeTravelPlugin: timeTravelPlugin,
				ComparePlugin: comparePlugin,
				FeatureCollectionPlugin: featureCollectionPlugin,
				ObserveStateForEncodingPlugin: observeStateForEncodingPlugin
			} = $injector.inject(
				'GlobalErrorPlugin',
				'AuthPlugin',
				'TopicsPlugin',
				'ChipsPlugin',
				'LayersPlugin',
				'GeolocationPlugin',
				'MeasurementPlugin',
				'DrawPlugin',
				'RoutingPlugin',
				'PositionPlugin',
				'ContextClickPlugin',
				'HighlightPlugin',
				'MediaPlugin',
				'FeatureInfoPlugin',
				'MainMenuPlugin',
				'NavigationRailPlugin',
				'ImportPlugin',
				'SearchPlugin',
				'ExportMfpPlugin',
				'ElevationProfilePlugin',
				'IframeStatePlugin',
				'IframeContainerPlugin',
				'SharePlugin',
				'ToolsPlugin',
				'FileStoragePlugin',
				'BeforeUnloadPlugin',
				'IframeGeometryIdPlugin',
				'ObserveWcAttributesPlugin',
				'EncodeStatePlugin',
				'TimeTravelPlugin',
				'ComparePlugin',
				'FeatureCollectionPlugin',
				'ObserveStateForEncodingPlugin'
			);

			setTimeout(async () => {
				//register plugins
				await globalErrorPlugin.register(this._store);
				await authPlugin.register(this._store);
				await mediaPlugin.register(this._store);
				await topicsPlugin.register(this._store);
				await chipsPlugin.register(this._store);
				await timeTravelPlugin.register(this._store);
				await comparePlugin.register(this._store);
				await featureCollectionPlugin.register(this._store);
				await layersPlugin.register(this._store);
				await positionPlugin.register(this._store);
				await measurementPlugin.register(this._store);
				await drawPlugin.register(this._store);
				await routingPlugin.register(this._store);
				await geolocationPlugin.register(this._store);
				await contextClickPlugin.register(this._store);
				await highlightPlugin.register(this._store);
				await featureInfoPlugin.register(this._store);
				await mainMenuPlugin.register(this._store);
				await navigationRailPlugin.register(this._store);
				await importPlugin.register(this._store);
				await searchPlugin.register(this._store);
				await exportMfpPlugin.register(this._store);
				await elevationProfilePlugin.register(this._store);
				await iframeStatePlugin.register(this._store);
				await iframeContainerPlugin.register(this._store);
				await sharePlugin.register(this._store);
				await toolsPlugin.register(this._store);
				await fileStoragePlugin.register(this._store);
				await beforeUnloadPlugin.register(this._store);
				await iframeGeometryIdPlugin.register(this._store);
				await observeWcAttributesPlugin.register(this._store);
				await encodeStatePlugin.register(this._store);
				await observeStateForEncodingPlugin.register(this._store); // should be registered as last plugin
			});
		});
	}

	/**
	 * Returns the fully initialized store.
	 */
	getStore() {
		return this._store;
	}
}
