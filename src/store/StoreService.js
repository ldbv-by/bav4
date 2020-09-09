import { createStore } from 'redux';
import events from './map/reducer.js';
import { ZOOM_CHANGED, POSITION_CHANGED } from './map/reducer';
import ReduxQuerySync from 'redux-query-sync';




/**
 * Service which holds the redux store.
 * @class
 * @author aul
 */
export class StoreService {

	constructor() {
		const initialState = {
			map: {

				zoom: 12,
				position: [1288239.2412306187, 6130212.561641981]

			}
		};

		const storeEnhancer = ReduxQuerySync.enhancer({
			params: {
				zoom: {
					selector: state => state.map.zoom,
					action: value => ({ type: ZOOM_CHANGED, payload: value }),

					// Cast the parameter value to a number (we map invalid values to 1, which will then
					// hide the parameter).
					stringToValue: (string) => Number.parseFloat(string) || initialState.map.zoom,

					// We then also specify the inverse function (this example one is the default)
					valueToString: value => `${value}`,

					// When state.pageNumber equals 1, the parameter p is hidden (and vice versa).
					// defaultValue: initialState.map.zoom,
					defaultValue: initialState.map.zoom,
				},
				position: {
					selector: state => state.map.position,
					action: value => ({ type: POSITION_CHANGED, payload: value }),

					//TODO: handler non parseable string
					stringToValue: (string) => string.split(',').map(Number.parseFloat),

					valueToString: value => {
						return value.join(','); 
					},

					defaultValue: initialState.map.position,
				},
			},
			initialTruth: 'location',

			// Use replaceState so the browser's back/forward button will skip over these page changes.
			// replaceState: true,
		});

		this.store = createStore(events, initialState, storeEnhancer);

	}

	/**
         * Returns the store.
         */
	getStore() {
		return this.store;

	}
}