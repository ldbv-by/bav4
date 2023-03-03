import { $injector } from '../injection';
import { IFRAME_ENCODED_STATE } from '../utils/markup';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * Checks if a surrounding iframe exists and contains the {@link IFRAME_ENCODED_STATE } data-attribute.
 * If so, it updates the attributes value on state changes. Currently only one surrounding iframe is supported.
 * @class
 * @author taulinger
 */
export class IframeStatePlugin extends BaPlugin {
	constructor() {
		super();
		const { EnvironmentService: environmentService, ShareService: shareService } = $injector.inject('EnvironmentService', 'ShareService');
		this._environmentService = environmentService;
		this._shareService = shareService;
		this._currentEncodedState = null;
	}

	/**
	 * @override
	 */
	async register(store) {
		if (this._environmentService.isEmbedded()) {
			const update = () => {
				this._updateAttribute();
			};

			observe(store, (state) => state.position.zoom, update);
			observe(store, (state) => state.position.center, update);
			observe(store, (state) => state.position.rotation, update);
			observe(store, (state) => state.layers.active, update);
			setTimeout(update, 0);
		}
	}

	_updateAttribute() {
		const encodedState = this._shareService.encodeState();
		if (this._currentEncodedState !== encodedState) {
			this._findIframe()?.setAttribute(IFRAME_ENCODED_STATE, encodedState);
			this._currentEncodedState = encodedState;
		}
	}

	_findIframe() {
		return this._environmentService.getWindow().parent.document.querySelector(`iframe[${IFRAME_ENCODED_STATE}]`);
	}
}
