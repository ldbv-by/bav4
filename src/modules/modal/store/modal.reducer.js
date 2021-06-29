export const MODAL_CHANGED = 'components/modal/contentChanged';

export const initialState = {
	/**
	 * @property {ModalData|null}
	 */
	data: null,

	/**
	 * @property {boolean}
	 */
	active: false
};

export const modalReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MODAL_CHANGED: {
			return {
				...state,
				data: payload,
				active: !!payload
			};
		}
	}

	return state;
};