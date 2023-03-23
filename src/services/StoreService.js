import { combineReducers, createStore } from 'redux';
import { positionReducer } from '../store/position/position.reducer';
import { layersReducer } from '../store/layers/layers.reducer';
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
import { featureInfoReducer } from '../store/featureInfo/featureInfo.reducer';
import { importReducer } from '../store/import/import.reducer';
import { mfpReducer } from '../store/mfp/mfp.reducer';
import { bottomSheetReducer } from '../store/bottomSheet/bottomSheet.reducer';
import { elevationProfileReducer } from '../store/elevationProfile/elevationProfile.reducer';
import { chipsReducer } from '../store/chips/chips.reducer';
import { stateForEncodingReducer } from '../store/stateForEncoding/stateForEncoding.reducer';
import { iframeContainerReducer } from '../store/iframeContainer/iframeContainer.reducer';

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
			tools: toolsReducer,
			modal: modalReducer,
			layers: layersReducer,
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
			iframeContainer: iframeContainerReducer
		});

		this._store = createStore(rootReducer);

		$injector.onReady(async () => {
			const {
				LayersPlugin: layersPlugin,
				TopicsPlugin: topicsPlugin,
				ChipsPlugin: chipsPlugin,
				GeolocationPlugin: geolocationPlugin,
				MeasurementPlugin: measurementPlugin,
				DrawPlugin: drawPlugin,
				PositionPlugin: positionPlugin,
				ContextClickPlugin: contextClickPlugin,
				HighlightPlugin: highlightPlugin,
				MediaPlugin: mediaPlugin,
				FeatureInfoPlugin: featureInfoPlugin,
				MainMenuPlugin: mainMenuPlugin,
				ImportPlugin: importPlugin,
				SearchPlugin: searchPlugin,
				ExportMfpPlugin: exportMfpPlugin,
				ElevationProfilePlugin: elevationProfilePlugin,
				ObserveStateForEncodingPlugin: observeStateForEncodingPlugin,
				IframeStatePlugin: iframeStatePlugin,
				HistoryStatePlugin: historyStatePlugin
			} = $injector.inject(
				'TopicsPlugin',
				'ChipsPlugin',
				'LayersPlugin',
				'GeolocationPlugin',
				'MeasurementPlugin',
				'DrawPlugin',
				'PositionPlugin',
				'ContextClickPlugin',
				'HighlightPlugin',
				'MediaPlugin',
				'FeatureInfoPlugin',
				'MainMenuPlugin',
				'ImportPlugin',
				'SearchPlugin',
				'ExportMfpPlugin',
				'ElevationProfilePlugin',
				'IframeStatePlugin',
				'HistoryStatePlugin',
				'ObserveStateForEncodingPlugin'
			);

			setTimeout(async () => {
				//register plugins
				await mediaPlugin.register(this._store);
				await topicsPlugin.register(this._store);
				await chipsPlugin.register(this._store);
				await layersPlugin.register(this._store);
				await positionPlugin.register(this._store);
				await measurementPlugin.register(this._store);
				await drawPlugin.register(this._store);
				await geolocationPlugin.register(this._store);
				await contextClickPlugin.register(this._store);
				await highlightPlugin.register(this._store);
				await featureInfoPlugin.register(this._store);
				await mainMenuPlugin.register(this._store);
				await importPlugin.register(this._store);
				await searchPlugin.register(this._store);
				await exportMfpPlugin.register(this._store);
				await elevationProfilePlugin.register(this._store);
				await iframeStatePlugin.register(this._store);
				await historyStatePlugin.register(this._store);
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
