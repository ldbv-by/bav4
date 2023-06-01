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
	 * saves the specified content and makes it for the user available as downloaded file
	 * @param {string} content the content to save
	 * @param {module:services/HttpService~MediaType} type the MediaType (MIMEType) of file
	 * @param {string} fileName the filename
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
