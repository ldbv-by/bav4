/**
 * @module services/FileSaveService
 */
import { $injector } from '../injection';

/**
 * Service for saving files
 * @class
 * @author thiloSchlemmer
 */
export class FileSaveService {
	constructor() {
		const { ConfigService } = $injector.inject('ConfigService');
		this._configService = ConfigService;
	}

	/**
	 * saves the specified content and makes it for the user available as downloaded file
	 * @param {string} content the content to save
	 * @param {module:services/HttpService~MediaType} type
	 * @param {string} [filename]
	 */
	saveAs(content, type, filename = null) {
		if (!content || !type) {
			throw Error('content and mimetype must be specified');
		}

		const fileName = filename ?? this._configService.getValue('DEFAULT_SAVE_FILENAME', 'fileSaved');
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
