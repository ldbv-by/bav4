/**
 * @module services/FileSaveService
 */

/**
 * Service for saving files
 * @class
 * @author thiloSchlemmer
 */
export class FileSaveService {
	/**
	 * Saves the specified content and makes it for the user available as downloaded file
	 * @param {string} content The content to save
	 * @param {module:services/HttpService~MediaType} type The MediaType (MIME-Type) of the file
	 * @param {string} fileName The filename
	 */
	saveAs(content, type, fileName) {
		if (!content || !type || !fileName) {
			throw Error('content, mimetype and fileName must be specified');
		}
		const blob = new Blob([content], { type: type });

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
}
