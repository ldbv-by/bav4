/**
 * @module plugins/SynchronizeStatePlugin
 */
import { $injector } from '../injection';
import { PublicComponent } from '../modules/public/components/PublicComponent';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * Synchronizes the current state of the app by updating the history of the window or, when embedded as a web component, its the attributes
 *
 * @class
 * @author taulinger
 */
export class SynchronizeStatePlugin extends BaPlugin {
	constructor() {
		super();
		const { EnvironmentService: environmentService, ShareService: shareService } = $injector.inject('EnvironmentService', 'ShareService');
		this._environmentService = environmentService;
		this._shareService = shareService;
	}

	/**
	 * @override
	 */
	async register(store) {
		if (!this._environmentService.isEmbedded()) {
			const updateHistory = () => {
				this._updateHistory();
			};

			observe(store, (state) => state.stateForEncoding.changed, updateHistory);
		} else if (this._environmentService.isEmbeddedAsWC()) {
			const updateWcAttributes = () => {
				this._updateWcAttributes();
			};

			observe(store, (state) => state.stateForEncoding.changed, updateWcAttributes);
		}
	}

	_updateHistory() {
		const encodedState = this._shareService.encodeState();
		this._environmentService.getWindow().history.replaceState(null, '', encodedState);
	}
	_updateWcAttributes() {
		const params = new URLSearchParams(new URL(this._shareService.encodeState()).search);
		for (const [key, value] of params) {
			this._environmentService.getWindow().document.querySelector(PublicComponent.tag).setAttribute(key, value);
		}
	}
}
