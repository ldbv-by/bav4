/**
 * @module services/provider/mapDefinitions_provider
 */
import { BvvCoordinateRepresentations, GlobalCoordinateRepresentations } from '../../domain/coordinateRepresentation';
import { $injector } from '../../injection';

/**
 * BVV specific implementation of {@link module:services/MapService~mapDefinitionProvider}
 * @function
 * @type {module:services/MapService~mapDefinitionProvider}
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
		globalCoordinateRepresentations: [
			GlobalCoordinateRepresentations.WGS84,
			GlobalCoordinateRepresentations.UTM,
			GlobalCoordinateRepresentations.MGRS,
			GlobalCoordinateRepresentations.SphericalMercator
		]
	};
};

const getBvvLocalProjectedCoordinateRepresentations = (coordinateInMapProjection) => {
	const definitions = [
		GlobalCoordinateRepresentations.WGS84,
		BvvCoordinateRepresentations.UTM32,
		GlobalCoordinateRepresentations.MGRS,
		BvvCoordinateRepresentations.GK4,
		GlobalCoordinateRepresentations.SphericalMercator
	];
	if (coordinateInMapProjection) {
		const { CoordinateService: coordinateService } = $injector.inject('CoordinateService');
		const coord4326 = coordinateService.toLonLat(coordinateInMapProjection);

		if (coord4326[0] > 18 || coord4326[0] < 6 || coord4326[1] > 54 || coord4326[1] < 42) {
			/**
			 * The BVV localProjectedSridExtent defines slightly other western / eastern boundaries than the UTM32 and UTM33 zones.
			 * Here we have to be strict an we replace the local UTM32 CoordinateRepresentation by the global UTM CoordinateRepresentation
			 * when we are over the particular zone boundary.
			 * The northern / southern boundary is limited to zone band "U" / "T".
			 */
			return [
				GlobalCoordinateRepresentations.WGS84,
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.MGRS,
				GlobalCoordinateRepresentations.SphericalMercator
			];
		}
		if (coord4326[0] < 18 && coord4326[0] >= 12) {
			definitions.splice(1, 0, BvvCoordinateRepresentations.UTM33);
		}
	}
	return definitions;
};
