export const DEACTIVATE_LEGEND = 'ea/legend/deactivate';
export const ACTIVATE_LEGEND = 'ea/legend/activate';
export const SET_LEGEND_ITEMS = 'ea/legend/set';
export const SET_PREVIEW_GEORESOURCE_ID = 'ea/legend/preview/add';
export const CLEAR_PREVIEW_GEORESOURCE_ID = 'ea/legend/preview/clear';
export const SET_MAP_RESOLUTION = 'ea/mapResolution/set';

export const initialState = {
	/**
	 * If true the legend is being displayed.
	 * @property {boolean}
	 */
	legendActive: false,

	/**
	 * The georesource id of the layer to preview inside the legend (e.g. mouse over a layer).
	 * @property {String|null}
	 */
	legendGeoresourceId: null,

	/**
	 * The legend items to display.
	 * @property {Array<LegendItem>}
	 */
	legendItems: [],

	/**
	 * The current map resolution.
	 * @property {Double}
	 */
	mapResolution: 0.0
};

export const legendReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case ACTIVATE_LEGEND: {
			return {
				...state,
				legendActive: true
			};
		}
		case DEACTIVATE_LEGEND: {
			return {
				...state,
				legendActive: false
			};
		}
		case SET_PREVIEW_GEORESOURCE_ID: {
			return {
				...state,
				legendGeoresourceId: payload
			};
		}
		case CLEAR_PREVIEW_GEORESOURCE_ID: {
			return {
				...state,
				legendGeoresourceId: null
			};
		}
		case SET_LEGEND_ITEMS: {
			return {
				...state,
				legendItems: payload
			};
		}
		case SET_MAP_RESOLUTION: {
			return {
				...state,
				mapResolution: payload
			};
		}
	}

	return state;
};
