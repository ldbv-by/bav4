import { LAZY_INIT_PROPERTY_FLAG } from '@src/utils/propertyUtils';

export const VIEW_MODE_CHANGED = 'view/mode';

export const initialState = {
	/**
	 * Current view mode
	 * @property {ViewMode}
	 */
	mode: LAZY_INIT_PROPERTY_FLAG
};

export const viewReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case VIEW_MODE_CHANGED: {
			return {
				...state,
				mode: payload
			};
		}
	}

	return state;
};
