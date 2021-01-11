import { $injector } from '../injection';

/**
 *  Service for I18n.
 * @class
 * @author aul
 */
export class TranslationService {

	constructor() {
		const { ConfigService: configService } = $injector.inject('ConfigService');
		this._language = configService.getValue('DEFAULT_LANG', 'en');
		this._provider = new Map();
	}

	/**
	* @public
	*/
	register(name, provider) {

		if (this._provider.has(name)) {
			throw new Error('Provider ' + name + ' already registered');
		}
		this._provider.set(name, provider);
	}

	_get(lang) {

		const langMap = new Map();
		this._provider.forEach(provider => {
			Object
				.entries(provider(lang))
				.forEach(([key, value]) => {
					if (langMap.has(key)) {
						throw new Error('Key ' + key + ' already registered');
					}
					langMap.set(key, value);
				});
		});
		return langMap;
	}

	/**
	 * @public
	 */
	translate(key) {
		const langMap = this._get(this._language);
		if (langMap.has(key)) {
			return langMap.get(key);
		}
		console.warn('No value found for ' + this._language + '.' + key);
		return key;
	}

	/**
	 * @protected
	 */
	getMap(lang) {
		return this._get(lang);
	}
}