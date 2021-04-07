import { combineReducers, createStore } from 'redux';
import { positionReducer } from '../modules/map/store/position.reducer';
import { sidePanelReducer } from '../modules/menu/store/sidePanel.reducer';
import { contentPanelReducer } from '../modules/menu/store/contentPanel.reducer';
import { toolBoxReducer } from '../modules/menu/store/toolBox.reducer';
import { modalReducer } from '../modules/modal/store/modal.reducer';
import { contextMenueReducer } from '../modules/contextMenue/store/contextMenue.reducer';
import { uiThemeReducer } from '../modules/uiTheme/store/uiTheme.reducer';
import { layersReducer } from '../modules/map/store/layers.reducer';
import { mapContextMenuReducer } from '../modules/map/store/mapContextMenu.reducer';
import { measurementReducer } from '../modules/map/store/measurement.reducer';
import { geolocationReducer } from '../modules/map/store/geolocation.reducer';
import { pointerReducer } from '../modules/map/store/pointer.reducer';
import { mapReducer } from '../modules/map/store/map.reducer';
import { $injector } from '../injection';
import { topicsReducer } from '../modules/topics/store/topics.reducer';


/**
 * Service which configures, initializes and holds the redux store.
 * @class
 * @author aul
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
			sidePanel: sidePanelReducer,
			contentPanel: contentPanelReducer,
			toolBox: toolBoxReducer,
			contextMenue: contextMenueReducer,
			modal: modalReducer,
			uiTheme: uiThemeReducer,
			layers: layersReducer,
			mapContextMenu: mapContextMenuReducer,
			measurement: measurementReducer,
			geolocation: geolocationReducer,
			topics: topicsReducer
		});

		this._store = createStore(rootReducer);

		$injector.onReady(async () => {

			const {
				LayersPlugin: layersPlugin,
				TopicsPlugin: topicsPlugin,
				GeolocationPlugin: geolocationPlugin,
				MeasurementPlugin: measurementPlugin,
				PositionPlugin: positionPlugin,
				ContextClickPlugin: ContextClickPlugin,
				EnvironmentService: environmentService
			}
			= $injector.inject(
				'TopicsPlugin',
				'LayersPlugin',
				'GeolocationPlugin',
				'MeasurementPlugin',
				'PositionPlugin',
				'ContextClickPlugin',
				'EnvironmentService'
			);

			setTimeout(async() => {
				//register plugins
				await topicsPlugin.register(this._store);
				await layersPlugin.register(this._store);
				await positionPlugin.register(this._store);
				await measurementPlugin.register(this._store);
				await geolocationPlugin.register(this._store);
				await ContextClickPlugin.register(this._store);
				//we remove all query params shown in the browsers address bar
				environmentService.getWindow().history.replaceState(null, '', location.href.split('?')[0]);
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
