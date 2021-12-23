export const CONTENT_CHANGED = 'toolbox/toolContainer/contentId';

export const initialState = {
	open: false,
	contentId: null
};

export const toolContainerReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {

		case CONTENT_CHANGED: {

			return {
				...state,
				contentId: payload
			};
		}
	}
	return state;
};
