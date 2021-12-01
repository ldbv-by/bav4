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
	ERROR: Symbol.for('error'),
	CUSTOM: Symbol.for('custom')
});

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
* @typedef {Object} Notification
* @property {string|TemplateResult} content The notification content. Could either be a a plain string or a lit-html TemplateResult.
* @property {'info'|'warn'|'error'|'custom'} level the notification level (@see {@link LevelTypes})
* @property {Boolean} permanent whether the notification invalidates after
* a specific amount of time or stays relevant until the user decides to dismiss
* the message
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
		payload: new EventLike({ content: content, level: level, permanent: false })
	});
};

/**
 * Emits a new fixed notification to the system
 * @param {TemplateResult|null} content The notification content as a lit-html TemplateResult.
 * content === null signals to close the existing fixedNotification
 * @function
*/
export const emitFixedNotification = (content) => {
	getStore().dispatch({
		type: NOTIFICATION_ADDED,
		payload: new EventLike({ content: content, level: LevelTypes.CUSTOM, permanent: true })
	});
};
