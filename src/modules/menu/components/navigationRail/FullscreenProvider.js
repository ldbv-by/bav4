/**
 * @module modules/menu/components/navigationRail/FullscreenProvider
 */
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';

/**
 * Assigns the correct theme-specific CSS classes to the body element.
 *
 * Note: The FullscreenProvider is not implemented as a plugin, but as an MvuElement that does not render anything, thus ensuring that the corresponding CSS classes are applied very early on.
 * @class
 * @author alsturm
 */
export class FullscreenProvider extends MvuElement {
	#environmentService;
	constructor() {
		super();

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this.#environmentService = EnvironmentService;
	}

	onInitialize() {
		this.observe(
			(store) => store.media.fullscreen,
			(fullscreen) => this.#updateFullscreen(fullscreen)
		);
	}

	#updateFullscreen(fullscreen) {
		const cssClassToAddFullscreen = fullscreen ? 'fullscreen' : 'normal-screen';
		const cssClassToRemoveFullscreen = fullscreen ? 'normal-screen' : 'fullscreen';
		this.#environmentService.getWindow().document.body.classList.add(cssClassToAddFullscreen);
		this.#environmentService.getWindow().document.body.classList.remove(cssClassToRemoveFullscreen);

		if (!this.#environmentService.getWindow().document.body.fullscreenElement) {
			if (!this.#environmentService.getWindow().matchMedia('(pointer:coarse)').matches) {
				if (fullscreen) {
					this.#environmentService.getWindow().document.body.requestFullscreen();
				} else {
					if (document.fullscreenElement) {
						this.#environmentService.getWindow().document.exitFullscreen?.();
					}
				}
			}
		}
	}

	isRenderingSkipped() {
		return true;
	}

	static get tag() {
		return 'ba-fullscreen-provider';
	}
}
