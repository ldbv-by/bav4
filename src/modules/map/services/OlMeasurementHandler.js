
export class OlMeasurementHandler {


	//this handler could be statefull

	/**
	 * Activates the Handler.
	 * @param {Map} olMap 
	 * @returns {VectorLayer} the olLayer which should be attached to
	 */
	// eslint-disable-next-line no-unused-vars
	activate(olMap) {

		//use the map to register event listener, interactions, etc
		//for development purposes you can attach the layer to the map here,
		//later, this will be done outside this handler

		return null;
	}


	/**
	 * Deactivates the Handler
	 *  @param {Map} olMap 
	 *  @param {VectorLayer} olLayer 
	 */
	// eslint-disable-next-line no-unused-vars
	deactivate(olMap, olLayer) {
		//use the map to unregister event listener, interactions, etc
		//olLayer currently undefined, will be fixed later
	}
}