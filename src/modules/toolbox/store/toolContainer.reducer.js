export const OPEN_CLOSED_CHANGED = 'components/toolContainer/open';

export const initialState = {
	open: false
};

export const toolContainerReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case OPEN_CLOSED_CHANGED: {

			return {
				...state,
				open: payload
			};
		}
	}
	return state;
};