/**
 * @module modules/fullscreen/components/provider/FullscreenProvider
 */
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';

/**
 * Assigns the correct theme-specific CSS classes to the body element.
 *
 * Note: The FullScreenProvider is not implemented as a plugin, but as an MvuElement that does not render anything, thus ensuring that the corresponding CSS classes are applied very early on.
 * @class
 * @author alsturm
 */
export class FullScreenProvider extends MvuElement {
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
		const cssClassToAddFullscreen = fullscreen ? 'full-screen' : 'normal-screen';
		const cssClassToRemoveFullscreen = fullscreen ? 'normal-screen' : 'full-screen';

		const _window = this.#environmentService.getWindow();
		const _document = _window.document;
		const _body = _document.body;
		_body.classList.add(cssClassToAddFullscreen);
		_body.classList.remove(cssClassToRemoveFullscreen);

		// Only change browser fullscreen on non-touch devices when the body is not already fullscreen.
		if (_body.fullscreenElement || _window.matchMedia('(pointer:coarse)').matches) {
			return;
		}

		if (fullscreen) {
			_body.requestFullscreen();
			return;
		}

		if (_document.fullscreenElement) {
			_document.exitFullscreen?.();
		}
	}

	isRenderingSkipped() {
		return true;
	}

	static get tag() {
		return 'ba-fullscreen-provider';
	}
}
