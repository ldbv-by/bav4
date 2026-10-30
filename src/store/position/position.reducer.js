import { EventLike } from '../../utils/storeUtils';

export const ZOOM_CHANGED = 'position/zoom';
export const LIVE_ZOOM_CHANGED = 'position/live_zoom';
export const ZOOM_ROTATION_CHANGED = 'position/zoom_rotation';
export const CENTER_CHANGED = 'position/center';
export const LIVE_CENTER_CHANGED = 'position/live_center';
export const CENTER_ROTATION_CHANGED = 'position/center_rotation';
export const ZOOM_CENTER_CHANGED = 'position/zoom_center';
export const ZOOM_CENTER_ROTATION_CHANGED = 'position/zoom_center_rotation';
export const ZOOM_CENTER_ROTATION_PITCH_ROLL_CHANGED = 'position/zoom_center_rotation_pitch_roll';
export const ROTATION_CHANGED = 'position/rotation';
export const LIVE_ROTATION_CHANGED = 'position/live_rotation';
export const PITCH_CHANGED = 'position/pitch';
export const LIVE_PITCH_CHANGED = 'position/live_pitch';
export const ROLL_CHANGED = 'position/roll';
export const LIVE_ROLL_CHANGED = 'position/live_roll';
export const LIVE_ROTATION_PITCH_ROLL_CHANGED = 'position/live_rotation_pitch_roll';
export const FIT_REQUESTED = 'position/fit';
export const FIT_LAYER_REQUESTED = 'position/fit_layer';

const defaultCenter = [1288239.2412306187, 6130212.561641981];
const defaultZoom = 12;
const defaultPitch = Math.PI * -0.5;

export const initialState = {
	zoom: defaultZoom,
	liveZoom: defaultZoom,
	center: defaultCenter,
	liveCenter: defaultCenter,
	rotation: 0,
	liveRotation: 0,
	pitch: defaultPitch,
	livePitch: defaultPitch,
	roll: 0,
	liveRoll: 0,
	fitRequest: new EventLike(null),
	fitLayerRequest: new EventLike(null)
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
		case LIVE_ZOOM_CHANGED: {
			return {
				...state,
				liveZoom: payload
			};
		}
		case ZOOM_ROTATION_CHANGED: {
			const { zoom, rotation } = payload;

			return {
				...state,
				zoom,
				rotation
			};
		}
		case CENTER_CHANGED: {
			return {
				...state,
				center: payload
			};
		}
		case LIVE_CENTER_CHANGED: {
			return {
				...state,
				liveCenter: payload
			};
		}
		case CENTER_ROTATION_CHANGED: {
			const { center, rotation } = payload;

			return {
				...state,
				center,
				rotation
			};
		}
		case ZOOM_CENTER_CHANGED: {
			const { zoom, center } = payload;

			return {
				...state,
				zoom,
				center
			};
		}
		case ZOOM_CENTER_ROTATION_CHANGED: {
			const { zoom, center, rotation } = payload;

			return {
				...state,
				zoom,
				center,
				rotation
			};
		}
		case ZOOM_CENTER_ROTATION_PITCH_ROLL_CHANGED: {
			const { zoom, center, rotation, pitch, roll } = payload;

			return {
				...state,
				zoom,
				center,
				rotation,
				pitch,
				roll
			};
		}
		case ROTATION_CHANGED: {
			return {
				...state,
				rotation: payload
			};
		}
		case LIVE_ROTATION_CHANGED: {
			return {
				...state,
				liveRotation: payload
			};
		}
		case PITCH_CHANGED: {
			return {
				...state,
				pitch: payload
			};
		}
		case LIVE_PITCH_CHANGED: {
			return {
				...state,
				livePitch: payload
			};
		}
		case ROLL_CHANGED: {
			return {
				...state,
				roll: payload
			};
		}
		case LIVE_ROLL_CHANGED: {
			return {
				...state,
				liveRoll: payload
			};
		}
		case LIVE_ROTATION_PITCH_ROLL_CHANGED: {
			const { rotation, pitch, roll } = payload;

			return {
				...state,
				liveRotation: rotation,
				livePitch: pitch,
				liveRoll: roll
			};
		}

		case FIT_REQUESTED: {
			return {
				...state,
				fitRequest: payload
			};
		}

		case FIT_LAYER_REQUESTED: {
			return {
				...state,
				fitLayerRequest: payload
			};
		}
	}

	return state;
};
