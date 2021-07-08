import { NOTIFICATION_ADDED } from './notifications.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
 * Emits a new notification to the system
 * @param {string} message the notification message
 * @param {'info'|'warn'|'error'} level the notification level (@see {@link LevelTypes})
 * @param {Boolean} [isPermanent=false] whether the notification invalidates after 
 * a specific amount of time or stays relevant until the user decides to dismiss
 * the message
 */
export const emitNotification = (message, level, isPermanent = false) => {
	getStore().dispatch({
		type: NOTIFICATION_ADDED,
		payload: new EventLike({ message:message, level:level, permanent:isPermanent })
	});
};