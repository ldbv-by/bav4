
import { $injector } from '../injection';

/**
 *  Service for I18n.
 * @class
 * @author aul
 */
export class TranslationService {

	constructor() {
		const { ConfigService } = $injector.inject('ConfigService');
		this._language = ConfigService.getValue('DEFAULT_LANG', 'en');
		this._translations = new Map();

		this._translations.set(this._language, this._load(this._language));
	}

	/**
	 * @public
	 */
	translate(key) {
		const langMap = this._translations.get(this._language);
		if (langMap.has(key)) {
			return langMap.get(key);
		}
		console.warn('No value found for ' + this._language + '.' + key);
		return key;
	}

	/**
	 * @protected
	 */
	getMap(key) {
		return this._translations.get(key);
	}

	_load(lang) {
		switch (lang) {

			case 'en':
				return new Map(Object.entries(
					{
						zoom_in_button: 'Zoom in',
						zoom_out_button: 'Zoom out'
					}
				));


			case 'de':
				return new Map(Object.entries(
					{
						zoom_in_button: 'Vergrößere Kartenausschnitt',
						zoom_out_button: 'Verkleinere Kartenausschnitt'
					}
				));
		}
		return new Map();
	}
}