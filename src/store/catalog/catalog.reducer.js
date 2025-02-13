export const OPEN_NODES_CHANGED = 'catalog/openNodes';

export const initialState = {
	/**
	 * List of IDs of currently open catalog nodes).
	 */
	openNodes: []
};

export const catalogReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case OPEN_NODES_CHANGED: {
			return {
				...state,
				openNodes: [...new Set(payload)]
			};
		}
	}

	return state;
};
