/**
 * @module services/TranslationService
 */
import { $injector } from '../injection';
import { isFunction } from '../utils/checks';

/**
 *  Service for I18n.
 * @class
 * @author taulinger
 */
export class TranslationService {
	constructor() {
		const { ConfigService: configService, EnvironmentService: environmentService } = $injector.inject('ConfigService', 'EnvironmentService');
		this._environmentService = environmentService;
		this._language = configService.getValue('DEFAULT_LANG');
		this._providers = new Map();
		this._translations = new Map();
	}

	/**
	 * @public
	 */
	register(name, provider) {
		if (this._providers.has(name)) {
			throw new Error('Provider ' + name + ' already registered');
		}
		this._providers.set(name, provider);
		this._load(provider);
	}

	_load(provider) {
		Object.entries(provider(this._language)).forEach(([key, value]) => {
			if (this._translations.has(key)) {
				throw new Error('Key ' + key + ' already registered');
			}
			this._translations.set(key, value);
		});
	}

	/**
	 * @public
	 */
	reload(lang) {
		this._language = lang;
		this._translations.clear();

		this._providers.forEach((provider) => {
			this._load(provider);
		});
	}

	/**
	 * Returns the i18n value for a key. If the key is unknown the key is returned untouched.
	 * @param {string} key the i18n key
	 * @param {string[]} [params] Optional list of parameters (For template interpolation. In that case the provider must return the template from a function)
	 * @param {boolean} [silent] `true` if no WARN statement should be logged when the key is unknown. Default is `false`
	 * @returns the translated text
	 */
	translate(key, params = [], silent = false) {
		if (this._translations.has(key)) {
			return this._filter(isFunction(this._translations.get(key)) ? this._translations.get(key)(params) : this._translations.get(key));
		}
		if (!silent) {
			console.warn('No value found for ' + this._language + '.' + key);
		}
		return key;
	}

	/**
	 * @protected
	 */
	getMap() {
		return new Map(this._translations);
	}

	_filter(s) {
		return this._environmentService.isStandalone() ? s.replace('BayernAtlas', 'bav4') : s;
	}
}
