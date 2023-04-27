/**
 * @module plugins/HistoryStatePlugin
 */
import { $injector } from '../injection';
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
		}
	}

	_updateHistory() {
		const encodedState = this._shareService.encodeState();
		this._environmentService.getWindow().history.replaceState(null, '', encodedState);
	}
}
