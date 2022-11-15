import { EventLike } from '../../utils/storeUtils';

export const GEORESOURCE_CHANGED = 'georesources/changed';

export const initialState = {
	changed: new EventLike(null)
};

export const geoResourcesReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {

		case GEORESOURCE_CHANGED: {

			return {
				...state,
				changed: payload
			};
		}
	}
	return state;
};
