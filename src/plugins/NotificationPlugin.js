import { clearFixedNotification } from '../store/notifications/notifications.action';
import { observe } from '../utils/storeUtils';
import { debounced } from '../utils/timer';
import { BaPlugin } from './BaPlugin';
const Debounce_Delay = 500;
/**
 * This plugin observes the map-properties, which are related to user-interactions within the map:
 * - beingDragged
 * - contextClick
 * - click
 *
 * On changes, it cleas the content for the fixedNotification, the fixedNotification disappears
 */
export class NotificationPlugin extends BaPlugin {

	/**
     * @override
     * @param {Store} store
     */
	async register(store) {
		const clearDebounced = debounced(Debounce_Delay, () => clearFixedNotification());
		observe(store, state => state.pointer.beingDragged, () => clearDebounced());
		observe(store, state => state.pointer.contextClick, () => clearDebounced());
		observe(store, state => state.pointer.click, () => clearDebounced());
	}
}
