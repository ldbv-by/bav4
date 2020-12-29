export const MODAL_CLICK = 'components/modal/click';

export const initialState = {
	title:false, content:false
};

export const modalReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MODAL_CLICK: {
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