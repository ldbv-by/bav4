/**
 * @module modules/olMap/handler/selectableFeature/OlSelectableFeatureHandler
 */
import LayerGroup from '../../../../../node_modules/ol/layer/Group';
import { $injector } from '../../../../injection/index';
import { observe } from '../../../../utils/storeUtils';
import { OlMapHandler } from '../OlMapHandler';

/**
 * {@link OlMapHandler} that indicates if a vector feature or a pixel of a raster layer is selectable
 * (e.g. for a retrieving feature info)
 * by changing the cursor when a user moves the pointer over it.
 * The handler does nothing when a tool is active.
 * @class
 * @author taulinger
 */
export class OlSelectableFeatureHandler extends OlMapHandler {
	#handleEvent = false;
	#storeService;
	#geoResourceService;
	constructor() {
		super('SelectableFeature_Handler');
		const { StoreService, GeoResourceService } = $injector.inject('StoreService', 'GeoResourceService');
		this.#storeService = StoreService;
		this.#geoResourceService = GeoResourceService;
	}

	register(map) {
		observe(
			this.#storeService.getStore(),
			(state) => state.tools.current,
			(current) => {
				this.#handleEvent = current === null;
			},
			false
		);

		map.on('pointermove', (evt) => {
			if (evt.dragging || !this.#handleEvent) {
				// the event is a drag gesture, no need to handle here
				return;
			}

			const pixel = map.getEventPixel(evt.originalEvent);
			const feature = map.forEachFeatureAtPixel(
				pixel,
				(someFeature) => someFeature, // returns first element
				{
					layerFilter: (l) => !!this.#geoResourceService.byId(l.get('geoResourceId'))?.queryable
				}
			);
			// change the cursor style
			map.getTargetElement().style.cursor = feature || this._getDataAtPixel(evt.pixel, map) ? 'pointer' : '';
		});
	}

	_getDataAtPixel(pixel, olMap) {
		return olMap
			.getLayers()
			.getArray()
			.map((l) => (l instanceof LayerGroup ? l.getLayers().getArray() : l)) // resolve group layer
			.flat()
			.filter((l) => l.getVisible())
			.filter((l) => !!this.#geoResourceService.byId(l.get('geoResourceId'))?.queryable)
			.some((layer) => {
				const data = layer.getData(pixel);
				return data && data[3] > 0; // transparent pixels have zero for data[3]
			});
	}
}
