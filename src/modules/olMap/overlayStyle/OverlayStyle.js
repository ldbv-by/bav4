
export const getOverlays = (layer) => {
	const overlays = [];
	layer.getSource().getFeatures().forEach(f => {
		const featureOverlays = f.get('overlays');
		if (featureOverlays) {
			featureOverlays.forEach(o => overlays.push(o));
		}
	});
	return overlays;
};

export class OverlayStyle {
	constructor() {
	}

	_add(overlay, olFeature, olMap) {
		const featureOverlays = olFeature.get('overlays') || [];
		featureOverlays.push(overlay);
		overlay.set('feature', olFeature);
		olFeature.set('overlays', featureOverlays);

		olMap.addOverlay(overlay);
	}

	_remove(overlay, olFeature, olMap) {
		const featureOverlays = olFeature.get('overlays') || [];
		olFeature.set('overlays', featureOverlays.filter(o => o !== overlay));

		olMap.removeOverlay(overlay);
	}

	/**
	 * @abstract
	 * @param {ol.feature} olFeature
	 * @param {ol.map} olMap
	 */
	add(/*eslint-disable no-unused-vars */olFeature, olMap) {
		// The child has not implemented this method.
		throw new TypeError('Please implement and call abstract method #add from child or do not call super.add from child.');
	}

	/**
	 * A Container-Object for optional properties related to a update of feature-overlays
	 * @typedef {Object} UpdateProperties
	 * @param {Number} [opacity] the opacity (0-1), may or may not given, to update the opacity of the specified feature, based on the styletype belonging to the feature
	 * @param {Boolean} [top] the top-flag (true/false),  may or may not given, whether or not to update the behavior of being in the topmost layer
	 * @param {Boolean} [visible] the visible-flag (true/false), may or may not given, whether or not to update the visibility of the specified feature, based on the styletype belonging to the feature
	 * @param {ol.Geometry} [geometry] the geometry, may or may not given, to update the geometry-based style of the specified feature, based on the styletype belonging to the feature

	/**
	 * Updates overlays (added by OverlayStyle-classes) on the map and the feature
	 * @abstract
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style exists
	 * @param {ol.Feature} olFeature the feature
	 * @param {UpdateProperties} properties the optional properties, which are used for additional style updates;
	 * any possible implications of a combination of defined UpdateProperties (i.e. visible=true && top=false) are handled by the current
	 * implementation of the OverlayStyle
	 */
	update(olFeature, olMap, properties = {}) {
		// The child has not implemented this method.
		throw new TypeError('Please implement and call abstract method #update from child or do not call super.update from child.');
	}

	/**
	 * @param {ol.feature} olFeature
	 * @param {ol.map} olMap
	 */
	remove(olFeature, olMap) {
		const featureOverlays = olFeature.get('overlays') || [];
		featureOverlays.forEach(o => olMap.removeOverlay(o));
		olFeature.set('overlays', []);
	}
}
