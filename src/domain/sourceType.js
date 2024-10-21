/**
 * @module domain/sourceType
 */
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
	 * @param {string} [version] version of type of source
	 * @param {number} [srid] SRID of this source
	 */
	constructor(name, version = null, srid = null) {
		this._name = name;
		this._version = version;
		this._srid = srid;
	}

	get name() {
		return this._name;
	}

	get version() {
		return this._version;
	}

	get srid() {
		return this._srid;
	}
}

/**
 * Enum of all supported source types names.
 * @readonly
 * @enum {String}
 */
export const SourceTypeName = Object.freeze({
	KML: 'kml',
	GPX: 'gpx',
	GEOJSON: 'geojson',
	WMS: 'wms',
	EWKT: 'ewkt'
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
 * @readonly
 * @enum {Number}
 */
export const SourceTypeResultStatus = Object.freeze({
	OK: 0,
	UNSUPPORTED_TYPE: 1,
	MAX_SIZE_EXCEEDED: 2,
	OTHER: 3,
	BAA_AUTHENTICATED: 4,
	RESTRICTED: 5,
	UNSUPPORTED_SRID: 6
});
