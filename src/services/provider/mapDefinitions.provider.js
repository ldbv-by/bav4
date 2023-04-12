/**
 * @module service/provider
 */
import { CoordinateRepresentations } from '../../domain/coordinateRepresentation';
import { $injector } from '../../injection';

/**
 * Map related meta data
 * @typedef {Object} MapDefinitions
 * @property {Extent} defaultExtent default extent of the map
 * @property {number} minZoomLevel the minimal zoom level the map should support
 * @property {number} maxZoomLevel the maximal zoom level the map should support
 * @property {number} srid the internal SRID of the map
 * @property {number} localProjectedSrid the SRID of the supported local projected system
 * @property {Extent} localProjectedSridExtent the extent of the local supported projected system
 * @property {function(Coordinate):(Array<CoordinateRepresentation>)} localProjectedSridDefinitionsForView function which can take a coordinate and returns an array of CoordinateRepresentations
 * @property {Array<CoordinateRepresentation>} globalSridDefinitionsForView array of global CoordinateRepresentations
 */

/**
 * Provider for map releated meta data
 * @function
 * @returns {MapDefinitions} BVV specific MapDefinitions
 */
export const getBvvMapDefinitions = () => {
	return {
		defaultExtent: [995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462],
		minZoomLevel: 0,
		maxZoomLevel: 20,
		srid: 3857,
		localProjectedSrid: 25832,
		localProjectedSridExtent: [5, -80, 14, 80],
		localProjectedCoordinateRepresentations: getBvvLocalProjectedCoordinateRepresentations,
		globalCoordinateRepresentations: [CoordinateRepresentations.UTM, CoordinateRepresentations.WGS84, CoordinateRepresentations.MGRS],
		defaultSridForView: 25832
	};
};

const getBvvLocalProjectedCoordinateRepresentations = (coordinateInMapProjection) => {
	const definitions = [{ label: 'UTM32', code: 25832, digits: 0, global: false, type: 'utm' }, CoordinateRepresentations.WGS84];
	if (coordinateInMapProjection) {
		const { CoordinateService: coordinateService } = $injector.inject('CoordinateService');
		//BVV uses 3857
		const coord4326 = coordinateService.toLonLat(coordinateInMapProjection);

		if (coord4326[0] > 18 || coord4326[0] < 6) {
			return [definitions.pop()];
		} else if (coord4326[0] < 18 && coord4326[0] >= 12) {
			definitions.splice(0, 0, { label: 'UTM33', code: 25833, digits: 0, global: false, type: 'utm' });
		}
	}
	return definitions;
};
