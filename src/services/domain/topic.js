
/**
* @class
*/
export class Topic {

	constructor(id, label, description, defaultBackground, backgroundLayers, activatedLayers = [], selectedLayers = []) {

		this._id = id;
		this._label = label;
		this._description = description;
		this._defaultBackground = defaultBackground;
		this._backgroundLayers = backgroundLayers;
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

	get defaultBackground() {
		return this._defaultBackground;
	}

	get backgroundLayers() {
		return [...this._backgroundLayers];
	}

	get selectedLayers() {
		return [...this._selectedLayers];
	}

	get activatedLayers() {
		return [...this._activatedLayers];
	}
}