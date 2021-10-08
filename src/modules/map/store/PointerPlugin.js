import { observe } from '../../../utils/storeUtils';
import { BaPlugin } from '../../../store/BaPlugin';
import { close as closeContextMenu, open as openContextMenu } from './mapContextMenu.action';
import { html } from 'lit-html';


/**
 * Plugin for contextClick state managment.
 * @class
 * @author taulinger
 */
export class PointerPlugin extends BaPlugin {

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		const onClick = (eventlike) => {
			const evt = eventlike.payload;
			openContextMenu([evt.screenCoordinate[0], evt.screenCoordinate[1]], html`<ba-map-context-menu-content .coordinate=${evt.coordinate}></ba-map-context-menu-content`);
		};
		observe(store, state => state.pointer.contextClick, onClick);



		const onContextClick = (eventlike) => {
			const evt = eventlike.payload;
			openContextMenu([evt.screenCoordinate[0], evt.screenCoordinate[1]], html`<ba-map-context-menu-content .coordinate=${evt.coordinate}></ba-map-context-menu-content`);
		};

		observe(store, state => state.pointer.contextClick, onContextClick);
		observe(store, state => state.pointer.click, () => closeContextMenu());
		observe(store, state => state.map.moveStart, () => closeContextMenu());
	}
}
