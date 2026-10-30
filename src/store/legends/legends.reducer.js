export const LEGEND_ADDED = 'legend/added';
export const LEGEND_REMOVED = 'legend/removed';
export const LEGENDS_CLEARED = 'legend/cleared';
export const LEGEND_RESOURCES_READY = 'legend/resources/ready';

export const initialState = {
	/**
	 * List of active geoResourceIds used for legends.
	 * @type string[]
	 */
	active: [],

	/**
	 * Flag that indicates if the topics store is ready. "Ready" means all required resources are available.
	 *  @property {boolean}
	 */
	ready: false
};

export const legendsReducer = (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case LEGEND_ADDED: {
			// Set is used to enforce uniqueness
			if (Array.isArray(payload)) {
				return { ...state, active: [...new Set([...state.active, ...payload])] };
			}

			return { ...state, active: [...new Set([...state.active, payload])] };
		}
		case LEGEND_REMOVED: {
			const delIndex = state.active.findIndex((id) => payload === id);
			if (delIndex > -1) {
				const filtered = state.active.toSpliced(delIndex, 1);
				return { ...state, active: filtered };
			}

			return state;
		}
		case LEGENDS_CLEARED: {
			return { ...state, active: [] };
		}
		case LEGEND_RESOURCES_READY: {
			return {
				...state,
				ready: payload
			};
		}
	}

	return state;
};
