/**
 * @module modules/uiTheme/components/provider/ThemeProvider
 */
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';

/**
 * Assigns the correct theme-specific CSS classes to the body element.
 *
 * Note: The ThemeProvider is not implemented as a plugin, but as an MvuElement that does not render anything, thus ensuring that the corresponding CSS classes are applied very early on.
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
