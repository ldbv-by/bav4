
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
	 * @param {ol.feature} feature 
	 * @param {ol.map} map
	 */
	add(/*eslint-disable no-unused-vars */feature, map) {
		// The child has not implemented this method.
		throw new TypeError('Please implement and call abstract method #add from child or do not call super.add from child.');
	}

	/**
	 * @override
	 * @param {ol.feature} feature 
	 * @param {ol.map} map
	 * @param {ol.geometry|null} geometry
	 */
	update(feature, map, geometry = null) {
		// The child has not implemented this method.
		throw new TypeError('Please implement and call abstract method #update from child or do not call super.update from child.');
	}

	/**
	 * @abstract
	 * @param {ol.feature} feature 
	 * @param {ol.map} map
	 */
	remove(/*eslint-disable no-unused-vars */feature, map) {
		// The child has not implemented this method.
		throw new TypeError('Please implement and call abstract method #remove from child or do not call super.remove from child.');
	}
}