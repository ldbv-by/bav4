/**
 * MapEventHandler.
 * @class
 * @abstract
 */
export class OlMapHandler {
	constructor(id) {
		if (this.constructor === OlMapHandler) {
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
	 * Registers this handler.
	 * @abstract
	 * @param {Map} olMap
	 */
	register(/*eslint-disable no-unused-vars */ map) {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #register or do not call super.activate from child.');
	}
}
