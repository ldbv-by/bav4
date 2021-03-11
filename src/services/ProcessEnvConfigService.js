
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
		this._properties.set('SEARCH_SERVICE_API_KEY', process.env.SEARCH_SERVICE_API_KEY);
		// eslint-disable-next-line no-undef
		this._properties.set('SOFTWARE_INFO', process.env.SOFTWARE_INFO);
		// eslint-disable-next-line no-undef
		this._properties.set('DEFAULT_LANG', process.env.DEFAULT_LANG);
		// eslint-disable-next-line no-undef
		this._properties.set('PROXY_URL', process.env.PROXY_URL);
		// eslint-disable-next-line no-undef
		this._properties.set('BACKEND_URL', process.env.BACKEND_URL);

		this._properties.forEach((value, key) => {
			if (value === undefined) {
				console.warn('No config property found for ' + key + '. This is likely because the .env file is missing or you have to append this key to the .env file.');
			}
		});
	}

	/**
	 * 
	 * @param {string} value 
	 * @private
	 */
	_trailingSlash(value, append) {
		if (!value) {
			return;
		}
		value = value.trim();
		if (append) {
			return value.endsWith('/') ? value : value + '/';
		}
		return value.replace(/\/$/, '');
	}

	/**
	 * 
	 * @param {string} key 
	 * @param {string} defaultValue 
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
	 * Ensures that the value ends with a <code>/</code>
	 * @param {string} key 
	 * @param {string} defaultValue 
	 * @public
	 */
	getValueAsPath(key, defaultValue) {
		return this._trailingSlash(this.getValue(key, defaultValue), true);
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