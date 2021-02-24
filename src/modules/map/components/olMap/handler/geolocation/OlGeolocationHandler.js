import { OlLayerHandler } from '../OlLayerHandler';
import { StateStoreConsumentMixin } from './StateStoreConsument.mixin';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Stroke, Fill, Circle } from 'ol/style';


const GEOLOCATION_LAYER_ID = 'geolocation_layer';
const GEOLOCATION_STYLE = new Style({
	fill: new Fill({
		color: [255, 0, 0, 0.1]
	}),
	stroke: Stroke({
		color: [255, 0, 0, 0.9],
		width: 3
	}),
	image: new Circle({
		radius: 5,
		fill: new Fill({
			color: [255, 0, 0, 0.9]
		}),
		stroke: new Stroke({
			color: [255, 255, 255, 1],
			width: 3
		})
	})
});
/**
 * Handler for display geolocation information on the map
 * @class
 * @author thiloSchlemmer
 */
export class OlGeolocationHandler extends StateStoreConsumentMixin(OlLayerHandler) {

	constructor() {
		super(GEOLOCATION_LAYER_ID);
		this._geolocationLayer = null;
		this._projection = null;
	}

	/**
	 * Activates the Handler.
	 * @override
	 */
	activate(olMap) {
		if (this._geolocationLayer === null) {
			const source = new VectorSource({ wrapX: false });
			this._geolocationLayer = new VectorLayer({
				source: source,
				style: () => [GEOLOCATION_STYLE]
			});
		}
		this._projection = olMap.getView().getProjection();


	}

	/**
	 *  @override
	 *  @param {Map} olMap
	 */
	deactivate(olMap) {
		//use the map to unregister event listener, interactions, etc
		//olLayer currently undefined, will be fixed later		

		this._geolocationLayer = null;
	}

}