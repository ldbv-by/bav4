/**
 * @module modules/olMap/services/OlStyleService
 */

import { StyleHint } from '../../../domain/styles';
import { $injector } from '../../../injection/index';
import { getContrastColorFrom, hexToRgb, rgbToHex } from '../../../utils/colors';
import { highlightGeometryOrCoordinateFeatureStyleFunction } from '../handler/highlight/styleUtils';
import { GEODESIC_FEATURE_PROPERTY, GeodesicGeometry } from '../ol/geodesic/geodesicGeometry';
import {
	defaultClusterStyleFunction,
	geojsonStyleFunction,
	getDefaultStyleFunction,
	getMarkerStyleArray,
	getStyleArray,
	getTextStyleArray,
	getTransparentImageStyle,
	markerScaleToKeyword,
	measureStyleFunction
} from '../utils/olStyleUtils';
import { getRoutingStyleFunction } from '../handler/routing/styleUtils';
import { Stroke, Style, Text } from 'ol/style';
import { GeometryCollection, MultiPoint, Point } from '../../../../node_modules/ol/geom';
import { asInternalProperty } from '../../../utils/propertyUtils';

/**
 * Enumeration of predefined and internal used (within `olMap` module only) types of style
 * @readonly
 * @enum {String}
 */
export const OlFeatureStyleTypes = Object.freeze({
	NULL: 'null',
	DEFAULT: 'default',
	MEASURE: 'measure',
	DRAW: 'draw',
	MARKER: 'marker',
	POINT: 'point',
	TEXT: 'text',
	ANNOTATION: 'annotation',
	LINE: 'line',
	POLYGON: 'polygon',
	GEOJSON: 'geojson',
	ROUTING: 'routing'
});

const GeoJSON_SimpleStyle_Keys = ['marker-symbol', 'marker-size', 'marker-color', 'stroke', 'stroke-opacity', 'stroke-width', 'fill', 'fill-opacity'];

/**
 * Provides style operations for vector layers({@link ol.layer.Vector}) and features ({@link ol.feature}).
 * @class
 * @author thiloSchlemmer
 */
export class OlStyleService {
	/**
	 * Adds (explicit or implicit) specified internal styles and overlays ({@link OverlayStyle}) to the specified feature.
	 *
	 * Note: Use only within `olMap` module
	 * @param {ol.Feature} olFeature the feature to be styled
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style will be added
	 * @param {Boolean} [displayFeatureLabel=true] flag whether or not to display the feature label, if applicable
	 */
	addInternalFeatureStyle(olFeature, olMap, displayFeatureLabel = true) {
		const styleType = this._detectStyleType(olFeature);
		switch (styleType) {
			case OlFeatureStyleTypes.MEASURE:
				this._addMeasureStyle(olFeature, olMap);
				break;
			case OlFeatureStyleTypes.ANNOTATION:
			case OlFeatureStyleTypes.TEXT:
				this._addTextStyle(olFeature);
				break;
			case OlFeatureStyleTypes.MARKER:
				this._addMarkerStyle(olFeature, displayFeatureLabel);
				break;
			case OlFeatureStyleTypes.POLYGON:
			case OlFeatureStyleTypes.LINE:
				// Polygons and Lines comes with already defined styles (by KML etc.), no need to extra define a style
				break;
			case OlFeatureStyleTypes.GEOJSON:
				this._addGeoJSONStyle(olFeature);
				break;
			case OlFeatureStyleTypes.ROUTING:
				this._addRoutingStyle(olFeature);
				break;
			default:
				console.warn('Could not provide a style for unknown style-type');
				break;
		}
	}

	/**
	 * A Container-Object for optional properties related to an update of feature-style or -overlays
	 * @typedef {Object} UpdateProperties
	 * @param {Number} [opacity] the opacity (0-1), may or may not given, to update the opacity of the specified feature, based on
	 * the style type ({@link OlFeatureStyleTypes}) belonging to the feature
	 * @param {Boolean} [top] the top-flag (true/false),  may or may not given, whether or not to update the behavior of being in the
	 * topmost layer
	 * @param {Boolean} [visible] the visible-flag (true/false), may or may not given, whether or not to update the visibility of the
	 * specified feature, based on the style type ({@link OlFeatureStyleTypes}) belonging to the feature
	 */

