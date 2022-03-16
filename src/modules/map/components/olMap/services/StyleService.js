import { getUid } from 'ol';
import { $injector } from '../../../../../injection';
import { markerStyleFunction, highlightStyleFunction, highlightTemporaryStyleFunction, measureStyleFunction, nullStyleFunction, lineStyleFunction, polygonStyleFunction, textStyleFunction, rgbToHex, markerScaleToKeyword, getStyleArray, geojsonStyleFunction, defaultStyleFunction } from '../olStyleUtils';



/**
 * @enum
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
	LINE: 'line',
	POLYGON: 'polygon',
	GEOJSON: 'geojson'
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
 * Adds or removes styles and overlays to ol.feature.
 * @class
 * @author thiloSchlemmer
 */
export class StyleService {

	/**
	 *
	 * @param {administrationProvider} [administrationProvider=loadBvvAdministration]
	 */
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
	 * Adds (explicit or implicit) specified styles and overlays (OverlayStyle) to the specified feature.
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
			default:
				console.warn('Could not provide a style for unknown style-type');
				break;
		}
	}

	/**
	 * A Container-Object for optional properties related to a update of feature-style or -overlays
	 * @typedef {Object} UpdateProperties
	 * @param {Number} [opacity] the opacity (0-1), may or may not given, to update the opacity of the specified feature, based on
	 * the styletype belonging to the feature
	 * @param {Boolean} [top] the top-flag (true/false),  may or may not given, whether or not to update the behavior of being in the
	 * topmost layer
	 * @param {Boolean} [visible] the visible-flag (true/false), may or may not given, whether or not to update the visibility of the
	 * specified feature, based on the styletype belonging to the feature
	 */

	/**
	   * Updates (explicit or implicit) specified styles and overlays ({@link OverlayStyle}) to the specified feature.
	 * @param {ol.Feature} olFeature the feature to be styled
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style will be updated
	 * @param {UpdateProperties} properties the optional properties, which are used for additional style updates;
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
	 * Returns a ol-StyleFunction for the specified StyleType
	 * @param {StyleType} styleType
	 * @returns {Function} styleFunction the StyleFunction, used by ol to render a feature
	 */
	getStyleFunction(styleType) {
		switch (styleType) {
			case StyleTypes.NULL:
				return nullStyleFunction;
			case StyleTypes.MEASURE:
				return measureStyleFunction;
			case StyleTypes.HIGHLIGHT:
				return highlightStyleFunction;
			case StyleTypes.HIGHLIGHT_TEMP:
				return highlightTemporaryStyleFunction;
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
	 * Tests if the specified {@link ol.Feature} needs to be styled
	 * @param {ol.Feature} olFeature the style-candidate {@link ol.Feature}
	 * @returns {Boolean} whether or not the specified feature requires a style
	 */
	isStyleRequired(olFeature) {
		return this._detectStyleType(olFeature) !== null;
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
		const styles = getStyleArray(olFeature);
		const getStyleOption = () => {
			const currentStyle = styles[0];
			const currentColor = currentStyle.getText().getFill().getColor();
			const currentText = currentStyle.getText().getText();
			const currentScale = currentStyle.getText().getScale();
			return { color: Array.isArray(currentColor) ? rgbToHex(currentColor) : currentColor, scale: currentScale, text: currentText };
		};

		const newStyle = textStyleFunction(getStyleOption());

		olFeature.setStyle(() => newStyle);
	}

	_addMarkerStyle(olFeature) {
		const { IconService: iconService } = $injector.inject('IconService');


		const getStyleOption = (feature) => {
			const style = getStyleArray(feature)[0];
			const symbolSrc = style.getImage().getSrc();
			const styleColor = style.getImage().getColor();
			const color = styleColor ? styleColor : iconService.decodeColor(symbolSrc);
			const scale = markerScaleToKeyword(style.getImage().getScale());
			const text = style.getText().getText();
			return { symbolSrc: symbolSrc, color: rgbToHex(color), scale: scale, text: text };
		};

		const newStyle = markerStyleFunction(getStyleOption(olFeature));

		olFeature.setStyle(() => newStyle);
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
			return (regex.test(candidate));
		};
		const isDrawingStyleType = (type, candidate) => {
			const regex = new RegExp('^draw_' + type + '_');
			return (regex.test(candidate));
		};

		const getStyleTypeFromProperties = (olFeature) => {
			const featurePropertyKeys = olFeature.getKeys();
			const hasGeoJSONSimpleStyleProperties = featurePropertyKeys.some(k => GeoJSON_SimpleStyle_Keys.includes(k));

			return hasGeoJSONSimpleStyleProperties ? StyleTypes.GEOJSON : null;
		};

		const getStyleTypeFromId = (olFeature) => {
			const id = olFeature.getId();
			const drawingType = Object.keys(StyleTypes).find(key => isDrawingStyleType(StyleTypes[key], id));
			if (drawingType) {
				return StyleTypes[drawingType];
			}
			const otherType = Object.keys(StyleTypes).find(key => isStyleType(StyleTypes[key], id));
			if (otherType) {
				return StyleTypes[otherType];
			}
			return null;
		};

		const defaultOrNull = (olFeature) => olFeature.getStyle() === null ? StyleTypes.DEFAULT : null;

		if (olFeature) {
			for (const styleTypeFunction of [getStyleTypeFromId, getStyleTypeFromProperties, defaultOrNull]) {
				const styleType = styleTypeFunction(olFeature);
				if (styleType) {
					return styleType;
				}
			}
		}

		return null;
	}
}
