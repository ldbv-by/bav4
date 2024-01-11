/**
 * @module modules/olMap/handler/selectableFeature/OlSelectableFeatureHandler
 */
import BaseTileLayer from '../../../../../node_modules/ol/layer/BaseTile';
import ImageLayer from '../../../../../node_modules/ol/layer/Image';
import { $injector } from '../../../../injection/index';
import { observe } from '../../../../utils/storeUtils';
import { OlMapHandler } from '../OlMapHandler';

/**
 * {@link OlMapHandler} that indicates if a vector feature or a pixel of a WMS or tile image is selectable
 * (e.g. for a retrieving feature info)
 * by changing the cursor when a user moves the pointer over it.
 * The handler does nothing when a tool is active.
 * @class
 * @author taulinger
 */
export class OlSelectableFeatureHandler extends OlMapHandler {
	#handleEvent = false;
	constructor() {
		super('SelectableFeature_Handler');
		const { StoreService: storeService } = $injector.inject('StoreService');
		this._storeService = storeService;
	}

	register(map) {
		observe(
			this._storeService.getStore(),
			(state) => state.tools.current,
			(current) => {
				this.#handleEvent = current === null;
			},
			false
		);

		const getDataAtPixel = (pixel) => {
			return map
				.getLayers()
				.getArray()
				.filter((l) => l instanceof ImageLayer || l instanceof BaseTileLayer)
				.find((wmsLayer) => {
					const data = wmsLayer.getData(pixel);
					return data && data[3] > 0; // transparent pixels have zero for data[3]
				})
				? true
				: false;
		};

		map.on('pointermove', (evt) => {
			if (evt.dragging || !this.#handleEvent) {
				// the event is a drag gesture, no need to handle here
				return;
			}

			const pixel = map.getEventPixel(evt.originalEvent);
			const feature = map.forEachFeatureAtPixel(
				pixel,
				(someFeature) => someFeature // returns first element
			);

			// change the cursor style
			map.getTargetElement().style.cursor = feature || getDataAtPixel(evt.pixel) ? 'pointer' : '';
		});
	}
}
