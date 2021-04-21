export const OPEN_CLOSED_CHANGED = 'components/menu/mainMenu/open';
export const INDEX_CHANGED =       'components/menu/mainMenumaon/tabIndex';

export const initialState = {
	open: true,
	tabIndex: 0
};

export const mainMenuReducer = (state = initialState, action) => {
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