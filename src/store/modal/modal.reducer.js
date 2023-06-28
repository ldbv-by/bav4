export const MODAL_OPEN_CLOSE = 'modal/open-close';
export const MODAL_INCREMENT_STEP = 'modal/incrementStep';
export const MODAL_DECREMENT_STEP = 'modal/decrementStep';

export const initialState = {
	/**
	 * @property {object|null}
	 */
	data: null,

	/**
	 * @property {boolean}
	 */
	active: false,
	/**
	 * @property {number}
	 */
	currentStep: 0,
	/**
	 * @property {number}
	 */
	steps: 1
};

export const modalReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MODAL_OPEN_CLOSE: {
			return {
				...state,
				data: payload,
				active: !!payload,
				currentStep: payload ? state.currentStep : 0,
				steps: payload ? payload.options.steps : 1
			};
		}
		case MODAL_INCREMENT_STEP: {
			return {
				...state,
				currentStep: state.currentStep < state.steps - 1 ? state.currentStep + 1 : state.steps - 1
			};
		}
		case MODAL_DECREMENT_STEP: {
			return {
				...state,
				currentStep: state.currentStep > 0 ? state.currentStep - 1 : 0
			};
		}
	}

	return state;
};
