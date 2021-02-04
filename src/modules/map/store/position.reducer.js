export const ZOOM_CHANGED = 'map/zoom';
export const POSITION_CHANGED = 'map/position';
export const ZOOM_POSITION_CHANGED = 'map/zoom_position';
export const POINTER_POSITION_CHANGED = 'map/pointerPosition';


export const initialState = {
	zoom: 12,
	position: [1288239.2412306187, 6130212.561641981],
	pointerPosition : null
};

export const positionReducer = (state = initialState, action) => {

	const { type, payload } = action;
	switch (type) {
		case ZOOM_CHANGED: {

			return {
				...state,
				zoom: payload

			};
		}
		case POSITION_CHANGED: {

			return {
				...state,
				position: payload
			};
		}
		case ZOOM_POSITION_CHANGED: {
			const { zoom, position } = payload;

			return {
				...state,
				zoom: zoom,
				position: position
			};
		}

		case POINTER_POSITION_CHANGED: {

			return {
				...state,
				pointerPosition: payload
			};
		}
	}

	return state;
};
