import { OlLayerHandler } from '../OlLayerHandler';
import { $injector } from '../../../../../../injection';
import { observe } from '../../../../../../utils/storeUtils';
import { HIGHLIGHT_LAYER_ID } from '../../../../../../plugins/HighlightPlugin';
import Feature from 'ol/Feature';
import { highlightFeatureStyleFunction, highlightTemporaryFeatureStyleFunction } from './styleUtils';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Point } from 'ol/geom';
import { HighlightFeatureTypes, HighlightGeometryTypes } from '../../../../../../store/highlight/highlight.action';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';


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
	}


	/**
		 * Activates the Handler.
		 * @override
		 */
	onActivate(/*eslint-disable no-unused-vars */olMap) {
		const olLayer = this._createLayer();
		this._unregister = this._register(this._storeService.getStore(), olLayer.getSource());
		return olLayer;
	}

	/**
		 *  @override
		 *  @param {Map} olMap
		 */
	onDeactivate(/*eslint-disable no-unused-vars */olMap) {
		this._unregister();
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

			case HighlightGeometryTypes.WKT:
				return this._appendStyle(feature, new WKT().readFeature(data.geometry));
			case HighlightGeometryTypes.GEOJSON:
				return this._appendStyle(feature, new GeoJSON().readFeature(data.geometry));
		}
		return null;
	}

	_appendStyle(feature, olFeature) {
		const { data } = feature;
		//we have a HighlightCoordinate
		if (data.coordinate) {

			switch (feature.type) {

				case HighlightFeatureTypes.DEFAULT:
					olFeature.setStyle(highlightFeatureStyleFunction);
					break;
				case HighlightFeatureTypes.TEMPORARY:
					olFeature.setStyle(highlightTemporaryFeatureStyleFunction);
					break;
			}
		}
		return olFeature;
	}

	_register(store, olSource) {

		const onChange = ({ features }) => {

			olSource.clear();

			olSource.addFeatures(
				features
					.map(this._toOlFeature, this)
					.filter(olFeature => !!olFeature));
		};

		return observe(store, state => state.highlight, onChange, false);
	}
}
