import { $injector } from '../../../../../injection';
import { baseStyleFunction, measureStyleFunction } from '../olStyleUtils';




/**
 * @enum
 */
export const StyleTypes = Object.freeze({
	MEASURE: 'measure',
	DRAW: 'draw',
});

/**
 * Adds or removes styles and overlays to ol.feature.
 * @class
 * @author thiloSchlemmer
 */
export class StyleService {
	/**
	 * Adds (explicit or implicit) specified styles and overlays (OverlayStyle) to the specified feature. 
	 * @param {ol.Feature} olFeature the feature to be styled 
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style will be added
	 * @param {StyleType} styleType the styletype, if not explicit specified (styletype==null|undefined), 
	 * the styleType will be implicitly detect by the feature-id. If no matching to known styleTypes exists, 
	 * no styles or overlays will be added.
	 */
	addStyle(olFeature, olMap, styleType = null) {
		const usingStyleType = styleType ? styleType : this._detectStyleType(olFeature);
		switch (usingStyleType) {
			case StyleTypes.MEASURE:
				this._addMeasureStyle(olFeature, olMap);
				break;
			case StyleTypes.DRAW:
				this._addBaseStyle(olFeature);
				break;
			default:
				console.warn('Could not provide a style for unknown style-type:', usingStyleType);
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
	updateStyle(olFeature, olMap, properties = {}, styleType = null) {
		const usingStyleType = styleType ? styleType : this._detectStyleType(olFeature);
		const { OverlayService: overlayService } = $injector.inject('OverlayService');
		overlayService.update(olFeature, olMap, usingStyleType, properties);
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
			case StyleTypes.MEASURE:
				return measureStyleFunction;
			case StyleTypes.DRAW:
				return baseStyleFunction;
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

		olFeature.setStyle(measureStyleFunction(olFeature));
		overlayService.add(olFeature, olMap, StyleTypes.MEASURE);
	}

	_addBaseStyle(olFeature) {
		olFeature.setStyle(baseStyleFunction);
	}

	_detectStyleType(olFeature) {
		const isStyleType = (type, candidate) => {
			const regex = new RegExp('^' + type + '_');
			return (regex.test(candidate));
		};
		let key;
		if (olFeature) {
			const id = olFeature.getId();
			key = Object.keys(StyleTypes).find(key => isStyleType(StyleTypes[key], id));
		}

		if (key) {
			return StyleTypes[key];
		}
		return null;
	}
}