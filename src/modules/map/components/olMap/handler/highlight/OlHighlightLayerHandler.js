import { OlLayerHandler } from '../OlLayerHandler';
import { $injector } from '../../../../../../injection';
import { observe } from '../../../../../../utils/storeUtils';
import { HIGHLIGHT_LAYER_ID } from '../../../../../../plugins/HighlightPlugin';
import Feature from 'ol/Feature';
import { createAnimation, highlightAnimatedCoordinateFeatureStyleFunction, highlightCoordinateFeatureStyleFunction, highlightGeometryFeatureStyleFunction, highlightTemporaryCoordinateFeatureStyleFunction, highlightTemporaryGeometryFeatureStyleFunction } from './styleUtils';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Point } from 'ol/geom';
import { HighlightFeatureType, HighlightGeometryType } from '../../../../../../store/highlight/highlight.action';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';
import { unByKey } from 'ol/Observable';


/**
 * Handler for displaying highlighted features
 * @author thiloSchlemmer
 * @author taulinger
 */
export class OlHighlightLayerHandler extends OlLayerHandler {

	constructor() {
		super(HIGHLIGHT_LAYER_ID, { preventDefaultClickHandling: false, preventDefaultContextClickHandling: false });
		const { StoreService } = $injector.inject('StoreService');
		this._storeService = StoreService;
		this._unregister = () => { };
		this._olMap = null;
		this._olLayer = null;
		this._animationListenerKeys = [];
	}


	/**
		 * Activates the Handler.
		 * @override
		 */
	onActivate(olMap) {
		this._olMap = olMap;
		this._olLayer = this._createLayer();
		this._unregister = this._register(this._storeService.getStore(), this._olLayer.getSource());
		return this._olLayer;
	}

	/**
		 *  @override
		 *  @param {Map} olMap
		 */
	onDeactivate(/*eslint-disable no-unused-vars */olMap) {
		this._unregister();
		this._olMap = null;
		this._olLayer = null;
	}

	_createLayer() {
		return new VectorLayer({
			source: new VectorSource()
		});
	}

	_toOlFeature(feature) {
		const { data } = feature;

		//we have a HighlightCoordinate
		if (data.coordinate) {
			return this._appendStyle(feature, new Feature(new Point(data.coordinate)));
		}

		//we have a HighlightGeometry
		switch (data.geometryType) {

			case HighlightGeometryType.WKT:
				return this._appendStyle(feature, new WKT().readFeature(data.geometry));
			case HighlightGeometryType.GEOJSON:
				return this._appendStyle(feature, new GeoJSON().readFeature(data.geometry));
		}
		return null;
	}

	_animatePointFeature(olFeature, olMap = this._olMap, olLayer = this._olLayer) {
		olFeature.setStyle(highlightAnimatedCoordinateFeatureStyleFunction);
		const blinkAnimation = createAnimation(olMap, olFeature);
		const listenerKey = olLayer.on('postrender', blinkAnimation);
		this._animationListenerKeys.push(listenerKey);
		return listenerKey;
	}

	_appendStyle(feature, olFeature) {
		const { data } = feature;
		//we have a HighlightCoordinate
		if (data.coordinate) {

			switch (feature.type) {

				case HighlightFeatureType.DEFAULT:
					olFeature.setStyle(highlightCoordinateFeatureStyleFunction);
					break;
				case HighlightFeatureType.TEMPORARY:
					olFeature.setStyle(highlightTemporaryCoordinateFeatureStyleFunction);
					break;
				case HighlightFeatureType.QUERY_RUNNING:
					this._animatePointFeature(olFeature);
					break;
				case HighlightFeatureType.QUERY_SUCCESS:
					olFeature.setStyle(highlightAnimatedCoordinateFeatureStyleFunction);
			}
		}
		else {
			switch (feature.type) {

				case HighlightFeatureType.DEFAULT:
					olFeature.setStyle(highlightGeometryFeatureStyleFunction);
					break;
				case HighlightFeatureType.TEMPORARY:
					olFeature.setStyle(highlightTemporaryGeometryFeatureStyleFunction);
					break;
			}
		}
		return olFeature;
	}

	_register(store, olSource) {

		const onChange = ({ features }) => {

			olSource.clear();
			/**
			 * we unregister all animation related event listeners
			 * */
			for (let i = this._animationListenerKeys.length - 1; i >= 0; i--) {
				unByKey(this._animationListenerKeys[i]);
				this._animationListenerKeys.splice(i, 1);
			}

			olSource.addFeatures(
				features
					.map(this._toOlFeature, this)
					.filter(olFeature => !!olFeature));
		};

		return observe(store, state => state.highlight, onChange, false);
	}
}
