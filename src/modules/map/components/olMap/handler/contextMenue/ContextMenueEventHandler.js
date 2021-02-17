import { OlMapEventHandler } from '../OlMapEventHandler';
import { open, close } from '../../../../store/mapContextMenue.action';
import { $injector } from '../../../../../../injection';
import { MapContextMenue } from '../../../contextMenue/MapContextMenue';
import { OlMapContextMenueContent } from './OlMapContextMenueContent';

if (!window.customElements.get(OlMapContextMenueContent.tag)) {
	window.customElements.define(OlMapContextMenueContent.tag, OlMapContextMenueContent);
}


export class ContextMenueEventHandler extends OlMapEventHandler {

	constructor() {
		super('CONTEXTMENUE_HANDLER');
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

		//create and add a MapContextMenue element
		const mapContextMenue = document.createElement(MapContextMenue.tag);
		document.body.appendChild(mapContextMenue);
		const contentElementId = OlMapContextMenueContent.tag + '_generatedByContextMenueEventHandler';

		this._map.addEventListener('contextmenu', (evt) => {
			evt.preventDefault();

			/**
			 * On every contextmenu event we create a new content element and add it to the DOM.
			 * We do not pollute the DOM because the map-context-menue extracts it immediately from there (by id)
			 * and inserts it in its Shadow DOM.
			 */
			const mapContextMenueContent = document.createElement(OlMapContextMenueContent.tag);
			document.body.appendChild(mapContextMenueContent);
			mapContextMenueContent.id = contentElementId;
			mapContextMenueContent.coordinate = evt.map.getCoordinateFromPixel([evt.originalEvent.pageX, evt.originalEvent.pageY]);

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