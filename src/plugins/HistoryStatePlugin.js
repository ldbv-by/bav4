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
		this._currentEncodedState = null;
	}

	/**
	 * @override
	 */
	async register(store) {

		if (!this._environmentService.isEmbedded()) {

			const updateHistory = () => {
				this._updateHistory();
			};

			observe(store, state => state.position.zoom, updateHistory);
			observe(store, state => state.position.center, updateHistory);
			observe(store, state => state.position.rotation, updateHistory);
			observe(store, state => state.layers.active, updateHistory);
			setTimeout(updateHistory, 0);
		}
	}

	_updateHistory() {
		const encodedState = this._shareService.encodeState();
		if (this._currentEncodedState !== encodedState) {
			this._environmentService.getWindow().history.replaceState(null, '', encodedState);
			this._currentEncodedState = encodedState;
		}
	}
}
