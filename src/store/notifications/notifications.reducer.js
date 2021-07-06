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
});


/**
* @typedef {Object} Notification
* @property {string} message the notification message
* @property {'info'|'warn'|'error'} level the notification level (@see {@link LevelTypes})
* @property {Boolean} permanent whether the notification invalidates after 
* a specific amount of time or stays relevant until the user decides to dismiss
* the message
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