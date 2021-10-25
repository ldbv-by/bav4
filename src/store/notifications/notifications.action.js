import { NOTIFICATION_ADDED } from './notifications.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

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
 * @param {string|TemplateResult} content The notification content. Could either be a a plain string or a lit-html TemplateResult.
 * @param {'info'|'warn'|'error'|'custom'} level the notification level (@see {@link LevelTypes})
 * @param {Boolean} [isPermanent=false] whether the notification invalidates after
 * a specific amount of time or stays relevant until the user decides to dismiss
 * the message
 */
export const emitNotification = (content, level, isPermanent = false) => {
	getStore().dispatch({
		type: NOTIFICATION_ADDED,
		payload: new EventLike({ content: content, level: level, permanent: isPermanent })
	});
};
