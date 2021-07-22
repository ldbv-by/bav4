import { observe } from '../../../utils/storeUtils';
import { BaPlugin } from '../../../store/BaPlugin';
import { MapContextMenu } from '../components/contextMenu/MapContextMenu';
import { MapContextMenuContent } from '../components/contextMenu/MapContextMenuContent';
import { close, open } from './mapContextMenu.action';


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

		//create and add a MapContextMenu element
		const mapContextMenu = document.createElement(MapContextMenu.tag);
		document.body.appendChild(mapContextMenu);
		const contentElementId = MapContextMenuContent.tag + '_generatedByContextMenuEventHandler';

		const onContextClick = (eventlike) => {
			const evt = eventlike.payload;


			/**
			 * On every contextmenu event we create a new content element and add it to the DOM.
			 * We do not pollute the DOM because the map-context-menu extracts it immediately from there (by id)
			 * and inserts it in its Shadow DOM.
			 *
			 * Here we could also load different kind of content panels dependent from current state.
			 */
			const mapContextMenuContent = document.createElement(MapContextMenuContent.tag);
			mapContextMenuContent.id = contentElementId;
			mapContextMenuContent.coordinate = evt.coordinate;
			document.body.appendChild(mapContextMenuContent);

			open([evt.screenCoordinate[0], evt.screenCoordinate[1]], contentElementId);
		};

		observe(store, state => state.pointer.contextClick, onContextClick);
		observe(store, state => state.pointer.click, () => close());
		observe(store, state => state.map.moveStart, () => close());
	}
}