import { MeasurementOverlayStyle } from '../handler/measure/MeasurementOverlayStyle';
import { OverlayStyle } from '../OverlayStyle';
import { StyleTypes } from './StyleService';
/**
 * Adds or removes overlays to ol.feature.
 * @class
 * @author thiloSchlemmer
 */
export class OverlayService {

	/**
     * Adds explicit named overlays (OverlayStyle by StyleType) to the specified feature. 
     * @param {ol.Map} map the map, where overlays related to the feature-style will be added
     * @param {ol.Feature} olFeature the feature to be styled
     * @param {StyleType} styleType the styletype, if no matching to known styleTypes exists, 
     * no overlays will be added.
     */
	add(map, olFeature, styleType) {
		const overlayStyle = this._getOverlayStyleByType(styleType);		
		if (overlayStyle) {
			overlayStyle.add(olFeature, map);
		}
	}
	
	/**
     * Updates overlays (added by OverlayStyle-classes) on the map and the feature
     * @param {ol.Map} map the map, where overlays related to the feature-style exists
     * @param {ol.Feature} olFeature the feature
     * @param {StyleType} styleType the styletype, if no matching to known styleTypes exists, no overlays will be updated.
     * @param {ol.Geometry} geometry the geometry, which is the anchor for placing the overlay.
     */
	update(map, olFeature, styleType, geometry ) {
		const overlayStyle = this._getOverlayStyleByType(styleType);		
		if (overlayStyle) {
			overlayStyle.update(olFeature, map, geometry);
		}
	}

	/**
     * Removes overlays (added by OverlayStyle-classes) from the map and the feature
     * @param {ol.Map} map the map, where overlays related to the feature-style exists
     * @param {ol.Feature} olFeature the feature
     */
	remove(map, feature) {
		const overlayStyle = new OverlayStyle();
		overlayStyle.remove(feature, map);
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