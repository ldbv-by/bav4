export const OPEN_CLOSED_CHANGED = 'components/menu/contentPanel/open';
export const INDEX_CHANGED =       'components/menu/contentPanel/tabIndex';

export const initialState = {
	open: true,
	tabIndex: 0
};

export const contentPanelReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case OPEN_CLOSED_CHANGED: {

			return {
				...state,
				open: payload
			};
		}

		case INDEX_CHANGED: {

			return {
				...state,
				tabIndex: payload
			};
		}

	}
	return state;
};