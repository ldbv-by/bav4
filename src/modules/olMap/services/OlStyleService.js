/**
 * @module modules/olMap/services/OlStyleService
 */

import { getUid } from 'ol';
import { VectorSourceType } from '../../../domain/geoResources';
import { StyleHint } from '../../../domain/styles';
import { $injector } from '../../../injection/index';
import { getContrastColorFrom, rgbToHex } from '../../../utils/colors';
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

/**
 * Enumeration of predefined and internal used types of style
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

const Default_Colors = [
	[255, 0, 0, 0.8],
	[255, 165, 0, 0.8],
	[0, 0, 255, 0.8],
	[0, 255, 255, 0.8],
	[0, 255, 0, 0.8],
	[128, 0, 128, 0.8],
	[0, 128, 0, 0.8]
];

const GeoJSON_SimpleStyle_Keys = ['marker-symbol', 'marker-size', 'marker-color', 'stroke', 'stroke-opacity', 'stroke-width', 'fill', 'fill-opacity'];

/**
 * Provides style operations for vector layer({@link ol.layer.Vector}) and features ({@link ol.feature}).
 * @class
 * @author thiloSchlemmer
 */
export class StyleService {
	#defaultColorIndex = 0;
	#defaultColorByLayerId = {};

	/**
	 * Adds (explicit or implicit) specified styles and overlays ({@link OverlayStyle}) to the specified feature.
	 * @param {ol.Feature} olFeature the feature to be styled
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style will be added
	 * @param {ol.Layer} olLayer the layer of the feature, used for layer-wide color in the default style
	 */
	addFeatureStyle(olFeature, olMap, olLayer) {
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
				this._addMarkerStyle(olFeature);
				break;
			case OlFeatureStyleTypes.POLYGON:
			case OlFeatureStyleTypes.LINE:
				// Polygons and Lines comes with already defined styles (by KML etc.), no need to extra define a style
				break;
			case OlFeatureStyleTypes.GEOJSON:
				this._addGeoJSONStyle(olFeature);
				break;
			case OlFeatureStyleTypes.DEFAULT:
				this._addDefaultStyle(olFeature, olLayer);
				break;
			case OlFeatureStyleTypes.ROUTING:
				this._addRoutingStyle(olFeature);
				break;
			default:
				console.warn('Could not provide a style for unknown style-type');
				break;
		}

