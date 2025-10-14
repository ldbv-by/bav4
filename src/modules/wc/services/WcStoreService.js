/**
 * @module modules/wc/services/WcStoreService
 */
import { createStore } from 'redux';

/**
 * Service which configures, initializes and holds the redux store for the PublicWebComponent.
 *
 * @class
 * @author taulinger
 */
export class WcStoreService {
	constructor() {
		this._store = createStore((state) => state, {});
	}

	/**
	 * Returns the fully initialized store.
	 */
	getStore() {
		return this._store;
	}
}
