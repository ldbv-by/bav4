import { NOTIFICATION_ADDED } from './notifications.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
* @typedef {Object} Notification
* @property {string} message the notification message
* @property {enum} level the notification level
* @property {Boolean} permanent whether thethe notification level
 */

/**
 * sets the current notification
 * @param {Notification} notification
 */
export const emitNotification = (notification) => {
	getStore().dispatch({
		type: NOTIFICATION_ADDED,
		payload: new EventLike(notification)
	});
};