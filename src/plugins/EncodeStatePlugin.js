/**
 * @module plugins/EncodeStatePlugin
 */
import { $injector } from '../injection';
import { observe } from '../utils/storeUtils';
import { debounced } from '../utils/timer';
import { BaPlugin } from './BaPlugin';

/**
 * Synchronizes the current state of the app by updating the history of the window or, when embedded as a web component, its attributes
 *
 * @class
 * @author taulinger
 */
export class EncodeStatePlugin extends BaPlugin {
	#environmentService;
	#shareService;
	#debouncedUpdateHistoryFn = debounced(EncodeStatePlugin.DEBOUNCED_DELAY_MS, () => this._updateHistory());
	constructor() {
		super();
		const { EnvironmentService: environmentService, ShareService: shareService } = $injector.inject('EnvironmentService', 'ShareService');
		this.#environmentService = environmentService;
		this.#shareService = shareService;
	}

	/**
	 * @override
	 */
	async register(store) {
		if (!this.#environmentService.isEmbedded()) {
			const updateHistory = () => {
				this.#debouncedUpdateHistoryFn();
			};

			observe(store, (state) => state.stateForEncoding.changed, updateHistory);
		}
	}

	_updateHistory() {
		const encodedState = this.#shareService.encodeState();
		this.#environmentService.getWindow().history.replaceState(null, '', encodedState);
	}

	static get DEBOUNCED_DELAY_MS() {
		return 200;
	}
}
