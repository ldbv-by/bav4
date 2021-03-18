/**
* Abstract base class for all BaObserver.
* Beside {@link BaElement},  BaObserver are a second important place for structuring code and logic. 
* As they are connected to the central redux store, they are responsible for setting initial state or reacting
* on state changes during the runtime of the app. In contrast to BaElement, they often act on a higher abstraction level,
* managing global state being consumed by different BaElements implementations afterwards.
* <br>
* Observers must implement {@link BaObserver#register}, which is called by the global {@link StoreService}
* after all dependency injection is done.
* 
* @abstract
* @class
* @author aul
*/
export class BaObserver {


	constructor() {
		if (this.constructor === BaObserver) {
			// Abstract class can not be constructed.
			throw new Error('Can not construct abstract class.');
		}
	}


	/**
	* Called by the global StoreService after injector is marked as ready.
	* @abstract
	* @public
	* @param {Store} store the redux store
	*/
	async register(/*eslint-disable no-unused-vars */store) {
		// The child has not implemented this method.
		throw new Error('Please implement abstract method #register or do not call super.register from child.');
	}

}