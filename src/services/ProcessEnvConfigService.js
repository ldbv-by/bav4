/**
 * @module services/ProcessEnvConfigService
 */
/**
 * Service provides all configuration properties.
 * Properties are loaded from the process.env object,
 * External config properties may be optionally set by the config.js resource  (see `/src/assets/config.js`).
 * @class
 * @author taulinger
 */
export class ProcessEnvConfigService {
	#enableLogging = true;
	constructor(enableLogging = true) {
		this.#enableLogging = enableLogging;
		this.#init();
	}

	#init() {
		this._properties = new Map();
		// We cannot use the EnvironmentService for accessing the window object. It is not yet initialized at this moment.
		 
		this._properties.set('RUNTIME_MODE', window?.ba_externalConfigProperties?.NODE_ENV ?? process.env.NODE_ENV);
		 
		this._properties.set('SOFTWARE_VERSION', '4.5');
		this._properties.set('SOFTWARE_INFO', window?.ba_externalConfigProperties?.SOFTWARE_INFO ?? process.env.SOFTWARE_INFO);
		 
		this._properties.set('DEFAULT_LANG', window?.ba_externalConfigProperties?.DEFAULT_LANG ?? process.env.DEFAULT_LANG ?? 'en');
		 
		this._properties.set('PROXY_URL', window?.ba_externalConfigProperties?.PROXY_URL ?? process.env.PROXY_URL);
		 
		this._properties.set('BACKEND_URL', window?.ba_externalConfigProperties?.BACKEND_URL ?? process.env.BACKEND_URL);
		 
		this._properties.set('BACKEND_ADMIN_TOKEN', window?.ba_externalConfigProperties?.BACKEND_ADMIN_TOKEN ?? process.env.BACKEND_ADMIN_TOKEN);
		 
		this._properties.set(
			'FRONTEND_URL',
			window?.ba_externalConfigProperties?.FRONTEND_URL ?? process.env.FRONTEND_URL ?? `${location.protocol}//${location.host}`
		);
		 
		this._properties.set('SHORTENING_SERVICE_URL', window?.ba_externalConfigProperties?.SHORTENING_SERVICE_URL ?? process.env.SHORTENING_SERVICE_URL);

		if (this.#enableLogging) {
			this._properties.forEach((value, key) => {
				if (value === undefined && !ProcessEnvConfigService.SILENT_PROPERTY_KEYS.includes(key)) {
					console.warn(
						'No config property found for ' +
							key +
							'. This is likely because the .env file is missing or you have to append this key to the .env file.'
					);
				}
			});
		}
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
	 * Returns a `value` for a given `key`.
	 * @param {string} key
	 * @param {string} [defaultValue] optional default value
	 * @returns {string} the `value`
	 * @throws `Error` when no value is available
	 * @public
	 */
	getValue(key, defaultValue) {
		const throwError = () => {
			throw new Error(`No value found for '${key}'`);
		};
		const value = this._properties.get(key) ?? defaultValue;
		return value ?? throwError();
	}

	/**
	 * Returns a `value` for a given `key`.
	 * Ensures that the value ends with a `/`.
	 * @param {string} key
	 * @param {string} [defaultValue] optional default value
	 * @returns {string} the `value`
	 * @throws `Error` when no value is available
	 * @public
	 */
	getValueAsPath(key, defaultValue) {
		return this._trailingSlash(this.getValue(key, defaultValue), true);
	}

	/**
	 * Checks if a `key` is registered.
	 * @param {string} key
	 * @returns {boolean} `true` if a key is registered
	 * @public
	 */
	hasKey(key) {
		return !!this._properties.get(key);
	}

	/**
	 *
	 * @returns `true` if logging is enabled
	 */
	isLoggingEnabled() {
		return this.#enableLogging;
	}

	/**
	 * Returns a list of properties whose absence does not trigger logging.
	 */
	static get SILENT_PROPERTY_KEYS() {
		return ['BACKEND_ADMIN_TOKEN'];
	}
}
