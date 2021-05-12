import { BaElement } from '../../../BaElement';
import { changeTheme } from '../../store/uiTheme.action';
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

		//listen to theme changes on window
		this._environmentService.getWindow().matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
			changeTheme(e.matches ? 'dark' : 'light');
		});
	}

	_updateCss(state) {
		
		const { theme } = state;
		const cssClassToAdd = theme === 'dark' ? 'dark-theme' : 'light-theme';
		const cssClassToRemove = theme === 'light' ? 'dark-theme' : 'light-theme';
		this._environmentService.getWindow()
			.document.body.classList.add(cssClassToAdd);
		this._environmentService.getWindow()
			.document.body.classList.remove(cssClassToRemove);
	}

	isRenderingSkipped() {
		return true;
	}

	onStateChanged(state) {
		this._updateCss(state);
	}

	extractState(globalState) {
		const { uiTheme: { theme } } = globalState;
		return { theme };
	}

	static get tag() {
		return 'ba-theme-provider';
	}
}