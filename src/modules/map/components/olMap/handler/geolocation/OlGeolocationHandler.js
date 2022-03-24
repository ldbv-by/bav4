import { $injector } from '../../../../../../injection';
import { observe } from '../../../../../../utils/storeUtils';
import { OlLayerHandler } from '../OlLayerHandler';
import { geolocationStyleFunction, nullStyleFunction, createAnimateFunction } from './styleUtils';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';

import { unByKey } from 'ol/Observable';
import { Point, Circle } from 'ol/geom';
import { GEOLOCATION_LAYER_ID } from '../../../../../../plugins/GeolocationPlugin';



/**
 * Handler for displaying geolocation information on the map
 * @class
 * @author thiloSchlemmer
 */
export class OlGeolocationHandler extends OlLayerHandler {

	constructor() {
		super(GEOLOCATION_LAYER_ID, { preventDefaultClickHandling: false, preventDefaultContextClickHandling: false });
		const { StoreService } = $injector.inject('StoreService');
		this._storeService = StoreService;
		this._geolocationLayer = null;
		this._accuracyFeature = new Feature();
		this._positionFeature = new Feature();
		this._map = null;
	}


	/**
	 * Activates the Handler.
	 * @override
	 */
	onActivate(olMap) {
		if (this._geolocationLayer === null) {
			const source = new VectorSource({ wrapX: false, features: [this._accuracyFeature, this._positionFeature] });
			this._geolocationLayer = new VectorLayer({
				source: source
			});

		}
		this._map = olMap;

		this._positionFeature.setStyle(geolocationStyleFunction);
		this._accuracyFeature.setStyle(geolocationStyleFunction);
		this._blinkPosition(this._positionFeature);

		this._unregister = this._register(this._storeService.getStore());

		return this._geolocationLayer;
	}

	/**
	 *  @override
	 *  @param {Map} olMap
	 */
	onDeactivate(/*eslint-disable no-unused-vars */olMap) {
		this._positionFeature.setStyle(nullStyleFunction);
		this._accuracyFeature.setStyle(nullStyleFunction);
		this._geolocationLayer = null;
		this._map = null;
		this._unregister();
	}

	_register(store) {
		const extract = (state) => {
			return state.geolocation;
		};

		const isValidGeolocation = (geolocation) => {
			if (!geolocation.active) {
				return false;
			}

			if (geolocation.denied) {
				return false;
			}
			if (!geolocation.position) {
				return false;
			}
			if (!geolocation.accuracy) {
				return false;
			}

			return true;
		};
		const onChange = (changedState, stateSnapshot) => {
			if (isValidGeolocation(changedState)) {
				this._positionFeature.setStyle(geolocationStyleFunction);
				this._accuracyFeature.setStyle(geolocationStyleFunction);
				this._positionFeature.setGeometry(new Point(changedState.position));
				this._accuracyFeature.setGeometry(new Circle(changedState.position, changedState.accuracy));
				this._map.renderSync();
				if (!stateSnapshot.pointer.beingDragged) {
					this._blinkPosition(this._positionFeature);
				}
			}
			else {
				this._positionFeature.setStyle(nullStyleFunction);
				this._accuracyFeature.setStyle(nullStyleFunction);
			}
		};

		return observe(store, extract, onChange);
	}

	_blinkPosition(feature) {
		const onEnd = () => unByKey(listenerKey);
		const blinkAnimation = createAnimateFunction(this._map, feature, onEnd);
		const listenerKey = this._geolocationLayer.on('postrender', blinkAnimation);
	}
}
