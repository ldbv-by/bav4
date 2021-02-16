import { OlMapEventHandler } from '../OlMapEventHandler';
import { open, close } from '../../../../store/mapContextMenue.action';
import { $injector } from '../../../../../../injection';
import { MapContextMenue } from './MapContextMenue';
if (!window.customElements.get(MapContextMenue.tag)) {
	window.customElements.define(MapContextMenue.tag, MapContextMenue);
}

export class ContextMenueEventHandler extends OlMapEventHandler {

	constructor() {
		super( 'CONTEXTMENUE_HANDLER');
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

		const mapContextMenue = document.createElement(MapContextMenue.tag);
		document.body.appendChild(mapContextMenue); 


		this._map.addEventListener('contextmenu', (evt) => {
			evt.preventDefault();
			open({ x: evt.originalEvent.pageX, y: evt.originalEvent.pageY }, {});
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