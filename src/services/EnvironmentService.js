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
	 *
	 * @returns `true` if the current device has touch support
	 */
	isTouch() {
		const navigator = this._window.navigator;
		const window = this._window;
		let hasTouchScreen = false;
		if ('maxTouchPoints' in navigator) {
			hasTouchScreen = navigator.maxTouchPoints > 0;
		} else {
			const mQ = window.matchMedia && window.matchMedia('(pointer:coarse)');
			if (mQ && mQ.media === '(pointer:coarse)') {
				hasTouchScreen = !!mQ.matches;
			} else if ('orientation' in window) {
				hasTouchScreen = true; // deprecated, but good fallback
			} else {
				// Only as a last resort, fall back to user agent sniffing
				const UA = navigator.userAgent;
				hasTouchScreen = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
			}
		}
		return hasTouchScreen;
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
	 * @returns `true` if we are in embedded mode
	 */
	isEmbedded() {
		return /(\/embed[/]?(index.html)?|embed.html)$/.test(this._window.location.pathname);
	}

	/**
	 *  @returns `true` if a backend is not configured
	 */
	isStandalone() {
		return !this._configService.getValue('BACKEND_URL', false);
	}
}
