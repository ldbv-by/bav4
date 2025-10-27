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
	#environmentService;
	constructor() {
		super();

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this.#environmentService = EnvironmentService;
	}

	onInitialize() {
		this.observe(
			(store) => store.media.darkSchema,
			(darkSchema) => this.#updateCssTheme(darkSchema)
		);
		this.observe(
			(store) => store.media.maxContrast,
			(maxContrast) => this.#updateCssContrast(maxContrast)
		);
	}

	#updateCssTheme(darkSchema) {
		const cssClassToAdd = darkSchema ? 'dark-theme' : 'light-theme';
		const cssClassToRemove = darkSchema ? 'light-theme' : 'dark-theme';
		this.#environmentService.getWindow().document.body.classList.add(cssClassToAdd);
		this.#environmentService.getWindow().document.body.classList.remove(cssClassToRemove);
	}

	#updateCssContrast(maxContrast) {
		const cssClassToAddContrast = maxContrast ? 'max-contrast' : 'normal-contrast';
		const cssClassToRemoveContrast = maxContrast ? 'normal-contrast' : 'max-contrast';
		this.#environmentService.getWindow().document.body.classList.add(cssClassToAddContrast);
		this.#environmentService.getWindow().document.body.classList.remove(cssClassToRemoveContrast);
	}

	isRenderingSkipped() {
		return true;
	}

	static get tag() {
		return 'ba-theme-provider';
	}
}
