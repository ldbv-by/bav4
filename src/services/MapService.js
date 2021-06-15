import { $injector } from '../injection';
import { getBvvMapDefinitions } from './provider/mapDefinitions.provider';

/**
* A function that provides map releated meta data
* {@link MapDefinitions}
*
* @typedef {function():(MapDefinitions)} mapDefinitionProvider
*/


/**
* Service for managing map related meta data.
* @class
*/
export class MapService {


	/**
	 * 
	 * @param {mapDefinitionProvider} [provider=getBvvMapDefinitions]
	 */
	constructor(mapDefinitionProvider = getBvvMapDefinitions) {
		const { CoordinateService } = $injector.inject('CoordinateService');
		this._coordinateService = CoordinateService;
		this._definitions = mapDefinitionProvider();
	}

	/**
	 * Internal srid of the map
	 * @returns {number} srid 
	 */
	getSrid() {
		return this._definitions.srid;
	}

	/**
	 * Default SRID suitable for the UI.
	 * @returns {number} srid 
	 */
	getDefaultSridForView() {
		return this._definitions.defaultSridForView;
	}

	/**
	 * Returns a list with all SridDefinition suitable for the UI. When a coordinate is provided, the list contains
	 * suitable SridDefinition regarding this coordinate.
	 * @param {Coordinate} [coordinateInMapProjection] - coordinate in map projection
	 * @returns {Array<SridDefinition>} srids
	 */
	getSridDefinitionsForView(coordinateInMapProjection) {
		return this._definitions.sridDefinitionsForView(coordinateInMapProjection);
	}

	/**
	 * Default SRID for geodatic tasks.
	 * @returns {number} srid 
	 */
	getDefaultGeodeticSrid() {
		return this._definitions.defaultGeodeticSrid;
	}

	/**
	 * Return the default extent of the map.
	 * @param {number}  srid 
	 * @returns {Extent} extent 
	 */
	getDefaultMapExtent(srid = 3857) {
		switch (srid) {
			case 3857:
				return this._definitions.defaultExtent;
			case 4326:
				return this._coordinateService.toLonLatExtent(this._definitions.defaultExtent);
		}
		throw new Error('Unsupported SRID ' + srid);
	}

	/**
	 * Returns the minimal angle in radians when rotation of the map should be accepted and applied.
	 * @returns threshold value for rotating the map in radians.
	 */
	getMinimalRotation() {
		return .05;
	}

}