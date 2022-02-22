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
 * Maximum FileSize for supported SourceTypes
 * 120000000 bytes => 120 MB
 */
export const SourceTypeMaxFileSize = 120000000;

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
