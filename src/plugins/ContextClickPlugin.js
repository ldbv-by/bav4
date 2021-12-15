import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { html } from 'lit-html';
import { close, open } from '../store/mapContextMenu/mapContextMenu.action';
import { emitFixedNotification } from '../store/notifications/notifications.action';
import { $injector } from '../injection';


/**
 * Plugin for contextClick state managment.
 * @class
 * @author taulinger
 */
export class ContextClickPlugin extends BaPlugin {

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		const onContextClick = (eventlike) => {
			const evt = eventlike.payload;

			const { EnvironmentService: environmentService }
				= $injector.inject('EnvironmentService');

			const content = html`<ba-map-context-menu-content .coordinate=${evt.coordinate}></ba-map-context-menu-content`;

			if (environmentService.isTouch()) {
				emitFixedNotification(content);
			}
			else {
				open([evt.screenCoordinate[0], evt.screenCoordinate[1]], content);
			}
		};

		observe(store, state => state.pointer.contextClick, onContextClick);
		observe(store, state => state.pointer.click, () => close());
		observe(store, state => state.map.moveStart, () => close());
	}
}
