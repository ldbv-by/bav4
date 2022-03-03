/**
 * @module service/provider
 */
import { $injector } from '../../injection';

/**
 * Map related meta data
 * @typedef {Object} MapDefinitions
 * @property {Extent} defaultExtent
 * @property {number} srid internal SRID of the map
 * @property {number} defaultSridForView default SRID in which coordinates should be displayed within the UI
 * @property {function(Coordinate):(Array<SridDefinition>)} sridDefinitionsForView function which can take a coordinate and returns an array of SridDefinition
 * @property {number} defaultGeodeticSrid default SRID for geodetic tasks
 * @property {number} maxZoomLevel the max. zoom level the map should support
 */

/**
 * Meta data for a srid
 * @typedef {Object} SridDefinition
 * @property {string} label label
 * @property {number} code srid
 * @property {number} digits decimal places for rounding
 */

/**
 * Provider for map releated meta data
 * @function
 * @returns {MapDefinitions} meta data
 */
export const getBvvMapDefinitions = () => {
	return {
		defaultExtent: [995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462],
		srid: 3857,
		defaultSridForView: 25832,
		sridDefinitionsForView: getBvvSridDefinitionsForView,
		defaultGeodeticSrid: 25832,
		maxZoomLevel: 19
	};
};

const getBvvSridDefinitionsForView = (coordinateInMapProjection) => {
	const definitions = [{ label: 'UTM', code: 25832, digits: 0 }, { label: 'WGS84', code: 4326, digits: 5 }];
	if (coordinateInMapProjection) {

		const { CoordinateService: coordinateService } = $injector.inject('CoordinateService');
		//BVV uses 3857
		const coord4326 = coordinateService.toLonLat(coordinateInMapProjection);

		if (coord4326[0] > 18 || coord4326[0] < 6) {
			return [definitions.pop()];
		}
		else if (coord4326[0] < 18 && coord4326[0] >= 12) {
			definitions.splice(0, 0, { label: 'UTM', code: 25833, digits: 0 });
		}

	}
	return definitions;
};
