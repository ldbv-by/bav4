import { $injector } from '../../../../../injection';
import { measureStyleFunction } from '../olStyleUtils';




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
		if (usingStyleType) {
			switch (usingStyleType) {
				case StyleTypes.MEASURE:
					this._addMeasureStyle(olFeature, olMap);
					break;
				default:
					console.warn('Could not provide a style for unknown style-type:', usingStyleType);
					break;
			}
		}
	}

	/**
	 * 
	 * @typedef {Object} UpdateProperties
	 * @param {Number} opacity the opacity (0-1), may or may not given, to update the opacity of the specified feature, based on the styletype belonging to the feature
	 * @param {Boolean} top the top-flag (true/false),  may or may not given, whether or not to update the behavior of being in the topmost layer
	 * @param {Boolean} visible the visible-flag (true/false), may or may not given, whether or not to update the visibility of the specified feature, based on the styletype belonging to the feature
	 */

	/**
 	 * 
	 * @param {ol.Feature} olFeature 
	 * @param {ol.Map} olMap 
	 * @param {UpdateProperties} properties 
	 * @param {StyleTypes} styleType 
	*/
	updateStyle(olFeature, olMap, properties = {}, styleType = null) {
		const usingStyleType = styleType ? styleType : this._detectStyleType(olFeature);		
		const { OverlayService: overlayService } = $injector.inject('OverlayService');
		overlayService.update(olMap, olFeature, usingStyleType, properties);
	}


	/**
	 * Removes overlays (added by OverlayStyle-classes) from the map and the feature
	 * @param {ol.Feature} olFeature the feature
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style exists
	 */
	removeStyle(olFeature, olMap) {
		const { OverlayService: overlayService } = $injector.inject('OverlayService');
		overlayService.remove(olMap, olFeature);
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
			default:
				console.warn('Could not provide a style for unknown style-type:', styleType);
		}
	}

	_addMeasureStyle(olFeature, olMap) {
		const { OverlayService: overlayService } = $injector.inject('OverlayService');
		olFeature.setStyle(measureStyleFunction(olFeature));
		overlayService.add(olMap, olFeature, StyleTypes.MEASURE);
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