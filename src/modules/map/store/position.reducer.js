export const ZOOM_CHANGED = 'position/zoom';
export const CENTER_CHANGED = 'position/center';
export const ZOOM_CENTER_CHANGED = 'position/zoom_center';
export const POINTER_POSITION_CHANGED = 'position/pointerPosition';
export const FIT_REQUESTED = 'position/fit';


export const initialState = {
	zoom: 12,
	center: [1288239.2412306187, 6130212.561641981],
	pointerPosition : null,
	fitRequest : null
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
		case CENTER_CHANGED: {

			return {
				...state,
				center: payload
			};
		}
		case ZOOM_CENTER_CHANGED: {
			const { zoom, center } = payload;

			return {
				...state,
				zoom: zoom,
				center: center
			};
		}

		case POINTER_POSITION_CHANGED: {

			return {
				...state,
				pointerPosition: payload
			};
		}

		case FIT_REQUESTED: {

			return {
				...state,
				fitRequest: payload
			};
		}
	}

	return state;
};
