import { $injector } from '../injection';
import { calc3857MapResolution } from '../utils/mapUtils';
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
* @author taulinger
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
	getDefaultMapExtent(srid = this.getSrid()) {
		switch (srid) {
			case 3857:
				return this._definitions.defaultExtent;
			case 4326:
				return this._coordinateService.toLonLatExtent(this._definitions.defaultExtent);
		}
		throw new Error('Unsupported SRID ' + srid);
	}

	/**
	 * Return the max. zoom level the map supports
	 * @returns {Number} zoom level
	 */
	getMaxZoomLevel() {
		return this._definitions.maxZoomLevel;
	}

	/**
	 * Returns the minimal angle in radians when rotation of the map should be accepted and applied.
	 * @returns threshold value for rotating the map in radians.
	 */
	getMinimalRotation() {
		return .05;
	}

	/**
	 * Calculates the resolution at a specific degree of latitude in meters per pixel.
	 * @param {number} zoom  Zoom level to calculate resolution at
	 * @param {Coordinate} [coordinate] Coordinate to calculate resolution at (required for non-geodetic map projections like `3857`)
	 * @param {number} [srid] Spatial Reference Id. Default is `3857`
	 * @param {number} [tileSize] tileSize The size of the tiles in the tile pyramid. Default is `256`
	 */
	calcResolution(zoom, coordinateInMapProjection = null, srid = this.getSrid(), tileSize = 256) {
		switch (srid) {
			case 3857:
				if (!coordinateInMapProjection) {
					throw new Error(`Parameter 'coordinateInMapProjection' must not be Null when using SRID ${srid}`);
				}
				return calc3857MapResolution(this._coordinateService.toLonLat(coordinateInMapProjection)[1], zoom, tileSize);
		}
		throw new Error(`Unsupported SRID ${srid}`);
	}

	/**
	 * Returns an HTMLElement acting as a container for a scale line component.
	 * @returns {HTMLElement|null} element or `null`;
	 */
	getScaleLineContainer() {
		const element = document.querySelector('ba-footer')?.shadowRoot.querySelector('.scale');
		return element ?? null;
	}
}
