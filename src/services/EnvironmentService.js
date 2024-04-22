/**
 * @module services/EnvironmentService
 */
import { QueryParameters } from '../domain/queryParameters';
import { $injector } from '../injection';
import { PublicComponent } from '../modules/public/components/PublicComponent';

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
	 * Returns the current query parameters. May retrieve the "query parameters" from the attributes of an embedded web component
	 * @returns the current `URLSearchParams`
	 */
	getQueryParams() {
		if (this.isEmbeddedAsWC()) {
			const element = this._window.document.querySelector(PublicComponent.tag);
			const attrNames = element.getAttributeNames();

			const usp = new URLSearchParams();
			attrNames
				.filter((n) => Object.values(QueryParameters).includes(n))
				.forEach((n) => {
					usp.set(n, element.getAttribute(n));
				});

			return usp;
		}
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
		return this._window.matchMedia('(pointer:coarse)').matches && this._window.matchMedia('(hover:none)').matches;
	}

	/**
	 * @returns `true` if the primary pointing device is a mouse / touch pad device
	 */
	isMouse() {
		return this._window.matchMedia('(pointer:fine)').matches && this._window.matchMedia('(hover:hover)').matches;
	}

	/**
	 * @returns `true` if the primary pointing device is a touch device but it has also a mouse or pencil as a secondary device
	 */
	isTouchWithMouseSupport() {
		return this._window.matchMedia('(any-pointer:fine)').matches && this._window.matchMedia('(pointer:coarse)').matches;
	}

	/**
	 * @returns if the primary pointing device is a mouse device but it has also a touch device as a secondary device
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
		return /(\/embed[/]?(index.html)?|embed.html)$/.test(this._window.location.pathname);
	}

	/**
	 *
	 * @returns `true` if we are in embedded due to a Web Component
	 */
	isEmbeddedAsWC() {
		return !!this._window.customElements.get(PublicComponent.tag);
	}

	/**
	 *  @returns `true` if a backend is not configured
	 */
	isStandalone() {
		return !this._configService.getValue('BACKEND_URL', false);
	}
}
