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
	 * @returns URLSearchParams
	 */
	getUrlParams() {
		return new URLSearchParams(this._window.location.search);
	}

	/**
	 * @returns the global window object
	 */
	getWindow() {
		return this._window;
	}

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
	 * Should not be used anymore.
	 * Use a media query like
	 * ```
	 * window.matchMedia('(orientation: portrait)')
	 * ```
	 * </pre></code>
	 * instead.
	 * @deprecated
	 * @see https://caniuse.com/screen-orientation
	 */
	getScreenOrientation() {
		const orientation = (this._window.screen.orientation || {}).type || this._window.screen.mozOrientation || this._window.screen.msOrientation;
		if (!orientation) {
			const widthHeightRatio = this._window.screen.width / this._window.screen.height;
			return {
				portrait: widthHeightRatio < 1,
				landscape: widthHeightRatio >= 1
			};
		}
		return {
			portrait: orientation.startsWith('portrait'),
			landscape: orientation.startsWith('landscape')
		};
	}

	/**
	 *
	 * @returns `true` if we are in embedded mode
	 */
	isEmbedded() {
		return /(\/embed[/]?(index.html)?|embed.html)$/.test(this._window.location.pathname);
	}

	/**
	 *  @returns `false` if a backend is intended to be used
	 */
	isStandalone() {
		return !this._configService.getValue('BACKEND_URL', false);
	}
}
