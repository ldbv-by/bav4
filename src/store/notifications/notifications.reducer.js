export const NOTIFICATION_ADDED = 'notification/added';

export const initialState = {
	/**
	 * @type {EventLike<Notification>}
	 */
	latest: null
};

export const notificationReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case NOTIFICATION_ADDED: {
			return {
				...state,
				latest: payload
			};
		}
	}
	return state;
};
