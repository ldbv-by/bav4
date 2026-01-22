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
	constructor() {
		// Overrides NodeJs "process" with "import.meta" since it can not be used with vite

		this._properties = new Map();
		// We cannot use the EnvironmentService for accessing the window object. It is not yet initialized at this moment.
		// eslint-disable-next-line no-undef
		this._properties.set('RUNTIME_MODE', window?.ba_externalConfigProperties?.NODE_ENV ?? import.meta.env.NODE_ENV);
		// eslint-disable-next-line no-undef
		this._properties.set('SOFTWARE_VERSION', '4.5');
		this._properties.set('SOFTWARE_INFO', window?.ba_externalConfigProperties?.SOFTWARE_INFO ?? import.meta.env.SOFTWARE_INFO);
		// eslint-disable-next-line no-undef
		this._properties.set('DEFAULT_LANG', window?.ba_externalConfigProperties?.DEFAULT_LANG ?? import.meta.env.DEFAULT_LANG ?? 'en');
		// eslint-disable-next-line no-undef
		this._properties.set('PROXY_URL', window?.ba_externalConfigProperties?.PROXY_URL ?? import.meta.env.PROXY_URL);
		// eslint-disable-next-line no-undef
		this._properties.set('BACKEND_URL', window?.ba_externalConfigProperties?.BACKEND_URL ?? import.meta.env.BACKEND_URL);
		// eslint-disable-next-line no-undef
		this._properties.set('BACKEND_ADMIN_TOKEN', window?.ba_externalConfigProperties?.BACKEND_ADMIN_TOKEN ?? import.meta.env.BACKEND_ADMIN_TOKEN);
		// eslint-disable-next-line no-undef
		this._properties.set(
			'FRONTEND_URL',
			window?.ba_externalConfigProperties?.FRONTEND_URL ?? import.meta.env.FRONTEND_URL ?? `${location.protocol}//${location.host}`
		);
		// eslint-disable-next-line no-undef
		this._properties.set(
			'SHORTENING_SERVICE_URL',
			window?.ba_externalConfigProperties?.SHORTENING_SERVICE_URL ?? import.meta.env.SHORTENING_SERVICE_URL
		);

		this._properties.forEach((value, key) => {
			if (value === undefined) {
				console.warn(
					'No config property found for ' + key + '. This is likely because the .env file is missing or you have to append this key to the .env file.'
				);
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
}