	/**
	 * Updates (explicit or implicit) specified styles and overlays ({@link OverlayStyle}) to the specified feature.
	 *
	 * Note: Use only within `olMap` module
	 * @param {ol.Feature} olFeature the feature to be styled
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style will be updated
	 * @param {module:modules/olMap/services/OlStyleService~UpdateProperties} properties the optional properties, which are used for additional style updates;
	 * any possible implications of a combination of defined UpdateProperties (i.e. visible=true && top=false) are handled by the current
	 * implementation of the StyleService
	 * @param {OlFeatureStyleTypes} [styleType] the {@link OlFeatureStyleTypes}, which should be used for the update
	 */
	updateInternalFeatureStyle(olFeature, olMap, properties, styleType = null) {
		const usingStyleType = styleType ? styleType : this._detectStyleType(olFeature);
		const { OverlayService: overlayService } = $injector.inject('OverlayService');
		if (usingStyleType === OlFeatureStyleTypes.MEASURE) {
			overlayService.update(olFeature, olMap, usingStyleType, properties);
		}
	}

	/**
	 * Removes overlays (added by OverlayStyle-classes) from the map and the feature.
	 *
	 * Note: Use only within  `olMap` module
	 * @param {ol.Feature} olFeature the feature
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style exists
	 */
	removeInternalFeatureStyle(olFeature, olMap) {
		const usingStyleType = this._detectStyleType(olFeature);
		const { OverlayService: overlayService } = $injector.inject('OverlayService');
		overlayService.remove(olFeature, olMap, usingStyleType);
	}

	/**
	 * Adds stylings (and overlays) to a vector layer.
	 * The most specific styling is applied in the following manner:
	 *
	 * 1. If existing, the {@link StyleHint} of {@link AbstractVectorGeoResource} is applied on the `olVectorLayer`
	 * 2. If {@link module:domain/styles~Style} of the {@link AbstractVectorGeoResource} or the {@link module:store/layers/layers_action~Layer} is applied on the `olVectorLayer`
	 * 3. If the `olVectorLayer` contains features, the most feature specific styling is applied in the following order:
	 * 	a) {@link module:domain/styles~StyleHint} property of the feature -> b) internal StyleTypes -> c) {@link module:domain/styles~Style} property of the feature
	 * @param {ol.layer.Vector} olVectorLayer
	 * @param {ol.Map} olMap
	 * @param {module:domain/geoResources~AbstractVectorGeoResource} vectorGeoResource
	 * @returns {ol.layer.Vector}
	 */
	applyStyle(olVectorLayer, olMap, vectorGeoResource) {
		this._applyLayerSpecificStyles(vectorGeoResource, olVectorLayer);

		return this._applyFeatureSpecificStyles(vectorGeoResource, olVectorLayer, olMap);
	}

	_applyLayerSpecificStyles(vectorGeoResource, olVectorLayer) {
		const style = olVectorLayer.get('style') ?? vectorGeoResource.style;
		if (style?.baseColor) {
			this._setBaseColorForLayer(olVectorLayer, [...hexToRgb(style.baseColor), 0.8]);
		} else if (vectorGeoResource.hasStyleHint()) {
			switch (vectorGeoResource.styleHint) {
				case StyleHint.CLUSTER:
					olVectorLayer.setStyle(defaultClusterStyleFunction());
					break;
				case StyleHint.HIGHLIGHT:
					olVectorLayer.setStyle(highlightGeometryOrCoordinateFeatureStyleFunction()); // TODO: move highlightGeometryOrCoordinateFeatureStyleFunction to src/modules/olMap/utils/olStyleUtils.js
					break;
			}
		}

		return olVectorLayer;
	}

