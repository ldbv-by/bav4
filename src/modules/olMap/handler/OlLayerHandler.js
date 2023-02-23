/**
 * Configuration for a layer handler
 * @typedef {Object} LayerHandlerOptions
 * @property {boolean} [preventDefaultClickHandling=true]  `true` if default click event handling on map should be disabled
 * @property {boolean} [preventDefaultContextClickHandling=true]  `true` if default context click event handling on map should be disabled
 */

export const getDefaultLayerOptions = () => ({ preventDefaultClickHandling: true, preventDefaultContextClickHandling: true });

/**
 * LayerHandler create an ol layer and can interact with the ol map (e.g. register interactions)
 * @class
 * @abstract
 * @author taulinger
 */
export class OlLayerHandler {
	/**
	 *
	 * @param {string} id Id for this handler, which will be also the id of the layer created by this handler
	 * @param {LayerHandlerOptions} [options] Optional configuration for this handler
	 */
	constructor(id, options = {}) {
		if (this.constructor === OlLayerHandler) {
			// Abstract class can not be constructed.
			throw new TypeError('Can not construct abstract class.');
		}
		if (!id) {
			throw new TypeError('Id of this handler must be defined.');
		}
		this._id = id;
		this._active = false;
		this._options = { ...getDefaultLayerOptions(), ...options };
	}

	get id() {
		return this._id;
	}

	get active() {
		return this._active;
	}

	get options() {
		return this._options;
	}

	/**
	 * Activates this handler and creates an ol layer.
	 * @param {Map} olMap
	 * @returns {BaseLayer} olLayer the layer which shoud be added to the map
	 */
	activate(map) {
		const layer = this.onActivate(map);
		this._active = true;
		return layer;
	}

	/**
	 *  Deactivates this handler.
	 * @param {Map} olmap
	 */
	deactivate(map) {
		this.onDeactivate(map);
		this._active = false;
	}

	/**
	 * Callback called when this handler is activated. Creates an ol layer. The layer must not be added to the map.
	 * @abstract
	 * @protected
	 * @param {Map} olMap
	 * @returns {BaseLayer} olLayer the layer which shoud be added to the map
	 */
	onActivate(/*eslint-disable no-unused-vars */ map) {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #onActivate or do not call super.onActivate from child.');
	}

	/**
	 * Callback called when this handler is deactivated. The corresponding layer is already removed from the map.
	 * @abstract
	 * @protected
	 * @param {Map} olmap
	 */
	onDeactivate(/*eslint-disable no-unused-vars */ map) {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #onDeactivate or do not call super.onDeactivate from child.');
	}
}
