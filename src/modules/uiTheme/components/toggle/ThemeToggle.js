import { html } from 'lit';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import css from './themeToggle.css';
import { toggleSchema } from '../../../../store/media/media.action';

/**
 * Toggles the UI between a light and a dark theme
 * @class
 * @author taulinger
 */
export class ThemeToggle extends BaElement {

	constructor() {
		super();

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	extractState(globalState) {
		const { media: { darkSchema } } = globalState;
		return { darkSchema };
	}


	onAfterRender(firsttime) {
		if (firsttime) {
			// register callback on toggle
			this._root.querySelector('ba-toggle').onToggle = () => {
				toggleSchema();
			};
		}
	}

	createView(state) {

		const { darkSchema } = state;
		const titleSuffix = darkSchema ? 'dark' : 'light';
		const title = this._translationService.translate(`uiTheme_toggle_tooltip_${titleSuffix}`);

		return html`
		<style>${css}</style>
		<ba-toggle title='${title}' checked=${darkSchema} ><div class='container'><i class='icon adjust'></i></div></ba-toggle>
		`;
	}

	static get tag() {
		return 'ba-theme-toggle';
	}
}
