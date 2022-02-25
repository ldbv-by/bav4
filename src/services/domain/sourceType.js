/**
 * Currently maximum file size for supported SourceTypes: 128 Mebibyte
 */
export const SourceTypeMaxFileSize = 2 ** 27;

/**
 * Describes the type of a geodata source.
 */
export class SourceType {

	/**
	 * @param {SourceTypeName} name
	 * @param {string} version
	 */
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
 * Enum of all supported source types names.
 */
export const SourceTypeName = Object.freeze({
	KML: 'kml',
	GPX: 'gpx',
	GEOJSON: 'geojson',
	WMS: 'wms'
});


/**
 * Result of a request for a SourceType.
 * Contains a status flag ({@link SourceTypeResultStatus})
 * and, if the request was successful, the actual {@link SourceType}.
 */
export class SourceTypeResult {

	/**
	 *
	 * @param {SourceTypeResultStatus} status
	 * @param {SourceType} sourceType
	 */
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

