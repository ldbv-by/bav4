/**
 * @module plugins/PublicWebComponentPlugin
 */
import { QueryParameters } from '../domain/queryParameters';
import { $injector } from '../injection/index';
import { changeZoom } from '../store/position/position.action';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 *
 *  This Plugin is the counterpart to the {@link PublicWebComponent}.
 *
 * - receives messages from the PublicWebComponent
 * - publishes dedicated s-o-s mutations to the PublicWebComponent
 *
 * @class
 * @author taulinger
 */
export class PublicWebComponentPlugin extends BaPlugin {
	#environmentService;

	constructor() {
		super();
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this.#environmentService = environmentService;
		this._disabledBroadcasting = false;
	}

	_getIframeId() {
		return this.#environmentService.getWindow().name;
	}

	_broadcast(payload) {
		if (!this._disabledBroadcasting) {
			this.#environmentService.getWindow().parent.postMessage({ target: this._getIframeId(), v: '1', ...payload }, '*');
		}
	}

	/**
	 * @override
	 */
	async register(store) {
		if (this.#environmentService.isEmbeddedAsWC()) {
			const onReceive = (event) => {
				switch (event.data.v) {
					case '1': {
						if (event.data.source === this._getIframeId()) {
							this._disabledBroadcasting = true;
							for (const property in event.data) {
								switch (property) {
									case QueryParameters.ZOOM:
										changeZoom(event.data[property]);
								}
							}
							this._disabledBroadcasting = false;
						}
						break;
					}
					default:
						console.error(`Version ${event.data.v} is not supported`);
				}
			};

			window.parent.addEventListener('message', onReceive);

			const onZoomChanged = (zoom) => {
				const payload = {};
				payload[QueryParameters.ZOOM] = zoom;
				this._broadcast(payload);
			};

			observe(store, (state) => state.position.zoom, onZoomChanged);
		}
	}
}
