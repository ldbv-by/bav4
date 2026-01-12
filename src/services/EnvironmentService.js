/**
 * @module services/EnvironmentService
 */
import { $injector } from '../injection';

/**
 * @class
 */
export class EnvironmentService {
	/**
	 *
	 * @param {Window} [_window=window]
	 */
	constructor(_window = window) {
		this._window = _window;
		const { ConfigService } = $injector.inject('ConfigService');
		this._configService = ConfigService;
	}

	/**
	 * Returns the current query parameters.
	 * @returns the current `URLSearchParams`
	 */
	getQueryParams() {
		return new URLSearchParams(this._window.location.search);
	}

	/**
	 * @returns the global `window` object
	 */
	getWindow() {
		return this._window;
	}

	/**
	 * @returns `true` if the primary pointing device is a touch device
	 */
	isTouch() {
		return this._window.matchMedia('(pointer:coarse)').matches;
	}

	/**
	 * @returns `true` if the primary pointing device is a mouse / touch pad device
	 */
	isMouse() {
		return this._window.matchMedia('(pointer:fine)').matches && this._window.matchMedia('(hover:hover)').matches;
	}

	/**
	 * @returns `true` if the primary pointing device is a mouse device but it has also a touch device as a secondary device
	 */
	isMouseWithTouchSupport() {
		return this._window.matchMedia('(any-pointer:coarse)').matches && this._window.matchMedia('(pointer:fine)').matches;
	}
	/**
	 *
	 * @returns `true` if the current device has a retina display
	 */
	isRetinaDisplay() {
		const window = this._window;
		const mq =
			window.matchMedia &&
			window.matchMedia(
				'only screen and (-webkit-min-device-pixel-ratio: 1.5), only screen and (min--moz-device-pixel-ratio: 1.5), only screen and (-o-min-device-pixel-ratio: 3/2), only screen and (min-device-pixel-ratio: 1.5), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 1.5dppx)'
			);
		return (mq && mq.matches) ?? window.devicePixelRatio > 1;
	}

	/**
	 *
	 * @returns `true` if the current device has dark mode enabled
	 */
	isDarkMode() {
		const window = this._window;
		return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	/**
	 *
	 * @returns `true` if the current device has high contrast enabled
	 */
	isHighContrast() {
		const window = this._window;
		return window.matchMedia && window.matchMedia('(forced-colors: active)').matches;
	}

	/**
	 *
	 * @returns `true` if we are in embedded mode (as Iframe or Web Component)
	 */
	isEmbedded() {
		return this.isEmbeddedAsIframe() || this.isEmbeddedAsWC();
	}

	/**
	 *
	 * @returns `true` if we are in embedded mode due to an Iframe
	 */
	isEmbeddedAsIframe() {
		return EnvironmentService._EMBED_DETECTION_REGEX.test(this._window.location.pathname) && !this._window.name?.startsWith('ba_');
	}

	/**
	 *
	 * @returns `true` if we are in embedded due to a Web Component
	 */
	isEmbeddedAsWC() {
		// we are embedded as WC when we are loaded via an iframe and the iframe has a name attribute with prefix "ba"
		return EnvironmentService._EMBED_DETECTION_REGEX.test(this._window.location.pathname) && this._window.name?.startsWith('ba_');
	}

	/**
	 *  @returns `true` if a backend is not configured
	 */
	isStandalone() {
		return !this._configService.getValue('BACKEND_URL', false);
	}

	static get _EMBED_DETECTION_REGEX() {
		return /(\/embed[/]?(index.html)?|embed.html)$/;
	}
}
