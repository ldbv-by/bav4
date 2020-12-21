import { BaElement } from '../../../BaElement';
import { changeTheme } from '../../store/uiTheme.action';
import { $injector } from '../../../../injection';

/**
 * Provides the body-element with a light or dark theme class
 * @class
 * @author aul
 */
export class ThemeProvider extends BaElement {

	constructor() {
		super();

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
	}

	initialize() {

		this._updateCss();

		//listen to theme changes on window
		this._environmentService.getWindow().matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
			changeTheme(e.matches ? 'dark' : 'light');
		});
	}

	_updateCss() {
		
		const { theme } = this._state;
		const cssClass = theme === 'dark' ? 'dark-theme' : 'light-theme';
		this._environmentService.getWindow()
			.document.body.classList.toggle(cssClass);
	}

	isRenderingSkipped() {
		return true;
	}

	onStateChanged() {
		this._updateCss();
	}

	extractState(store) {
		const { uiTheme: { theme } } = store;
		return { theme };
	}

	static get tag() {
		return 'ba-theme-provider';
	}
}