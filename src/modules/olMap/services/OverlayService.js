import { MeasurementOverlayStyle } from '../overlayStyle/MeasurementOverlayStyle';
import { OverlayStyle } from '../overlayStyle/OverlayStyle';
import { StyleTypes } from './StyleService';
/**
 * Adds or removes overlays to ol.feature.
 * @class
 * @author thiloSchlemmer
 */
export class OverlayService {
	/**
	 * Adds explicit named overlays (OverlayStyle by StyleType) to the specified feature.
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style will be added
	 * @param {ol.Feature} olFeature the feature to be styled
	 * @param {StyleType} styleType the styletype, if no matching to known styleTypes exists,
	 * no overlays will be added.
	 */
	add(olFeature, olMap, styleType) {
		const overlayStyle = this._getOverlayStyleByType(styleType);
		if (overlayStyle) {
			overlayStyle.add(olFeature, olMap);
		}
	}

	/**
	 * A Container-Object for optional properties related to a update of feature-overlays
	 * @typedef {Object} UpdateProperties
	 * @param {Number} [opacity] the opacity (0-1), may or may not given, to update the opacity of the specified feature, based on the styletype belonging to the feature
	 * @param {Boolean} [top] the top-flag (true/false),  may or may not given, whether or not to update the behavior of being in the topmost layer
	 * @param {Boolean} [visible] the visible-flag (true/false), may or may not given, whether or not to update the visibility of the specified feature, based on the styletype belonging to the feature
	 * @param {ol.Geometry} [geometry] the geometry, may or may not given, to update the geometry-based style of the specified feature, based on the styletype belonging to the feature
	 */

	/**
	 * Updates overlays (added by OverlayStyle-classes) on the map and the feature
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style exists
	 * @param {ol.Feature} olFeature the feature
	 * @param {StyleType} styleType the styletype, if no matching to known styleTypes exists, no overlays will be updated.
	 * @param {UpdateProperties} properties the optional properties, which are used for additional style updates;
	 * any possible implications of a combination of defined UpdateProperties (i.e. visible=true && top=false) are handled by the current
	 * implementation of the OverlayService
	 */
	update(olFeature, olMap, styleType, properties = {}) {
		const overlayStyle = this._getOverlayStyleByType(styleType);
		if (overlayStyle) {
			overlayStyle.update(olFeature, olMap, properties);
		}
	}

	/**
	 * Removes overlays (added by OverlayStyle-classes) from the map and the feature
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style exists
	 * @param {ol.Feature} olFeature the feature
	 */
	remove(olFeature, olMap) {
		const overlayStyle = new OverlayStyle();
		overlayStyle.remove(olFeature, olMap);
	}

	_getOverlayStyleByType(styleType) {
		switch (styleType) {
			case StyleTypes.MEASURE:
				return new MeasurementOverlayStyle();
			default:
				console.warn('Could not provide a style for unknown style-type:', styleType);
				break;
		}
		return null;
	}
}
