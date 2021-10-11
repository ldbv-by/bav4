/**
* Abstract base class for all BaPlugins.
* `BaPlugins` implementations are a second important place for structuring code and logic.
* In contrast to components, they often act on a higher abstraction level,
* managing global state being consumed by different components afterward.
* For example, they could be responsible for setting an initial state or reacting to global state changes during the runtime of the app.
* <br>
* StorePlugins must implement {@link BaPlugin#register}, which is called by the global {@link StoreService}
* after all dependency injection is done.
*
* @abstract
* @class
* @author taulinger
*/
export class BaPlugin {


	constructor() {
		if (this.constructor === BaPlugin) {
			// Abstract class can not be constructed.
			throw new Error('Can not construct abstract class.');
		}
	}


	/**
	* Called by the global StoreService after injector is marked as ready.
	* <br>
	* Returns a promise when registration is complete. It's up to the implementation to
	* decide about the payload of the resolved promise.
	* @abstract
	* @public
	* @param {Store} store the redux store
	* @returns {Promise<?>}
	*/
	async register(/*eslint-disable no-unused-vars */store) {
		// The child has not implemented this method.
		throw new Error('Please implement abstract method #register or do not call super.register from child.');
	}

}
