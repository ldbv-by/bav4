/**
 * @module modules/uiTheme/components/provider/ThemeProvider
 */
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';

/**
 * Provides the body element with a light or dark theme class
 * @class
 * @author taulinger
 */
export class ThemeProvider extends MvuElement {
	constructor() {
		super();

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
	}

	onInitialize() {
		this.observe(
			(store) => store.media.darkSchema,
			(darkSchema) => this.#updateCss(darkSchema)
		);
	}

	#updateCss(darkSchema) {
		const cssClassToAdd = darkSchema ? 'dark-theme' : 'light-theme';
		const cssClassToRemove = darkSchema ? 'light-theme' : 'dark-theme';
		this._environmentService.getWindow().document.body.classList.add(cssClassToAdd);
		this._environmentService.getWindow().document.body.classList.remove(cssClassToRemove);
	}

	isRenderingSkipped() {
		return true;
	}

	static get tag() {
		return 'ba-theme-provider';
	}
}
