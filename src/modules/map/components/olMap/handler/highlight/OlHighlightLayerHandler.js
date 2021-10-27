import { OlLayerHandler } from '../OlLayerHandler';
import { $injector } from '../../../../../../injection';
import { observe } from '../../../../../../utils/storeUtils';
import { HIGHLIGHT_LAYER_ID } from '../../../../../../plugins/HighlightPlugin';
import Feature from 'ol/Feature';
import { highlightFeatureStyleFunction, highlightTemporaryFeatureStyleFunction } from './styleUtils';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Point } from 'ol/geom';
import { HighlightGeometryTypes } from '../../../../../../store/highlight/highlight.action';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';


/**
 * Handler for displaying highlighted features
 * @author thiloSchlemmer
 * @author taulinger
 */
export class OlHighlightLayerHandler extends OlLayerHandler {

	constructor() {
		super(HIGHLIGHT_LAYER_ID);
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

		if (data.coordinate) {
			return new Feature(new Point(data.coordinate));
		}

		switch (data.geometryType) {

			case HighlightGeometryTypes.WKT:
				return new WKT().readFeature(data.geometry);
			case HighlightGeometryTypes.GEOJSON:
				return new GeoJSON().readFeature(data.geometry);
		}
		return null;
	}

	_register(store, olSource) {

		const onChange = ({ features, temporaryFeatures }) => {

			olSource.clear();

			olSource.addFeatures(
				features
					.map(this._toOlFeature)
					.filter(olFeature => !!olFeature)
					.map(olFeature => {
						olFeature.setStyle(highlightFeatureStyleFunction);
						return olFeature;
					}));

			olSource.addFeatures(
				temporaryFeatures
					.map(this._toOlFeature)
					.filter(olFeature => !!olFeature)
					.map(olFeature => {
						olFeature.setStyle(highlightTemporaryFeatureStyleFunction);
						return olFeature;
					}));
		};

		return observe(store, state => state.highlight, onChange, false);
	}
}
