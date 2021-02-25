import { $injector } from '../../../../../../injection';
import { observe } from '../../../../../../utils/storeUtils';
import { OlLayerHandler } from '../OlLayerHandler';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Point, Circle } from 'ol/geom';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';



const GEOLOCATION_LAYER_ID = 'geolocation_layer';
const GEOLOCATION_PROJECTION_LIKE = 'EPSG:3857';
const GEOLOCATION_STYLE_ACCURACY = () =>  [new Style({
	fill: new Fill({
		color: [255, 0, 0, 0.1]
	}),
	stroke: Stroke({
		color: [255, 0, 0, 0.9],
		width: 3
	})
})];
const GEOLOCATION_STYLE_POSITION = () => [new Style({
	image: new CircleStyle({
		radius6: 6,
		fill: new Fill({
			color: [255, 0, 0, 0.1],
		}),
		stroke: new Stroke({
			color: [255, 0, 0, 0.9],
			width: 2,
		}),
	}),
})];

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
		this._projection = null;
		this._accuracyFeature = new Feature();		
		this._positionFeature = new Feature();		
	}


	/**
	 * Activates the Handler.
	 * @override
	 */
	activate(olMap) {
		if (this._geolocationLayer === null) {
			const source = new VectorSource({ wrapX: false, features: [this._accuracyFeature, this._positionFeature] });
			this._geolocationLayer = new VectorLayer({
				source: source
			});
			
		}
		this._projection = olMap.getView().getProjection();
		this._unregister = this._register(this._storeService.getStore());
		return this._geolocationLayer;
	}


	_register(store) {
		const extract = (state) => {
			return state.geolocation; //todo: must be clearified in future
			/*
			for now assuming a structure like:
				{boolean} state.geolocation.active
				{array<number>} state.geolocation.position
				{number} state.geolocation.accuracy
			*/	
		};
		const onChange = (changedState) => {
			if (changedState.active) {
				let projectedPoint = new Point(changedState.geolocation.position);
				if (this._projection) {
					projectedPoint = projectedPoint.clone().transform(GEOLOCATION_PROJECTION_LIKE, this._projection);
				}
				this._positionFeature.setGeometry(projectedPoint);
				this._accuracyFeature.setGeometry(new Circle(projectedPoint, changedState.geolocation.accuracy));
				this._positionFeature.setStyle(GEOLOCATION_STYLE_ACCURACY);
				this._accuracyFeature.setStyle(GEOLOCATION_STYLE_POSITION);
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
		//use the map to unregister event listener, interactions, etc
		//olLayer currently undefined, will be fixed later		
		
		this._geolocationLayer = null;
		this._unregister();
	}

}