import { combineReducers, createStore } from 'redux';
import { mapReducer, initialState as initialMapState, ZOOM_CHANGED, POSITION_CHANGED } from '../components/map/store/olMap.reducer';
import { sidePanelReducer } from '../components/menue/sidePanel/store/sidePanel.reducer';
import { contextMenueReducer } from '../components/contextMenue/store/contextMenue.reducer';
import ReduxQuerySync from 'redux-query-sync';




/**
 * Service which holds the redux store.
 * @class
 * @author aul
 */
export class StoreService {

	constructor() {

		const storeEnhancer = ReduxQuerySync.enhancer({
			params: {
				zoom: {
					selector: state => state.map.zoom,

					action: value => ({
						type: ZOOM_CHANGED,
						payload: value
					}),

					/*
					 * Cast the parameter value to a number (we map invalid values to 1, which will then
					 * hide the parameter).
					 */
					stringToValue: (string) => Number.parseFloat(string) || initialMapState.zoom,

					// We then also specify the inverse function (this example one is the default)
					valueToString: value => `${value}`,

					/*
					 * When state.pageNumber equals 1, the parameter p is hidden (and vice versa).
					 * defaultValue: initialState.map.zoom,
					 */
					defaultValue: initialMapState.zoom,
				},
				position: {
					selector: state => state.map.position,
					action: value => ({
						type: POSITION_CHANGED,
						payload: value
					}),

					//TODO: handler non parseable string
					stringToValue: (string) => string.split(',').map(Number.parseFloat),

					valueToString: value => {
						if (value) {
							return value.join(',');
						}
					},

					defaultValue: initialMapState.position,
				},
			},
			initialTruth: 'location',

		});

		const rootReducer = combineReducers({
			/*
			 * must be named like the field of the state
			 * see: https://redux.js.org/recipes/structuring-reducers/initializing-state#combined-reducers
			 */
			map: mapReducer,
			sidePanel: sidePanelReducer,
			contextMenue: contextMenueReducer
		});

		this.store = createStore(rootReducer, storeEnhancer);
	}

	/**
	 * Returns the store.
	 */
	getStore() {
		return this.store;

	}
}