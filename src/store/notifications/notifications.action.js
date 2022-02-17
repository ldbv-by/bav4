import { NOTIFICATION_ADDED } from './notifications.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

/**
 * @module notification/action
 */

/**
 * Enum for notification levels.
 * @readonly
 * @enum {string}
 */
export const LevelTypes = Object.freeze({
	INFO: Symbol.for('info'),
	WARN: Symbol.for('warn'),
	ERROR: Symbol.for('error')
});

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
* @typedef {Object} Notification
* @property {string|TemplateResult} content The notification content. Could either be a a plain string or a lit-html TemplateResult.
* @property {'info'|'warn'|'error'} level the notification level (@see {@link LevelTypes})
 */

/**
 * Emits a new notification to the system
 * @param {string} content The notification content.
 * @param {'info'|'warn'|'error'} level the notification level (@see {@link LevelTypes})
 * @function
  */
export const emitNotification = (content, level) => {
	getStore().dispatch({
		type: NOTIFICATION_ADDED,
		payload: new EventLike({ content: content, level: level })
	});
};

/**
 * Emits a new fixed notification to the system
 * @property {string|TemplateResult} content The notification content. Could either be a a plain string or a lit-html TemplateResult.
 * @function
*/
export const emitFixedNotification = (content) => {
	getStore().dispatch({
		type: NOTIFICATION_ADDED,
		payload: new EventLike({ content: content })
	});
};

/**
 * Clears the fixed notification
 */
export const clearFixedNotification = () => {
	getStore().dispatch({
		type: NOTIFICATION_ADDED,
		payload: new EventLike({ content: null })
	});
};
