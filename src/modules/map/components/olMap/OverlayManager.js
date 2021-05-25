
export class OverlayManager {
	constructor() {		
		this._overlays = [];		
	}

	activate(map) {
		this._map = map;
		this.reset();
	}

	deactivate() {
		this.reset();
	}

	add(overlay) {
		this._overlays.push(overlay);
		this._map.addOverlay(overlay);
	}

	remove(overlay) {
		this._overlays = this._overlays.filter(o => o !== overlay);
		this._map.removeOverlay(overlay);
	}

	apply(overlayCallback) {
		this._overlays.forEach(o => overlayCallback(o));
	}

	getOverlays() {
		return [...this._overlays];
	}


	reset() {
		this._overlays.forEach(o => this._map.removeOverlay(o));
		this._overlays = [];
	}

	/**
	 * @abstract
	 * @protected
	 * @param {ol.feature} feature
	 */
	createFor(/*eslint-disable no-unused-vars */feature) {
		// The child has not implemented this method.
		throw new TypeError('Please implement and call abstract method #createFor from child or call static OverlayManager.createFor.');
	}

	/**
	 * @abstract
	 * @protected
	 * @param {ol.feature} feature
	 */
	removeFrom(/*eslint-disable no-unused-vars */feature) {
		// The child has not implemented this method.
		throw new TypeError('Please implement and call abstract method #removeFrom from child or call static OverlayManager.removeFrom.');
	}
}