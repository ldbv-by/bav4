/**
 * @module services/StoreService
 */

import { $injector } from '@src/injection';
import { authReducer } from '@src/store/auth/auth.reducer';
import { bottomSheetReducer } from '@src/store/bottomSheet/bottomSheet.reducer';
import { catalogReducer } from '@src/store/catalog/catalog.reducer';
import { chipsReducer } from '@src/store/chips/chips.reducer';
import { drawReducer } from '@src/store/draw/draw.reducer';
import { elevationProfileReducer } from '@src/store/elevationProfile/elevationProfile.reducer';
import { featureCollectionReducer } from '@src/store/featureCollection/featureCollection.reducer';
import { featureInfoReducer } from '@src/store/featureInfo/featureInfo.reducer';
import { fileStorageReducer } from '@src/store/fileStorage/fileStorage.reducer';
import { geolocationReducer } from '@src/store/geolocation/geolocation.reducer';
import { highlightReducer } from '@src/store/highlight/highlight.reducer';
import { iframeContainerReducer } from '@src/store/iframeContainer/iframeContainer.reducer';
import { importReducer } from '@src/store/import/import.reducer';
import { layerSwipeReducer } from '@src/store/layerSwipe/layerSwipe.reducer';
import { extendedLayersReducer } from '@src/store/layers/layers.reducer';
import { legendsReducer } from '@src/store/legends/legends.reducer';
import { createMainMenuReducer } from '@src/store/mainMenu/mainMenu.reducer';
import { mapReducer } from '@src/store/map/map.reducer';
import { mapContextMenuReducer } from '@src/store/mapContextMenu/mapContextMenu.reducer';
import { measurementReducer } from '@src/store/measurement/measurement.reducer';
import { createMediaReducer } from '@src/store/media/media.reducer';
import { mfpReducer } from '@src/store/mfp/mfp.reducer';
import { modalReducer } from '@src/store/modal/modal.reducer';
import { createNavigationRailReducer } from '@src/store/navigationRail/navigationRail.reducer';
import { networkReducer } from '@src/store/network/network.reducer';
import { notificationReducer } from '@src/store/notifications/notifications.reducer';
import { pointerReducer } from '@src/store/pointer/pointer.reducer';
import { positionReducer } from '@src/store/position/position.reducer';
import { routingReducer } from '@src/store/routing/routing.reducer';
import { searchReducer } from '@src/store/search/search.reducer';
import { sharedReducer } from '@src/store/shared/shared.reducer';
import { stateForEncodingReducer } from '@src/store/stateForEncoding/stateForEncoding.reducer';
import { timeTravelReducer } from '@src/store/timeTravel/timeTravel.reducer';
import { toolsReducer } from '@src/store/tools/tools.reducer';
import { topicsReducer } from '@src/store/topics/topics.reducer';
import { topicsContentPanelReducer } from '@src/store/topicsContentPanel/topicsContentPanel.reducer';
import { combineReducers, createStore } from 'redux';

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
			legends: legendsReducer,
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
				EmbedReadyPlugin: embedReadyPlugin,
				LayersPlugin: layersPlugin,
				LegendsPlugin: legendsPlugin,
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
				EncodeStatePlugin: encodeStatePlugin,
				TimeTravelPlugin: timeTravelPlugin,
				ComparePlugin: comparePlugin,
				FeatureCollectionPlugin: featureCollectionPlugin,
				PublicWebComponentPlugin: publicWebComponentPlugin,
				ObserveStateForEncodingPlugin: observeStateForEncodingPlugin
			} = $injector.inject(
				'GlobalErrorPlugin',
				'AuthPlugin',
				'EmbedReadyPlugin',
				'TopicsPlugin',
				'ChipsPlugin',
				'LayersPlugin',
				'LegendsPlugin',
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
				'EncodeStatePlugin',
				'TimeTravelPlugin',
				'ComparePlugin',
				'FeatureCollectionPlugin',
				'PublicWebComponentPlugin',
				'ObserveStateForEncodingPlugin'
			);

			setTimeout(async () => {
				//register plugins
				await globalErrorPlugin.register(this._store);
				await positionPlugin.register(this._store);
				await embedReadyPlugin.register(this._store);
				await mediaPlugin.register(this._store);
				await timeTravelPlugin.register(this._store);
				await comparePlugin.register(this._store);
				await featureCollectionPlugin.register(this._store);
				await legendsPlugin.register(this._store);
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
				await encodeStatePlugin.register(this._store);
				await publicWebComponentPlugin.register(this._store);

				/**
				 * Plugins with a “long-running” initialization phase.
				 * Use `register` in order to measure its duration
				 */
				await authPlugin.register(this._store);
				await topicsPlugin.register(this._store);
				await layersPlugin.register(this._store);
				await chipsPlugin.register(this._store);

				// should be registered as last plugin
				await observeStateForEncodingPlugin.register(this._store);
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
