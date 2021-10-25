import { emitFixedNotification } from '../store/notifications/notifications.action';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * This plugin observes the map-properties, which are related to user-interactions within the map:
 * - beingDragged
 * - contextClick
 * - click
 *
 * On changes, it sets the content for the fixedNotification to null, the fixedNotification disappears
 */
export class NotificationPlugin extends BaPlugin {

	/**
     * @override
     * @param {Store} store
     */
	async register(store) {
		observe(store, state => state.pointer.beingDragged, () => emitFixedNotification(null));
		observe(store, state => state.pointer.contextClick, () => emitFixedNotification(null));
		observe(store, state => state.pointer.click, () => emitFixedNotification(null));
	}
}