	_applyFeatureSpecificStyles(vectorGeoResource, olVectorLayer, olMap) {
		const styleListeners = [];
		const olVectorSource = olVectorLayer.getSource();
		const displayFeatureLabel = olVectorLayer.get('displayFeatureLabels') ?? vectorGeoResource.showPointNames;

		const isInternalStyleRequired = (olFeature) => {
			const baStyleHint = olFeature.get(asInternalProperty('styleHint'));
			const baStyle = olFeature.get(asInternalProperty('style'));
			// no Style required, if we have a styleHint or style as property

			if (!!baStyleHint || !!baStyle) {
				return false;
			}
			return this._detectStyleType(olFeature) !== null;
		};

		const applyStyles = (feature, displayFeatureLabel) => {
			this._sanitizeStyleFor(feature);

			const baStyleHint = feature.get(asInternalProperty('styleHint'));
			const baStyle = feature.get(asInternalProperty('style'));

			if (displayFeatureLabel === false) {
				const removeTextStyle = (style) => {
					style.setText(null);
					return style;
				};
				feature.setStyle(feature.getStyle()?.map((style) => removeTextStyle(style)));
			}

			if (baStyleHint) {
				switch (baStyleHint) {
					case StyleHint.HIGHLIGHT:
						feature.setStyle(highlightGeometryOrCoordinateFeatureStyleFunction()); // TODO: move highlightGeometryOrCoordinateFeatureStyleFunction to src/modules/olMap/utils/olStyleUtils.js
						break;
				}
			}
			if (baStyle?.baseColor) {
				feature.setStyle(getDefaultStyleFunction(hexToRgb(baStyle.baseColor)));
			}
			/**
			 * We check if an currently present and possible future features needs an internal styling.
			 * If so, we apply the style and register an event listeners in order to keep the style (and overlays)
			 * up-to-date with the layer.
			 */
			if (isInternalStyleRequired(feature)) {
				this.addInternalFeatureStyle(feature, olMap, displayFeatureLabel);
				this.updateInternalFeatureStyle(feature, olMap, this._mapToStyleProperties(olVectorLayer));

				// if we have at least one style requiring feature, we register the styleEvent listener once
				// and apply the style for all currently present features
				if (styleListeners.length === 0) {
					this._registerStyleEventListeners(olVectorSource, olVectorLayer, olMap, vectorGeoResource).forEach((l) => styleListeners.push(l));
				}
			}
		};

		olVectorSource.getFeatures().forEach((f) => applyStyles(f, displayFeatureLabel));

		return olVectorLayer;
	}

	_mapToStyleProperties(olLayer) {
		const { StoreService: storeService } = $injector.inject('StoreService');
		const {
			layers: { active }
		} = storeService.getStore().getState();
		return {
			visible: olLayer.getVisible(),
			// we check if the layer representing this olLayer is the topmost layer of all unhidden layers
			top: active.filter(({ constraints: { hidden } }) => !hidden).pop()?.id === olLayer.get('id'),
			opacity: olLayer.getOpacity()
		};
	}

	_registerStyleEventListeners(olVectorSource, olLayer, olMap, vectorGeoResource) {
		const displayFeatureLabel = olLayer.get('displayFeatureLabels') ?? vectorGeoResource?.showPointNames;
		const addFeatureListenerKey = olVectorSource.on('addfeature', (event) => {
			this.addInternalFeatureStyle(event.feature, olMap, displayFeatureLabel);
			this.updateInternalFeatureStyle(event.feature, olMap, this._mapToStyleProperties(olLayer));
		});
		const removeFeatureListenerKey = olVectorSource.on('removefeature', (event) => {
			this.removeInternalFeatureStyle(event.feature, olMap);
		});
		const clearFeaturesListenerKey = olVectorSource.on('clear', () => {
			olVectorSource.getFeatures().forEach((f) => this.removeInternalFeatureStyle(f, olMap));
		});

		/**
		 * Changes in the list of layers, should have impact on style properties of the vectorLayer (e.g. related overlays),
		 * which are not tracked by OpenLayers
		 */
		const layerListChangedListenerKey = olMap.getLayers().on(['add', 'remove'], () => {
			olVectorSource.getFeatures().forEach((f) => this.updateInternalFeatureStyle(f, olMap, this._mapToStyleProperties(olLayer)));
		});

		/**
		 * Track layer changes of visibility, opacity and z-index
		 */
		const layerChangeListenerKey = olLayer.on(['change:zIndex', 'change:visible', 'change:opacity'], () => {
			olVectorSource.getFeatures().forEach((f) => this.updateInternalFeatureStyle(f, olMap, this._mapToStyleProperties(olLayer)));
		});

		return [addFeatureListenerKey, removeFeatureListenerKey, clearFeaturesListenerKey, layerChangeListenerKey, layerListChangedListenerKey];
	}

