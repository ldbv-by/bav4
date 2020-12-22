import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { toggleTheme } from '../../store/uiTheme.action';
import { $injector } from '../../../../injection';
import css from './themeToggle.css';

/**
 * Toggles the UI between a light and a dark theme
 * @class
 * @author aul
 */
export class ThemeToggle extends BaElement {

	constructor() {
		super();

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	extractState(store) {
		const { uiTheme: { theme } } = store;
		return { theme };
	}

	createView() {
		const isChecked = (this._state.theme === 'dark');
		const title = this._translationService.translate('uiTheme_toggle_tooltip_' + this._state.theme);

		return html`
        <style>${css}</style>
		<label title='${title}' class='switch'>
			<i class='icon adjust'></i>
			<div>
		  		<input type='checkbox' @change=${toggleTheme} ?checked=${isChecked}>
		  		<span class='slider round'></span>
			</div>
	  	</label>
		`;
	}

	static get tag() {
		return 'ba-theme-toggle';
	}
}