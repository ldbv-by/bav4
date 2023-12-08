/**
 * @module plugins/ObserveStateForEncodingPlugin
 */
import { $injector } from '../injection';
import { indicateChange } from '../store/stateForEncoding/stateForEncoding.action';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * Observes all slices-of-state that are relevant for state encoding and indicates their changes.
 * @class
 * @author taulinger
 */
export class ObserveStateForEncodingPlugin extends BaPlugin {
	constructor() {
		super();
		const { ShareService: shareService } = $injector.inject('ShareService');
		this._shareService = shareService;
		this._currentEncodedState = null;
	}

	/**
	 * @override
	 */
	async register(store) {
		const updateStore = () => {
			this._updateStore();
		};

		observe(store, (state) => state.position.zoom, updateStore);
		observe(store, (state) => state.position.center, updateStore);
		observe(store, (state) => state.position.rotation, updateStore);
		observe(store, (state) => state.layers.active, updateStore);
		observe(store, (state) => state.routing.waypoints, updateStore);
		observe(store, (state) => state.routing.categoryId, updateStore);
		setTimeout(updateStore, 0);
	}

	_updateStore() {
		const encodedState = this._shareService.encodeState();
		if (this._currentEncodedState !== encodedState) {
			// update store
			indicateChange();
			this._currentEncodedState = encodedState;
		}
	}
}
