/**
 * @module plugins/HistoryStatePlugin
 */
import { $injector } from '../injection';
import { BvvComponent } from '../modules/wc/components/BvvComponent';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * @class
 * @author taulinger
 */
export class HistoryStatePlugin extends BaPlugin {
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
			this._environmentService.getWindow().document.querySelector(BvvComponent.tag).setAttribute(key, value);
		}
	}
}