	/**
	 * Sanitize the style of a feature, to prevent unwanted renderings
	 * and to enable display behavior of point features as interactive label,
	 * similar to Google Earth (Desktop Application), to support user-created
	 * content from extern sources.
	 * TODO: handling of GeometryCollection
	 * @param {ol.Feature} olFeature
	 */
	_sanitizeStyleFor(olFeature) {
		const getStyles = (feature) => {
			const styleFunction = feature.getStyleFunction();
			const stylesCandidate = !styleFunction || !styleFunction(feature) ? null : styleFunction(feature);
			if (Array.isArray(stylesCandidate) && stylesCandidate.length > 0) {
				return stylesCandidate;
			}
			if (stylesCandidate instanceof Style) {
				return [stylesCandidate];
			}
			return null;
		};
		const getStroke = (style) => {
			// The canvas draws a stroke width=1 by default if width=0, so we
			// remove the stroke style in that case.
			const stroke = style?.getStroke ? style.getStroke() : null;
			return stroke && stroke.getWidth() === 0 ? null : stroke;
		};
		const getImageStyle = (image) => {
			// transparentCircle is used to allow selection
			return image && image.getScale() === 0 ? getTransparentImageStyle() : image;
		};
		const getTextStyle = (name, style) => {
			// If the feature has a name, we display it on the map.
			// -> Mimicking the behavior of Google Earth in combination with the
			//    transparentCircle, if image.getScale() === 0
			if (name && style?.getText() && style?.getText().getScale() !== 0) {
				return new Text({
					font: 'normal 24px Open Sans',
					text: name,
					fill: style.getText().getFill(),
					stroke: new Stroke({
						color: getContrastColorFrom(style.getText().getFill().getColor()),
						width: 3
					}),
					scale: style.getText().getScale()
				});
			}
			return undefined;
		};
		const isPointLike = (geometry) => {
			return geometry instanceof Point || geometry instanceof MultiPoint;
		};

		const geometry = olFeature.getGeometry();
		const styles = getStyles(olFeature);
		const style = styles ? styles[0].clone() : null;

		const sanitizedStroke = getStroke(style);

		// if the feature is a Point and has a name with a text style, we
		// create a correct text style.
		if (style && isPointLike(geometry)) {
			const image = style.getImage() ?? undefined;

			const sanitizedImage = getImageStyle(image);
			const sanitizedText = getTextStyle(olFeature.get('name'), style);

			const sanitizedStyles = [
				new Style({
					fill: sanitizedText ? undefined : style.getFill(),
					stroke: sanitizedText ? undefined : sanitizedStroke,
					image: sanitizedText ? sanitizedImage : image,
					text: sanitizedText,
					zIndex: style.getZIndex()
				})
			];

			olFeature.setStyle(sanitizedStyles);
		}

		// Remove image and text styles for polygons and lines
		if (style && !(isPointLike(geometry) || geometry instanceof GeometryCollection)) {
			const sanitizedStyles = [
				new Style({
					fill: style.getFill(),
					stroke: sanitizedStroke,
					image: null,
					text: null,
					zIndex: style.getZIndex()
				})
			];
			olFeature.setStyle(sanitizedStyles);
		}
	}

	_addRoutingStyle(olFeature) {
		const styleFunction = getRoutingStyleFunction();
		olFeature.setStyle(styleFunction);
	}

	_setBaseColorForLayer(olLayer, color) {
		olLayer.setStyle(getDefaultStyleFunction(color));
	}

	_addGeoJSONStyle(olFeature) {
		olFeature.setStyle(geojsonStyleFunction);
	}

