export const ACTIVE_CHANGED = 'layerSwipe/active';
export const LAYER_RANGE_CHANGED = 'layerSwipe/range';
export const LAYER_SIDE_CHANGED = 'layerSwipe/layerside';
export const LAYER_CHANGE_SIDE = 'layerSwipe/changeSide';
export const LAYER_IDS = 'layerSwipe/layerids';
import { EventLike } from '../../utils/storeUtils';

export const initialState = {
	active: false,
	range: 50,
	layerSide: new EventLike(null),
	layerids: []
};

export const layerSwipeReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case ACTIVE_CHANGED: {
			return {
				...state,
				active: payload
			};
		}
		case LAYER_RANGE_CHANGED: {
			return {
				...state,
				range: payload
			};
		}
		case LAYER_SIDE_CHANGED: {
			return {
				...state,
				layerSide: payload
			};
		}
		case LAYER_IDS: {
			return {
				...state,
				layerids: [...new Map([...state.layerids, ...[payload]])]
			};
		}
	}
	return state;
};
