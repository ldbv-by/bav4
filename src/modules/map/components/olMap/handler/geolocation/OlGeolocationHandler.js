import { $injector } from '../../../../../../injection';
import { observe } from '../../../../../../utils/storeUtils';
import { GEOLOCATION_LAYER_ID } from '../../../../store/geolocation.observer';
import { OlLayerHandler } from '../OlLayerHandler';
import { accuracyStyleFunction, positionStyleFunction } from './StyleUtils';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Point, Circle } from 'ol/geom';



/**
 * Handler for display geolocation information on the map
 * @class
 * @author thiloSchlemmer
 */
export class OlGeolocationHandler extends OlLayerHandler {

	constructor() {
		super(GEOLOCATION_LAYER_ID);
		const { StoreService } = $injector.inject('StoreService');
		this._storeService = StoreService;
		this._geolocationLayer = null;
		this._accuracyFeature = new Feature();
		this._positionFeature = new Feature();
	}


	/**
	 * Activates the Handler.
	 * @override
	 */
	// eslint-disable-next-line no-unused-vars
	activate(olMap) {
		if (this._geolocationLayer === null) {
			const source = new VectorSource({ wrapX: false, features: [this._accuracyFeature, this._positionFeature] });
			this._geolocationLayer = new VectorLayer({
				source: source
			});

		}
		this._unregister = this._register(this._storeService.getStore());
		return this._geolocationLayer;
	}


	_register(store) {
		const extract = (state) => {
			return state.geolocation;
		};
		const onChange = (changedState) => {
			if (changedState.active) {
				// position from statestore is by convention in EPSG:3857, no transformation needed
				let point = new Point(changedState.position);

				this._positionFeature.setGeometry(point);
				this._accuracyFeature.setGeometry(new Circle(changedState.position, changedState.accuracy));
				this._positionFeature.setStyle(positionStyleFunction);
				this._accuracyFeature.setStyle(accuracyStyleFunction);
			}
			else {
				this._positionFeature.setStyle();
				this._accuracyFeature.setStyle();
			}

		};

		return observe(store, extract, onChange);
	}

	/**
	 *  @override
	 *  @param {Map} olMap
	 */
	deactivate(/*eslint-disable no-unused-vars */olMap) {
		this._geolocationLayer = null;
		this._unregister();
	}

}