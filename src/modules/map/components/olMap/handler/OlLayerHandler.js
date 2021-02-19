/**
 * LayerHandler create an ol layer and can interact with the ol map (e.g. register interactions)
 * @class
 * @abstract
 */
export class OlLayerHandler {

	/**
	 * 
	 * @param {string} id Id for this handler, which will be also the id of the layer created by this handler
	 */
	constructor(id) {
		if (this.constructor === OlLayerHandler) {
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
     * @returns {BaseLayer} olLayer the layer which shoud be added to the map
     */
	activate(/*eslint-disable no-unused-vars */ map) {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #activate or do not call super.activate from child.');
	}

	/**
     *  Deactivates this handler. The corresponding layer is already remove from the map.
     * @abstract
     * @param {Map} olmap 
     */
	deactivate(/*eslint-disable no-unused-vars */ map) {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #deactivate or do not call super.deactivate from child.');
	}

}