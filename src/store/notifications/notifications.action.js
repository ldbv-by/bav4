import { NOTIFICATION_ADDED } from './notifications.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
 * emits a new notification to the system
 * @param {string} message the notification message
 * @param {'info'|'warn'|'error'} level the notification level (@see {@link LevelTypes})
 * @param {Boolean} permanent whether the notification invalidates after 
 * a specific amount of time or stays relevant until the user decide to dismiss
 * the message
 */
export const emitNotification = (message, level, isPermanent) => {
	getStore().dispatch({
		type: NOTIFICATION_ADDED,
		payload: new EventLike({ message:message, level:level, permanent:isPermanent })
	});
};