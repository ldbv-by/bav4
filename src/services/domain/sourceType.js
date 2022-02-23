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


/**
 * Result of a request for a SourceType.
 * Contains a status flag ({@link SourceTypeResultStatus})
 * and, if the request was successful, the actual {@link SourceType}.
 */
export class SourceTypeResult {

	constructor(status, sourceType = null) {
		this._status = status;
		this._sourceType = sourceType;
	}

	get status() {
		return this._status;
	}

	get sourceType() {
		return this._sourceType;
	}
}

/**
 * Flag that indicates the status of a SourceTypeResult.
 * @enum
 */
export const SourceTypeResultStatus = Object.freeze({
	OK: 0,
	UNSUPPORTED_TYPE: 1,
	MAX_SIZE_EXCEEDED: 2,
	OTHER: 3
});

