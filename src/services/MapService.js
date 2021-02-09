import { $injector } from '../injection';

/**
* A function that provides map releated meta data
* {@link MapDefinitions}
*
* @typedef {function():(MapDefinitions)} mapDefinitionProvider
*/


/**
* Service for managing map releated meta data
*/
export class MapService {


	/**
	 * 
	 * @param {mapDefinitionProvider} provider 
	 */
	constructor(mapDefinitionProvider) {
		const { CoordinateService } = $injector.inject('CoordinateService');
		this._coordinateService = CoordinateService;
		this._definitionProvider = mapDefinitionProvider;
	}

	/**
	 * Internal srid of the map
	 * @returns {number} srid 
	 */
	getSrid() {
		return 3857;
	}

	/**
	 * Default SRID to use within the UI.
	 * @returns {number} srid 
	 */
	getDefaultSridForView() {
		return 4326;
	}

	/**
	 * Return the default extent of the map.
	 * @param {number}  srid 
	 * @returns {Extent} extent 
	 */
	getDefaultMapExtent(srid = 3857) {
		switch (srid) {
			case 3857:
				return this._definitionProvider().defaultExtent;
			case 4326:
				return this._coordinateService.toLonLatExtent(this._definitionProvider().defaultExtent);
		}
		throw new Error('Unsupported SRID ' + srid);
	}

}