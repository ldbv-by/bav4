
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
						//the first part of the snake_case key should be the name of the related module
						map_zoom_in_button: 'Zoom in',
						map_zoom_out_button: 'Zoom out',

						uiTheme_toggle_tooltip_dark: 'Enable contrast mode',
						uiTheme_toggle_tooltip_light: 'Disable contrast mode'
					}
				));


			case 'de':
				return new Map(Object.entries(
					{
						//the first part of the snake_case key should be the name of the related module
						map_zoom_in_button: 'Vergrößere Kartenausschnitt',
						map_zoom_out_button: 'Verkleinere Kartenausschnitt',

						uiTheme_toggle_tooltip_dark: 'Kontrastmodus aktivieren',
						uiTheme_toggle_tooltip_light: 'Kontrastmodus deaktivieren'
					}
				));
		}
		return new Map();
	}
}