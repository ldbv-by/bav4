
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

	_add(overlay, feature, map) {
		if (feature) {
			const featureOverlays = feature.get('overlays') || [];
			featureOverlays.push(overlay);
			overlay.set('feature', feature);
			feature.set('overlays', featureOverlays);
		}
		map.addOverlay(overlay);
	}

	_remove(overlay, feature, map) {
		if (feature) {
			const featureOverlays = feature.get('overlays') || [];
			feature.set('overlays', featureOverlays.filter(o => o !== overlay));
		}
		map.removeOverlay(overlay);
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
	 * @override
	 * @param {ol.feature} olFeature 
	 * @param {ol.map} olMap
	 * @param {ol.geometry|null} geometry
	 */
	update(olFeature, olMap, geometry = null) {
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
	}
}