/**
 * @module modules/olMap/handler/highlight/OlHighlightLayerHandler
 */
import { OlLayerHandler } from '../OlLayerHandler';
import { $injector } from '../../../../injection';
import { observe } from '../../../../utils/storeUtils';
import { HIGHLIGHT_LAYER_ID } from '../../../../plugins/HighlightPlugin';
import Feature from 'ol/Feature';
import {
	createAnimation,
	highlightAnimatedCoordinateFeatureStyleFunction,
	highlightCoordinateFeatureStyleFunction,
	highlightGeometryOrCoordinateFeatureStyleFunction,
	highlightTemporaryCoordinateFeatureStyleFunction,
	highlightTemporaryGeometryOrCoordinateFeatureStyleFunction
} from './styleUtils';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Point } from 'ol/geom';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';
import { unByKey } from 'ol/Observable';
import { parse } from '../../../../utils/ewkt';
import { SourceTypeName } from '../../../../domain/sourceType';
import { isCoordinate } from '../../../../utils/checks';
import { HighlightFeatureType } from '../../../../domain/highlightFeature';

/**
 * Handler for displaying highlighted features
 * @author thiloSchlemmer
 * @author taulinger
 */
export class OlHighlightLayerHandler extends OlLayerHandler {
	constructor() {
		super(HIGHLIGHT_LAYER_ID, { preventDefaultClickHandling: false, preventDefaultContextClickHandling: false });
		const { StoreService, MapService } = $injector.inject('StoreService', 'MapService');
		this._storeService = StoreService;
		this._mapService = MapService;
		this._unregister = () => {};
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
	onDeactivate(/*eslint-disable no-unused-vars */ olMap) {
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
		const { data: coordOrGeometry, label } = feature;

		const prepareFeatureLabel = (olFeature) => {
			olFeature.setId(feature.id);
			olFeature.set('name', label);
			return olFeature;
		};

		//we have a Coordinate
		if (isCoordinate(coordOrGeometry)) {
			return this._appendStyle(feature, prepareFeatureLabel(new Feature(new Point(coordOrGeometry))));
		}

		//we have a HighlightGeometry
		switch (coordOrGeometry.sourceType.name) {
			case SourceTypeName.EWKT: {
				const ewkt = parse(coordOrGeometry.data);
				if (ewkt.srid !== this._mapService.getSrid()) {
					throw new Error('Unsupported SRID ' + ewkt.srid);
				}
				return this._appendStyle(feature, prepareFeatureLabel(new WKT().readFeature(ewkt.wkt)));
			}
			case SourceTypeName.GEOJSON:
				return this._appendStyle(feature, prepareFeatureLabel(new GeoJSON().readFeature(JSON.parse(coordOrGeometry.data))));
			default: {
				throw `SourceType "${coordOrGeometry.sourceType.name}" is currently not supported`;
			}
		}
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
		//we have a Coordinate
		if (isCoordinate(data)) {
			switch (feature.type) {
				case HighlightFeatureType.MARKER:
					olFeature.setStyle(highlightCoordinateFeatureStyleFunction);
					break;
				case HighlightFeatureType.MARKER_TMP:
					olFeature.setStyle(highlightTemporaryCoordinateFeatureStyleFunction);
					break;
				case HighlightFeatureType.QUERY_RUNNING:
					this._animatePointFeature(olFeature);
					break;
				case HighlightFeatureType.QUERY_SUCCESS:
					olFeature.setStyle(highlightAnimatedCoordinateFeatureStyleFunction);
					break;
				case HighlightFeatureType.DEFAULT:
					olFeature.setStyle(highlightGeometryOrCoordinateFeatureStyleFunction);
					break;
				case HighlightFeatureType.DEFAULT_TMP:
					olFeature.setStyle(highlightTemporaryGeometryOrCoordinateFeatureStyleFunction);
					break;
			}
		} else {
			switch (feature.type) {
				case HighlightFeatureType.DEFAULT:
					olFeature.setStyle(highlightGeometryOrCoordinateFeatureStyleFunction);
					break;
				case HighlightFeatureType.DEFAULT_TMP:
					olFeature.setStyle(highlightTemporaryGeometryOrCoordinateFeatureStyleFunction);
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

			olSource.addFeatures(features.map(this._toOlFeature, this).filter((olFeature) => !!olFeature));
		};

		return observe(store, (state) => state.highlight, onChange, false);
	}
}
