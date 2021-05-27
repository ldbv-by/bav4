import { MeasurementOverlayStyle } from '../handler/measure/MeasurementOverlayStyle';
import { measureStyleFunction } from '../olStyleUtils';
import { OverlayStyle } from '../OverlayStyle';


/**
 * @enum
 */
export const StyleTypes = Object.freeze({
	MEASURE: 'measure',
	DRAW: 'draw',
});

export const detectStyleType = (olFeature) => {
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
};

/**
 * Adds or removes styles and overlays to ol.feature.
 * @class
 * @author thiloSchlemmer
 */
export class StyleService {
	/**
     * Adds (explicit or implicit) specified styles and overlays (OverlayStyle) to the specified feature. 
     * @param {ol.Map} map the map, where overlays related to the feature-style will be added
     * @param {ol.Feature} olFeature the feature to be styled
     * @param {StyleType} styleType the styletype, if not explicit specified (styletype==null|undefined), 
     * the styleType will be implicitly detect by the feature-id. If no matching to known styleTypes exists, 
     * no styles or overlays will be added.
     */
	addStyle(map, olFeature, styleType = null ) {
		const usingStyleType = styleType ? styleType : detectStyleType(olFeature);
		if (usingStyleType) {
			switch (usingStyleType) {
				case StyleTypes.MEASURE:
					this._addMeasureStyle(map, olFeature);
					break;        
				default:
					console.warn('Could not provide a style for unknown style-type:', usingStyleType);
					break;
			}
		}
	}

	/**
     * Removes overlays (added by OverlayStyle-classes) from the map and the feature
     * @param {ol.Map} map the map, where overlays related to the feature-style exists
     * @param {ol.Feature} olFeature the feature
     */
	removeStyle(map, olFeature) {
		const overlayStyle = new OverlayStyle();
		overlayStyle.remove(olFeature, map);
	}

	_addMeasureStyle(map, olFeature) {
		const overlayStyle = new MeasurementOverlayStyle();
		olFeature.setStyle(measureStyleFunction(olFeature));
		overlayStyle.add(olFeature, map);		
	}
}