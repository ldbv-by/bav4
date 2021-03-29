
export class OverlayManager {
	constructor(map) {
		this._map = map;
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
	
}