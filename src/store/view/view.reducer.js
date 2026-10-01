import { ViewMode } from '@src/domain/view';

export const VIEW_MODE_CHANGED = 'view/mode';

export const initialState = {
	/**
	 * Current view mode
	 * @property {ViewMode}
	 */
	mode: ViewMode.D2
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
