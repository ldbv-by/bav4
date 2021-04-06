export const OPEN_CLOSED_CHANGED = 'components/toolContainer/open';
export const CONTENT_CHANGED = 'components/toolContainer/content';

export const initialState = {
	open: false,
	content:false
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

		case CONTENT_CHANGED: {

			return {
				...state,
				content: payload
			};
		}
	}
	return state;
};