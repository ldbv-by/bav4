export const MODAL_CHANGED = 'components/modal/contentChanged';

export const initialState = {
	title:false, content:false
};

export const modalReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MODAL_CHANGED: {
			const { title, content } = payload;
			return {
				...state,
				title:title,
				content: content,
			};
		}
	}

	return state;
};