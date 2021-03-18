import { OlMapEventHandler } from '../OlMapEventHandler';
import { open, close } from '../../../../store/mapContextMenu.action';
import { $injector } from '../../../../../../injection';
import { MapContextMenu } from '../../../contextMenu/MapContextMenu';
import { OlMapContextMenuContent } from './OlMapContextMenuContent';

if (!window.customElements.get(OlMapContextMenuContent.tag)) {
	window.customElements.define(OlMapContextMenuContent.tag, OlMapContextMenuContent);
}


export class OlContextMenuEventHandler extends OlMapEventHandler {

	constructor() {
		super('CONTEXTMENU_HANDLER');
		const {
			ShareService: shareService,
		} = $injector.inject('ShareService');
		this._shareService = shareService;
	}

	/**
	 * 
	 * @param {*} olMap 
	 */
	register(olMap) {
		this._map = olMap;

		//create and add a MapContextMenu element
		const mapContextMenu = document.createElement(MapContextMenu.tag);
		document.body.appendChild(mapContextMenu);
		const contentElementId = OlMapContextMenuContent.tag + '_generatedByContextMenuEventHandler';

		this._map.addEventListener('contextmenu', (evt) => {
			evt.preventDefault();

			/**
			 * On every contextmenu event we create a new content element and add it to the DOM.
			 * We do not pollute the DOM because the map-context-menu extracts it immediately from there (by id)
			 * and inserts it in its Shadow DOM.
			 */
			const mapContextMenuContent = document.createElement(OlMapContextMenuContent.tag);
			document.body.appendChild(mapContextMenuContent);
			mapContextMenuContent.id = contentElementId;
			mapContextMenuContent.coordinate = evt.map.getCoordinateFromPixel([evt.originalEvent.pageX, evt.originalEvent.pageY]);

			open([evt.originalEvent.pageX, evt.originalEvent.pageY], contentElementId);
		});

		this._map.on('singleclick', (e) => {
			e.preventDefault();
			close();
		});

		this._map.on('movestart', () => {
			close();
		});
	}
}