		const styleHint = olFeature.get('styleHint');
		if (styleHint) {
			switch (styleHint) {
				case StyleHint.HIGHLIGHT:
					olFeature.setStyle(highlightGeometryOrCoordinateFeatureStyleFunction()); // TODO: move highlightGeometryOrCoordinateFeatureStyleFunction to src/modules/olMap/utils/olStyleUtils.js
					break;
			}
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
	 * @param {ol.Feature} olFeature the feature to be styled
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style will be updated
	 * @param {module:modules/olMap/services/OlStyleService~UpdateProperties} properties the optional properties, which are used for additional style updates;
	 * any possible implications of a combination of defined UpdateProperties (i.e. visible=true && top=false) are handled by the current
	 * implementation of the StyleService
	 * @param {OlFeatureStyleTypes} [styleType] the {@link OlFeatureStyleTypes}, which should be used for the update
	 */
	updateFeatureStyle(olFeature, olMap, properties, styleType = null) {
		const usingStyleType = styleType ? styleType : this._detectStyleType(olFeature);
		const { OverlayService: overlayService } = $injector.inject('OverlayService');
		if (usingStyleType === OlFeatureStyleTypes.MEASURE) {
			overlayService.update(olFeature, olMap, usingStyleType, properties);
		}
	}

	/**
	 * Removes overlays (added by OverlayStyle-classes) from the map and the feature
	 * @param {ol.Feature} olFeature the feature
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style exists
	 */
	removeFeatureStyle(olFeature, olMap) {
		const usingStyleType = this._detectStyleType(olFeature);
		const { OverlayService: overlayService } = $injector.inject('OverlayService');
		overlayService.remove(olFeature, olMap, usingStyleType);
	}

	/**
	 * Adds specific stylings (and overlays) for a vector layer.
	 * @param {ol.layer.Vector} olVectorLayer
	 * @param {ol.Map} olMap
	 * @param {AbstractVectorGeoResource} vectorGeoResource
	 * @returns {ol.layer.Vector}
	 */
	applyStyle(olVectorLayer, olMap, vectorGeoResource) {
		this._sanitizeStyles(olVectorLayer);
		if (vectorGeoResource.hasStyleHint?.()) {
			return this._applyStyleHint(vectorGeoResource.styleHint, olVectorLayer);
		}
		return this._applyFeatureSpecificStyles(olVectorLayer, olMap);
	}

	/**
	 * Applies the style according to the given `StyleHint`
	 * @param {StyleHint} styleHint
	 * @param {ol.layer.Vector} olVectorLayer
	 * @returns {ol.layer.Vector}
	 */
	_applyStyleHint(styleHint, olVectorLayer) {
		switch (styleHint) {
			case StyleHint.CLUSTER:
				olVectorLayer.setStyle(defaultClusterStyleFunction());
				break;
			case StyleHint.HIGHLIGHT:
				olVectorLayer.setStyle(highlightGeometryOrCoordinateFeatureStyleFunction()); // TODO: move highlightGeometryOrCoordinateFeatureStyleFunction to src/modules/olMap/utils/olStyleUtils.js
				break;
		}
		return olVectorLayer;
	}

	_applyFeatureSpecificStyles(olVectorLayer, olMap) {
		const isStyleRequired = (olFeature) => this._detectStyleType(olFeature) !== null;
		/**
		 * We check if an currently present and possible future features needs a specific styling.
		 * If so, we apply the style and register an event listeners in order to keep the style (and overlays)
		 * up-to-date with the layer.
		 */

		const olVectorSource = olVectorLayer.getSource();

		if (olVectorSource.getFeatures().some((feature) => isStyleRequired(feature))) {
			// if we have at least one style requiring feature, we register the styleEvent listener once
			// and apply the style for all currently present features
			this._registerStyleEventListeners(olVectorSource, olVectorLayer, olMap);

			olVectorSource.getFeatures().forEach((feature) => {
				if (isStyleRequired(feature)) {
					this.addFeatureStyle(feature, olMap, olVectorLayer);
					this.updateFeatureStyle(feature, olMap, this._mapToStyleProperties(olVectorLayer));
				}
			});
		}

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

	_registerStyleEventListeners(olVectorSource, olLayer, olMap) {
		const addFeatureListenerKey = olVectorSource.on('addfeature', (event) => {
			this.addFeatureStyle(event.feature, olMap, olLayer);
			this.updateFeatureStyle(event.feature, olMap, this._mapToStyleProperties(olLayer));
		});
		const removeFeatureListenerKey = olVectorSource.on('removefeature', (event) => {
			this.removeFeatureStyle(event.feature, olMap);
		});
		const clearFeaturesListenerKey = olVectorSource.on('clear', () => {
			olVectorSource.getFeatures().forEach((f) => this.removeFeatureStyle(f, olMap));
		});

		/**
		 * Changes in the list of layers, should have impact on style properties of the vectorLayer (e.g. related overlays),
		 * which are not tracked by OpenLayers
		 */
		const layerListChangedListenerKey = olMap.getLayers().on(['add', 'remove'], () => {
			olVectorSource.getFeatures().forEach((f) => this.updateFeatureStyle(f, olMap, this._mapToStyleProperties(olLayer)));
		});

		/**
		 * Track layer changes of visibility, opacity and z-index
		 */
		const layerChangeListenerKey = olLayer.on(['change:zIndex', 'change:visible', 'change:opacity'], () => {
			olVectorSource.getFeatures().forEach((f) => this.updateFeatureStyle(f, olMap, this._mapToStyleProperties(olLayer)));
		});

		return { addFeatureListenerKey, removeFeatureListenerKey, clearFeaturesListenerKey, layerChangeListenerKey, layerListChangedListenerKey };
	}

	/**
	 * Sanitizes the style of the present features of the vector layer.
	 * The sanitizing prepares features with incompatible styling for the rendering in the
	 * ol context.
	 * @param {ol.layer.Vector} olVectorLayer
	 */
	_sanitizeStyles(olVectorLayer) {
		const olVectorSource = olVectorLayer.getSource();
		olVectorSource.getFeatures().forEach((feature) => this._sanitizeStyleFor(feature));
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
			if (name && style?.getText && style?.getText().getScale() !== 0) {
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
					text: olFeature.get('showPointNames') === false ? undefined : sanitizedText,
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

	_addDefaultStyle(olFeature, olLayer) {
		const isGPX = (layer) => {
			const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
			return geoResourceService.byId(layer.get('geoResourceId'))?.sourceType === VectorSourceType.GPX;
		};

		const getColorByLayerId = (layer) => {
			const id = getUid(layer);
			if (this.#defaultColorByLayerId[id] === undefined) {
				this.#defaultColorByLayerId[id] = this._nextColor();
			}
			return [...this.#defaultColorByLayerId[id]];
		};

		const color = olLayer && !isGPX(olLayer) ? getColorByLayerId(olLayer) : this._nextColor();
		olFeature.setStyle(getDefaultStyleFunction(color));
	}
	_addGeoJSONStyle(olFeature) {
		olFeature.setStyle(geojsonStyleFunction);
	}

	_addMarkerStyle(olFeature) {
		const { IconService: iconService } = $injector.inject('IconService');

		const getStyleOption = (feature) => {
			const fromStyle = (style) => {
				const symbolSrc = style.getImage()?.getSrc();
				const styleColor = style.getImage()?.getColor();
				const color = styleColor ? styleColor : iconService.decodeColor(symbolSrc);
				const scale = markerScaleToKeyword(style.getImage()?.getScale());
				const size = style.getImage()?.getSize();
				const pixelAnchor = style.getImage()?.getAnchor();
				const text = style.getText()?.getText();
				return {
					symbolSrc: symbolSrc,
					color: rgbToHex(color ? color : style.getText()?.getFill()?.getColor()),
					scale: scale,
					text: text,
					anchor: size && pixelAnchor ? [pixelAnchor[0] / size[0], pixelAnchor[1] / size[1]] : null
				};
			};

			const fromAttribute = (feature) => {
				return { text: feature.get('name') };
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

		if (!olFeature.get(GEODESIC_FEATURE_PROPERTY)) {
			olFeature.set(GEODESIC_FEATURE_PROPERTY, new GeodesicGeometry(olFeature, olMap));
		}

		olFeature.setStyle(measureStyleFunction);
		overlayService.add(olFeature, olMap, OlFeatureStyleTypes.MEASURE);
	}

	_nextColor() {
		const getColor = (index) => Default_Colors[index];

		const restart = () => {
			this.#defaultColorIndex = 0;
			return this.#defaultColorIndex;
		};
		const next = () => {
			return this.#defaultColorIndex++;
		};

		return this.#defaultColorIndex === Default_Colors.length ? getColor(restart()) : getColor(next());
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

		const defaultOrNull = (olFeature) => (olFeature.getStyle() === null ? OlFeatureStyleTypes.DEFAULT : null);

		if (olFeature) {
			for (const styleTypeFunction of [getStyleTypeFromId, getStyleTypeFromProperties, getStyleTypeFromTypeAttribute, defaultOrNull]) {
				const styleType = styleTypeFunction(olFeature);
				if (styleType) {
					return styleType;
				}
			}
		}

		return null;
	}
}
