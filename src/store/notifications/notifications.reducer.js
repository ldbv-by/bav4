export const NOTIFICATION_ADDED = 'notification/added';

/**
 * @enum
 */
export const LevelTypes = Object.freeze({
	INFO: Symbol.for('info'),
	WARN: Symbol.for('warn'),
	ERROR: Symbol.for('error'),
});


/**
* @typedef {Object} Notification
* @property {string} message the notification message
* @property {enum} level the notification level
* @property {Boolean} permanent whether thethe notification level
 */



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