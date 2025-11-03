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
			(store) => store.media.highContrast,
			(highContrast) => this.#updateCssContrast(highContrast)
		);
	}

	#updateCssTheme(darkSchema) {
		const cssClassToAdd = darkSchema ? 'dark-theme' : 'light-theme';
		const cssClassToRemove = darkSchema ? 'light-theme' : 'dark-theme';
		this.#environmentService.getWindow().document.body.classList.add(cssClassToAdd);
		this.#environmentService.getWindow().document.body.classList.remove(cssClassToRemove);
	}

	#updateCssContrast(highContrast) {
		const cssClassToAddContrast = highContrast ? 'high-contrast' : 'normal-contrast';
		const cssClassToRemoveContrast = highContrast ? 'normal-contrast' : 'high-contrast';
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
