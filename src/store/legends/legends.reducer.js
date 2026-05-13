export const LEGEND_ADDED = 'legend/added';
export const LEGEND_REMOVED = 'legend/removed';
export const LEGENDS_CLEARED = 'legend/cleared';

export const initialState = {
	/**
	 * List of active geoResourceIds used for legends.
	 * @type string[]
	 */
	active: []
};

export const legendsReducer = (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case LEGEND_ADDED: {
			if (state.active.includes(payload)) {
				return state;
			}

			return { ...state, active: [...state.active, payload] };
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
	}

	return state;
};