	_addMarkerStyle(olFeature, displayFeatureLabel) {
		const { IconService: iconService } = $injector.inject('IconService');

		const getStyleOption = (feature) => {
			const fromStyle = (style) => {
				const symbolSrc = style.getImage()?.getSrc();
				const styleColor = style.getImage()?.getColor();
				const color = styleColor ? styleColor : iconService.decodeColor(symbolSrc);
				const scale = markerScaleToKeyword(style.getImage()?.getScale());
				const size = style.getImage()?.getSize();
				const pixelAnchor = style.getImage()?.getAnchor();
				const text = displayFeatureLabel ? (style.getText()?.getText() ?? feature.get('name')) : null;
				return {
					symbolSrc: symbolSrc,
					color: rgbToHex(color ? color : style.getText()?.getFill()?.getColor()),
					scale: scale,
					text: text,
					anchor: size && pixelAnchor ? [pixelAnchor[0] / size[0], pixelAnchor[1] / size[1]] : null
				};
			};

			const fromAttribute = (feature) => {
				return displayFeatureLabel ? { text: feature.get('name') } : {};
			};

			const styles = getStyleArray(feature);
			return styles ? fromStyle(styles[0]) : fromAttribute(olFeature);
		};

		const newStyle = getMarkerStyleArray(getStyleOption(olFeature));
		olFeature.setStyle(() => newStyle);
	}

	_addTextStyle(olFeature) {
		const getStyleOption = () => {
			const fromStyle = (style) => {
				const currentColor = style.getText()?.getFill().getColor();
				const currentText = style.getText()?.getText();
				const currentScale = style.getText()?.getScale();
				return { color: Array.isArray(currentColor) ? rgbToHex(currentColor) : currentColor, scale: currentScale, text: currentText };
			};

			const fromAttribute = (feature) => {
				return { text: feature.get('name') };
			};

			const styles = getStyleArray(olFeature);
			return styles ? fromStyle(styles[0]) : fromAttribute(olFeature);
		};

		const newStyle = getTextStyleArray(getStyleOption());

		olFeature.setStyle(() => newStyle);
	}

	_addMeasureStyle(olFeature, olMap) {
		const { OverlayService: overlayService } = $injector.inject('OverlayService');

		if (!olFeature.get(asInternalProperty(GEODESIC_FEATURE_PROPERTY))) {
			olFeature.set(asInternalProperty(GEODESIC_FEATURE_PROPERTY), new GeodesicGeometry(olFeature, olMap));
		}

		olFeature.setStyle(measureStyleFunction);
		overlayService.add(olFeature, olMap, OlFeatureStyleTypes.MEASURE);
	}

	_detectStyleType(olFeature) {
		const isStyleType = (type, candidate) => {
			const regex = new RegExp('^' + type + '_');
			return regex.test(candidate);
		};
		const isDrawingStyleType = (type, candidate) => {
			const regex = new RegExp('^draw_' + type + '_');
			return regex.test(candidate);
		};

		const getStyleTypeFromProperties = (olFeature) => {
			const featurePropertyKeys = olFeature.getKeys();
			const hasGeoJSONSimpleStyleProperties = featurePropertyKeys.some((k) => GeoJSON_SimpleStyle_Keys.includes(k));

			return hasGeoJSONSimpleStyleProperties ? OlFeatureStyleTypes.GEOJSON : null;
		};

		const getStyleTypeFromId = (olFeature) => {
			const id = olFeature.getId();
			const drawingType = Object.keys(OlFeatureStyleTypes).find((key) => isDrawingStyleType(OlFeatureStyleTypes[key], id));
			if (drawingType) {
				return OlFeatureStyleTypes[drawingType];
			}
			const otherType = Object.keys(OlFeatureStyleTypes).find((key) => isStyleType(OlFeatureStyleTypes[key], id));
			if (otherType) {
				return OlFeatureStyleTypes[otherType];
			}
			return null;
		};

		const getStyleTypeFromTypeAttribute = (olFeature) => {
			const typeAttribute = olFeature.get('type');
			const styleType = Object.values(OlFeatureStyleTypes).find((typeValue) => typeValue === typeAttribute);
			return styleType ?? null;
		};

		if (olFeature) {
			for (const styleTypeFunction of [getStyleTypeFromId, getStyleTypeFromProperties, getStyleTypeFromTypeAttribute]) {
				const styleType = styleTypeFunction(olFeature);
				if (styleType) {
					return styleType;
				}
			}
		}

		return null;
	}
}
