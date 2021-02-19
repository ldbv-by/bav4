/**
 * MapEventHandler.
 * @class
 * @abstract
 */
export class OlMapEventHandler {

	constructor(id) {
		if (this.constructor === OlMapEventHandler) {
			// Abstract class can not be constructed.
			throw new TypeError('Can not construct abstract class.');
		}
		if (!id) {
			throw new TypeError('Id of this handler must be defined.');  
		}
		this._id = id;
	}
    
	get id() {
		return this._id;
	}

	/**
     * Activates this handler and creates an ol layer. The layer must not be added to the map.
     * @abstract
     * @param {Map} olMap
     */
	register(/*eslint-disable no-unused-vars */ map) {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #register or do not call super.activate from child.');
	}


}