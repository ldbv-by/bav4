
/**
 * Service for external configuration properties.
 * @class
 * @author aul
 */
export class ProcessEnvConfigService {
	constructor() {
		this._properties = new Map();
		// eslint-disable-next-line no-undef
		this._properties.set('RUNTIME_MODE', process.env.NODE_ENV);
		// eslint-disable-next-line no-undef
		this._properties.set('SEARCH_SERVICE_API_KEY', this._trailingSlash(process.env.SEARCH_SERVICE_API_KEY));
		// eslint-disable-next-line no-undef
		this._properties.set('SOFTWARE_INFO', process.env.SOFTWARE_INFO);
		// eslint-disable-next-line no-undef
		this._properties.set('DEFAULT_LANG', process.env.DEFAULT_LANG);
		// eslint-disable-next-line no-undef
		this._properties.set('PROXY_URL', this._trailingSlash(process.env.PROXY_URL));
	}

	/**
	 * 
	 * @param {string} value 
	 * @private
	 */
	_trailingSlash(value) {
		if (!value) {
			return;
		}
		value = value.trim();
		const test = value.endsWith('/') ? value : value + '/';
		return test;
	}

	/**
	 * 
	 * @param {string} key 
	 * @param string*} defaultValue 
	 * @public
	 */
	getValue(key, defaultValue) {
		// eslint-disable-next-line no-undef
		if (this.hasKey(key)) {
			// eslint-disable-next-line no-undef
			return this._properties.get(key);
		}
		if (defaultValue !== undefined) {
			return defaultValue;
		}
		throw 'No value found for \'' + key + '\'';
	}

	/**
	 * 
	 * @param {string} key 
	 * @public
	 */
	hasKey(key) {
		return !!this._properties.get(key);
	}
}