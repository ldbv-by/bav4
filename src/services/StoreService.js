import { combineReducers, createStore } from 'redux';
import { positionReducer } from '../modules/map/store/position.reducer';
import { sidePanelReducer } from '../modules/menue/store/sidePanel.reducer';
import { modalReducer } from '../modules/modal/store/modal.reducer';
import { contextMenueReducer } from '../modules/contextMenue/store/contextMenue.reducer';
import { uiThemeReducer } from '../modules/uiTheme/store/uiTheme.reducer';
import { layersReducer } from '../modules/map/store/layers.reducer';
import { mapContextMenuReducer } from '../modules/map/store/mapContextMenu.reducer';
import { measurementReducer } from '../modules/map/store/measurement.reducer';
import { register as registerMeasurementObserver } from '../modules/map/store/measurement.observer';
import { register as registerGeolocationObserver } from '../modules/map/store/geolocation.observer';
import { geolocationReducer } from '../modules/map/store/geolocation.reducer';
import { pointerReducer } from '../modules/map/store/pointer.reducer';
import { mapReducer } from '../modules/map/store/map.reducer';
import { $injector } from '../injection';




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
			contextMenue: contextMenueReducer,
			modal: modalReducer,
			uiTheme: uiThemeReducer,
			layers: layersReducer,
			mapContextMenu: mapContextMenuReducer,
			measurement: measurementReducer,
			geolocation: geolocationReducer
		});

		this._store = createStore(rootReducer);

		$injector.onReady(() => {

			const {
				LayersObserver: layersObserver,
				PositionObserver: positionObserver
			}
				= $injector.inject('LayersObserver', 'PositionObserver');
	
				
			registerMeasurementObserver(this._store);
			registerGeolocationObserver(this._store);
			layersObserver.register(this.store);
			positionObserver.register(this.store);
		});
	}

	/**
	 * Returns the fully initialized store.
	 */
	getStore() {
		return this._store;
	}
}
