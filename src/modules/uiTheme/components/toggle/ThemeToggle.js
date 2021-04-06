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

	extractState(state) {
		const { uiTheme: { theme } } = state;
		return { theme };
	}


	onAfterRender(firsttime) {
		if (firsttime) {
			// register callback on toggle
			this._root.querySelector('ba-toggle').onToggle = () => {
				toggleTheme();
			};
		}
	}

	createView() {
		const isChecked = (this._state.theme === 'dark');
		const title = this._translationService.translate('uiTheme_toggle_tooltip_' + this._state.theme);

		return html`
		<style>${css}</style>
		<ba-toggle title='${title}' checked=${isChecked} ><div class='container'><i class='icon adjust'></i></div></ba-toggle>
		`;
	}

	static get tag() {
		return 'ba-theme-toggle';
	}
}