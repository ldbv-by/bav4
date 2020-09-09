export const ZOOM_CHANGED = 'map/zoom';
export const POSITION_CHANGED = 'map/position';
export const ZOOM_POSITION_CHANGED = 'map/zoom_position';
export const POINTER_POSITION_CHANGED = 'map/pointerPosition';

const events = (state, action) => {
	const { type, payload } = action;
	switch (type) {
	case ZOOM_CHANGED: {
		const map = {
			...state.map,
			zoom: payload

		};
		return {
			...state,
			map: map

		};
	}
	case POSITION_CHANGED: {
		const map = {
			...state.map,
			position: payload

		};
		return {
			...state,
			map: map
		};
	}
	case ZOOM_POSITION_CHANGED: {
		const { zoom, position } = payload;
		const map = {
			...state.map,
			zoom: zoom,
			position: position


		};
		return {
			...state,
			map: map
		};
	}

	case POINTER_POSITION_CHANGED: {
		const map = {
			...state.map,
			pointerPosition: payload

		};
		return {
			...state,
			map: map

		};
	}
	}

	return state;
};

export default events;
