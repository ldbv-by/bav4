/**
 * @module modules/uiTheme/components/provider/ThemeProvider
 */
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';

/**
 * Provides the body-element with a light or dark theme class
 * @class
 * @author taulinger
 */
export class ThemeProvider extends BaElement {
	constructor() {
		super();

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
	}

	initialize() {
		this._updateCss(this.getState());
	}

	_updateCss(state) {
		const { darkSchema } = state;
		const cssClassToAdd = darkSchema ? 'dark-theme' : 'light-theme';
		const cssClassToRemove = darkSchema ? 'light-theme' : 'dark-theme';
		this._environmentService.getWindow().document.body.classList.add(cssClassToAdd);
		this._environmentService.getWindow().document.body.classList.remove(cssClassToRemove);
	}

	isRenderingSkipped() {
		return true;
	}

	onStateChanged(state) {
		this._updateCss(state);
	}

	extractState(globalState) {
		const {
			media: { darkSchema }
		} = globalState;
		return { darkSchema };
	}

	static get tag() {
		return 'ba-theme-provider';
	}
}
