/**
 * @module modules/olMap/services/StyleService
 */
import { getUid } from 'ol';
import { $injector } from '../../../injection';
import { getContrastColorFrom, rgbToHex } from '../../../utils/colors';
import {
	measureStyleFunction,
	nullStyleFunction,
	lineStyleFunction,
	polygonStyleFunction,
	textStyleFunction,
	markerScaleToKeyword,
	getStyleArray,
	geojsonStyleFunction,
	defaultStyleFunction,
	defaultClusterStyleFunction,
	markerStyleFunction,
	getTransparentImageStyle
} from '../utils/olStyleUtils';
import { isFunction } from '../../../utils/checks';
import { getRoutingStyleFunction } from '../handler/routing/styleUtils';
import { GeometryCollection, MultiPoint, Point } from '../../../../node_modules/ol/geom';
import { Stroke, Style, Text } from '../../../../node_modules/ol/style';

/**
 * Enumeration of predefined types of style
 * @readonly
 * @enum {String}
 */
export const StyleTypes = Object.freeze({
	NULL: 'null',
	DEFAULT: 'default',
	MEASURE: 'measure',
	HIGHLIGHT: 'highlight',
	HIGHLIGHT_TEMP: 'highlight_temp',
	DRAW: 'draw',
	MARKER: 'marker',
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
 * Adds or removes styles and overlays to {@link ol.feature}.
 * @class
 * @author thiloSchlemmer
 */
export class StyleService {
	constructor() {
		this._defaultColorIndex = 0;
		this._defaultColorByLayerId = {};
	}

	_nextColor() {
		const getColor = (index) => Default_Colors[index];

		const restart = () => {
			this._defaultColorIndex = 0;
			return this._defaultColorIndex;
		};
		const next = () => {
			return this._defaultColorIndex++;
		};

		return this._defaultColorIndex === Default_Colors.length ? getColor(restart()) : getColor(next());
	}

	/**
	 * Adds (explicit or implicit) specified styles and overlays ({@link OverlayStyle}) to the specified feature.
	 * @param {ol.Feature} olFeature the feature to be styled
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style will be added
	 * @param {ol.Layer} olLayer the layer of the feature, used for layer-wide color in the default style
	 */
	addStyle(olFeature, olMap, olLayer) {
		const styleType = this._detectStyleType(olFeature);
		switch (styleType) {
			case StyleTypes.MEASURE:
				this._addMeasureStyle(olFeature, olMap);
				break;
			case StyleTypes.ANNOTATION:
			case StyleTypes.TEXT:
				this._addTextStyle(olFeature);
				break;
			case StyleTypes.MARKER:
				this._addMarkerStyle(olFeature);
				break;
			case StyleTypes.POLYGON:
			case StyleTypes.LINE:
				// Polygons and Lines comes with already defined styles (by KML etc.), no need to extra define a style
				break;
			case StyleTypes.GEOJSON:
				this._addGeoJSONStyle(olFeature);
				break;
			case StyleTypes.DEFAULT:
				this._addDefaultStyle(olFeature, olLayer);
				break;
			case StyleTypes.ROUTING:
				this._addRoutingStyle(olFeature);
				break;
			default:
				console.warn('Could not provide a style for unknown style-type');
				break;
		}
	}

	/**
	 * Adds a cluster style to the specified {@link ol.layer.vector.VectorLayer}.
	 * @param {ol.layer.vector.VectorLayer} olVectorLayer the vector layer with the clustered features
	 */
	addClusterStyle(olVectorLayer) {
		olVectorLayer.setStyle(defaultClusterStyleFunction());
	}

	/**
	 * A Container-Object for optional properties related to a update of feature-style or -overlays
	 * @typedef {Object} UpdateProperties
	 * @param {Number} [opacity] the opacity (0-1), may or may not given, to update the opacity of the specified feature, based on
	 * the style type ({@link StyleTypes}) belonging to the feature
	 * @param {Boolean} [top] the top-flag (true/false),  may or may not given, whether or not to update the behavior of being in the
	 * topmost layer
	 * @param {Boolean} [visible] the visible-flag (true/false), may or may not given, whether or not to update the visibility of the
	 * specified feature, based on the style type ({@link StyleTypes}) belonging to the feature
	 */

	/**
	 * Updates (explicit or implicit) specified styles and overlays ({@link OverlayStyle}) to the specified feature.
	 * @param {ol.Feature} olFeature the feature to be styled
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style will be updated
	 * @param {module:modules/olMap/services/StyleService~UpdateProperties} properties the optional properties, which are used for additional style updates;
	 * any possible implications of a combination of defined UpdateProperties (i.e. visible=true && top=false) are handled by the current
	 * implementation of the StyleService
	 * @param {StyleTypes} [styleType] the {@link StyleTypes}, which should be used for the update
	 */
	updateStyle(olFeature, olMap, properties, styleType = null) {
		const usingStyleType = styleType ? styleType : this._detectStyleType(olFeature);
		const { OverlayService: overlayService } = $injector.inject('OverlayService');
		if (usingStyleType === StyleTypes.MEASURE) {
			overlayService.update(olFeature, olMap, usingStyleType, properties);
		}
	}

	/**
	 * Removes overlays (added by OverlayStyle-classes) from the map and the feature
	 * @param {ol.Feature} olFeature the feature
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style exists
	 */
	removeStyle(olFeature, olMap) {
		const { OverlayService: overlayService } = $injector.inject('OverlayService');
		overlayService.remove(olFeature, olMap);
	}

	/**
	 * Returns a {@link ol.style.StyleFunction} for the specified {@link StyleTypes}
	 * @param {StyleTypes} styleType
	 * @returns {Function} the {@link ol.style.StyleFunction}, used by ol to render a feature
	 */
	getStyleFunction(styleType) {
		switch (styleType) {
			case StyleTypes.NULL:
				return nullStyleFunction;
			case StyleTypes.MEASURE:
				return measureStyleFunction;
			case StyleTypes.LINE:
				return lineStyleFunction;
			case StyleTypes.POLYGON:
				return polygonStyleFunction;
			case StyleTypes.MARKER:
				return markerStyleFunction;
			case StyleTypes.TEXT:
				return textStyleFunction;
			case StyleTypes.DRAW:
				return nullStyleFunction;
			case StyleTypes.GEOJSON:
				return geojsonStyleFunction;
			case StyleTypes.DEFAULT:
				return defaultStyleFunction;
			default:
				console.warn('Could not provide a style for unknown style-type:', styleType);
		}
	}

	/**
	 * Returns a {@link ol.style.StyleFunction} for a specified {@link StyleTypes}
	 * @param {StyleTypes} styleType
	 * @returns {Function|null} the {@link ol.style.StyleFunction} or `null`
	 */
	getFeatureStyleFunction(styleType) {
		return (feature, resolution) => {
			const result = this.getStyleFunction(styleType);
			return isFunction(result) ? result(feature, resolution) : result;
		};
	}

	/**
	 * Tests if the specified {@link ol.Feature} needs to be styled
	 * @param {ol.Feature} olFeature the style-candidate {@link ol.Feature}
	 * @returns {Boolean} whether or not the specified feature requires a style
	 */
	isStyleRequired(olFeature) {
		return this._detectStyleType(olFeature) !== null;
	}

	/**
	 * Sanitize the style of a feature, to prevent unwanted renderings
	 * and to enable display behavior of point features as interactive label,
	 * similar to Google Earth (Desktop Application), to support user-created
	 * content from extern sources.
	 * TODO: handling of GeometryCollection
	 * @param {ol.Feature} olFeature
	 */
	sanitizeStyle(olFeature) {
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
			return null;
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
			const image = style.getImage() ?? null;

			const sanitizedImage = getImageStyle(image);
			const sanitizedText = getTextStyle(olFeature.get('name'), style);
			const sanitizedStyles = [
				new Style({
					fill: sanitizedText ? null : style.getFill(),
					stroke: sanitizedText ? null : sanitizedStroke,
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

	_addMeasureStyle(olFeature, olMap) {
		const { OverlayService: overlayService } = $injector.inject('OverlayService');

		/**
		 * Provide a single entrypoint for features without a stored partition_delta,
		 * to create a best fitting partition-delta after zooming of the map ends.
		 *
		 * This must be done before the style is applied for the first time.
		 *
		 * This fallback is needed, if stored data is loaded in the background, without
		 * rendering and the initial resolution does not fit to the final zoomed extent
		 * of the feature.
		 */
		if (olFeature.get('partition_delta') == null) {
			olMap.getView().once('change:resolution', () => olMap.once('moveend', (e) => overlayService.update(olFeature, e.map, StyleTypes.MEASURE)));
		}

		olFeature.setStyle(measureStyleFunction);
		overlayService.add(olFeature, olMap, StyleTypes.MEASURE);
	}

	_addGeoJSONStyle(olFeature) {
		olFeature.setStyle(geojsonStyleFunction);
	}

	_addTextStyle(olFeature) {
		const getStyleOption = () => {
			const fromStyle = (style) => {
				const currentColor = style.getText().getFill().getColor();
				const currentText = style.getText().getText();
				const currentScale = style.getText().getScale();
				return { color: Array.isArray(currentColor) ? rgbToHex(currentColor) : currentColor, scale: currentScale, text: currentText };
			};

			const fromAttribute = (feature) => {
				return { text: feature.get('name') };
			};

			const styles = getStyleArray(olFeature);
			return styles ? fromStyle(styles[0]) : fromAttribute(olFeature);
		};

		const newStyle = textStyleFunction(getStyleOption());

		olFeature.setStyle(() => newStyle);
	}

	_addMarkerStyle(olFeature) {
		const { IconService: iconService } = $injector.inject('IconService');

		const getStyleOption = (feature) => {
			const fromStyle = (style) => {
				const symbolSrc = style.getImage().getSrc();
				const styleColor = style.getImage().getColor();
				const color = styleColor ? styleColor : iconService.decodeColor(symbolSrc);
				const scale = markerScaleToKeyword(style.getImage().getScale());
				const size = style.getImage()?.getSize();
				const pixelAnchor = style.getImage()?.getAnchor();
				const text = style.getText().getText();
				return {
					symbolSrc: symbolSrc,
					color: rgbToHex(color ? color : style.getText().getFill().getColor()),
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

		const newStyle = markerStyleFunction(getStyleOption(olFeature));

		olFeature.setStyle(() => newStyle);
	}

	_addRoutingStyle(olFeature) {
		const styleFunction = getRoutingStyleFunction();
		olFeature.setStyle(styleFunction);
	}

	_addDefaultStyle(olFeature, olLayer = null) {
		const getColorByLayerId = (layer) => {
			const id = getUid(layer);
			if (this._defaultColorByLayerId[id] === undefined) {
				this._defaultColorByLayerId[id] = this._nextColor();
			}
			return [...this._defaultColorByLayerId[id]];
		};

		const color = olLayer ? getColorByLayerId(olLayer) : this._nextColor();
		olFeature.setStyle(defaultStyleFunction(color));
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

			return hasGeoJSONSimpleStyleProperties ? StyleTypes.GEOJSON : null;
		};

		const getStyleTypeFromId = (olFeature) => {
			const id = olFeature.getId();
			if (id?.startsWith('measure_')) {
				return StyleTypes.MEASURE;
			}
			const drawingType = Object.keys(StyleTypes).find((key) => isDrawingStyleType(StyleTypes[key], id));
			if (drawingType) {
				return StyleTypes[drawingType];
			}
			const otherType = Object.keys(StyleTypes).find((key) => isStyleType(StyleTypes[key], id));
			if (otherType) {
				return StyleTypes[otherType];
			}
			return null;
		};

		const getStyleTypeFromTypeAttribute = (olFeature) => {
			const typeAttribute = olFeature.get('type');
			const styleType = Object.values(StyleTypes).find((typeValue) => typeValue === typeAttribute);
			return styleType ?? null;
		};

		const defaultOrNull = (olFeature) => (olFeature.getStyle() === null ? StyleTypes.DEFAULT : null);

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
