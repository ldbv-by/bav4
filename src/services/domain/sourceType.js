/**
 * Enum of all supported source types names.
 */
export const SourceTypeName = Object.freeze({
	KML: 'kml',
	GPX: 'gpx',
	GEOJSON: 'geojson',
	WMS: 'wms'
});

/**
 * Describes the type of a geodata source.
 */
export class SourceType {

	constructor(name, version = null) {
		this._name = name;
		this._version = version;
	}

	get name() {
		return this._name;
	}

	get version() {
		return this._version;
	}
}
