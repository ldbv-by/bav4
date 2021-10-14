export const NOTIFICATION_ADDED = 'notification/added';

/**
 * Enum for notification levels.
 * @readonly
 * @enum {string}
 */
export const LevelTypes = Object.freeze({
	INFO: Symbol.for('info'),
	WARN: Symbol.for('warn'),
	ERROR: Symbol.for('error'),
	CUSTOM: Symbol.for('custom')
});


export const initialState = {
	/**
    * @type {EventLike<Notification>}
     */
	notification: null
};

export const notificationReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case NOTIFICATION_ADDED: {
			return {
				...state, notification: payload
			};

		}
	}
	return state;
};
