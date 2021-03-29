
/**
* @class
*/
export class Topic {

	constructor(id, label, description, baseGeoRs, defaultBaseGeoR = baseGeoRs[0], activatedGeoRs = [], selectedGeoRs = []) {

		this._id = id;
		this._label = label;
		this._description = description;
		this._defaultBaseGeoR = defaultBaseGeoR;
		this._baseGeoRs = baseGeoRs;
		this._activatedGeoRs = activatedGeoRs;
		this._selectedGeoRs = selectedGeoRs;
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

	get defaultBaseGeoR() {
		return this._defaultBaseGeoR;
	}

	get baseGeoRs() {
		return [...this._baseGeoRs];
	}

	get selectedGeoRs() {
		return [...this._selectedGeoRs];
	}

	get activatedGeoRs() {
		return [...this._activatedGeoRs];
	}
}