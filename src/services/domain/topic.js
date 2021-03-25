
/**
* @class
*/
export class Topic {

	constructor(id, label, description, baseLayers, defaultBaseLayer = baseLayers[0], activatedLayers = [], selectedLayers = []) {

		this._id = id;
		this._label = label;
		this._description = description;
		this._defaultBaseLayer = defaultBaseLayer;
		this._baseLayers = baseLayers;
		this._activatedLayers = activatedLayers;
		this._selectedLayers = selectedLayers;
	}

	get id() {
		return this._id;
	}

	get label() {
		return this._label;
	}

	get description() {
		return this._description;
	}

	get defaultBaseLayer() {
		return this._defaultBaseLayer;
	}

	get baseLayers() {
		return [...this._baseLayers];
	}

	get selectedLayers() {
		return [...this._selectedLayers];
	}

	get activatedLayers() {
		return [...this._activatedLayers];
	}
}