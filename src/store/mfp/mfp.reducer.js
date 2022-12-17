
export const ACTIVE_CHANGED = 'mfp/active';
export const SCALE_CHANGED = 'mfp/current/scale';
export const ID_CHANGED = 'mfp/current/id';
export const CURRENT_CHANGED = 'mfp/current';
export const AUTOROTATION_CHANGED = 'mfp/autorotation';
export const SHOW_GRID_CHANGED = 'mfp/showGrid';
export const JOB_REQUEST_CHANGED = 'mfp/job/request';
export const JOB_SPEC_CHANGED = 'mfp/job/spec';


export const initialState = {

	/**
	 * @property {boolean}
	 */
	active: false,
	/**
	 * @property {MfpConstraint}
	 */
	current: {
		id: null,
		scale: null,
		dpi: null
	},
	/**
	* @property {boolean}
	*/
	autoRotation: true,
	/**
	* @property {boolean}
	*/
	showGrid: false,
	/**
	 *@property {EvenLike | null}
	 */
	jobRequest: null,
	/**
	 *@property {EvenLike | null}
	 */
	jobSpec: null
};

export const mfpReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case ACTIVE_CHANGED: {
			return {
				...state,
				active: payload
			};
		}
		case SCALE_CHANGED: {
			const { current } = state;
			return {
				...state,
				current: { ...current, scale: payload }
			};
		}
		case ID_CHANGED: {
			const { current } = state;
			return {
				...state,
				current: { ...current, id: payload }
			};
		}
		case CURRENT_CHANGED: {
			return {
				...state,
				current: payload
			};
		}
		case AUTOROTATION_CHANGED:{
			return {
				...state,
				autoRotation: payload
			};
		}
		case SHOW_GRID_CHANGED:{
			return {
				...state,
				showGrid: payload
			};
		}
		case JOB_REQUEST_CHANGED: {
			return {
				...state,
				jobRequest: payload
			};
		}
		case JOB_SPEC_CHANGED: {
			return {
				...state,
				jobSpec: payload
			};
		}
	}

	return state;
};

