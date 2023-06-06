/**
 * @module services/FileSaveService
 */

import { MediaType } from '../domain/mediaTypes';

const DEFAULT_FILE_NAME_PREFIX = 'bayernatlas';

/**
 * Service for saving files
 * @class
 * @author thiloSchlemmer
 */
export class FileSaveService {
	/**
	 * Saves the specified content and makes it for the user available as downloaded file.
	 * The extension for the filename is guessed from the MIME-type otherwise the
	 * filename is left without any extension.
	 * @param {string} content The content to save
	 * @param {module:domain/mediaTypes.MediaType} mimeType The MediaType (MIME-Type) of the file
	 * @param {string} [filename] The optional filename without extension
	 * @throws {Error}
	 */
	saveAs(content, mimeType, filename = null) {
		if (!content || !mimeType) {
			throw Error('content and mimeType must be specified');
		}

		const blob = new Blob([content], { type: mimeType });
		const fileName = this._getFileName(filename, mimeType);

		const url = window.URL.createObjectURL(blob);
		try {
			const a = document.createElement('a');
			a.href = url;
			a.download = fileName;
			a.click();
		} finally {
			window.URL.revokeObjectURL(url);
		}
	}

	_getFileName(filename, mimeType) {
		const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');
		const fileName = filename ?? `${DEFAULT_FILE_NAME_PREFIX}_${timestamp}`;
		const fileExtension = this._getFileExtensionFrom(mimeType);

		return fileExtension ? `${fileName}.${fileExtension}` : fileName;
	}

	_getFileExtensionFrom(mimeType) {
		switch (mimeType) {
			case MediaType.GPX:
				return 'gpx';
			case MediaType.GeoJSON:
				return 'geojson';
			case MediaType.JSON:
				return 'json';
			case MediaType.KML:
				return 'kml';
			case MediaType.TEXT_PLAIN:
				return 'txt';
			case MediaType.TEXT_HTML:
				return 'html';
		}
		return null;
	}
}
