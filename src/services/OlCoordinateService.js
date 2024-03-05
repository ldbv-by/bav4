/**
 * @module services/OlCoordinateService
 */
import { fromLonLat, toLonLat, transformExtent, transform } from 'ol/proj';
import { bvvStringifyFunction } from './provider/stringifyCoords.provider';
import { buffer, containsCoordinate } from 'ol/extent';
import { $injector } from '../injection';
import { getCoordinatesForElevationProfile } from '../modules/olMap/utils/olGeometryUtils';
import { LineString, Polygon } from '../../node_modules/ol/geom';
import { isCoordinate, isCoordinateLike } from '../utils/checks';
import { Geodesic, PolygonArea } from 'geographiclib-geodesic';

/**
 * A function that returns a string representation of a coordinate.
 * @typedef {Function} stringifyCoordProvider
 * @param {module:domain/coordinateTypeDef~Coordinate} coordinate
 * @param {module:domain/coordinateRepresentation~CoordinateRepresentation} coordinateRepresentation
 * @param {function} transformFn
 * @param {object} [options] optional parameters
 * @returns {String} the String representation
 */

/**
 * Enum which holds all valid path parameter keys.
 * @readonly
 * @enum {String}
 */
export const CoordinateSimplificationTarget = Object.freeze({
	ELEVATION_PROFILE: 'elevationProfile'
});

/**
 * Utilities methods for coordinates like transformation, ..., based on ol.
 * @class
 * @author taulinger
 */
export class OlCoordinateService {
	/**
	 *
	 * @param {stringifyCoordProvider} [stringifyFunction=bvvStringifyFunction]
	 */
	constructor(stringifyFunction = bvvStringifyFunction) {
		this._stringifyFunction = stringifyFunction;
		const { ProjectionService } = $injector.inject('ProjectionService');
		this._projectionService = ProjectionService;
	}

	/**
	 *
	 * @private
	 */
	static _toEpsgCodeString(srid) {
		return 'EPSG:' + srid;
	}

	/**
	 * Transforms a 3857 coordinate to longitude/latitude.
	 * @param {module:domain/coordinateTypeDef~Coordinate} coordinate3857
	 * @returns {module:domain/coordinateTypeDef~Coordinate} coordinate4326
	 */
	toLonLat(coordinate3857) {
		return toLonLat(coordinate3857);
	}

	/**
	 * Transforms a coordinate from longitude/latitude to 3857 coordinate
	 * @param {module:domain/coordinateTypeDef~Coordinate} coordinate4326
	 * @returns {module:domain/coordinateTypeDef~Coordinate} coordinate3857
	 */
	fromLonLat(coordinate4326) {
		return fromLonLat(coordinate4326);
	}

	/**
	 * Transforms an extent from 3857 to longitude/latitude
	 * @param {module:domain/extentTypeDef~Extent} extent3857
	 * @returns {module:domain/extentTypeDef~Extent} a new extent in 4326
	 */
	toLonLatExtent(extent3857) {
		return transformExtent(extent3857, 'EPSG:3857', 'EPSG:4326');
	}

	/**
	 * Transforms an extent from longitude/latitude to 3857
	 * @param {module:domain/extentTypeDef~Extent} extent4326
	 * @returns {module:domain/extentTypeDef~Extent} a new extent in 3857
	 */
	fromLonLatExtent(extent4326) {
		return transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
	}

	/**
	 * Transforms a coordinate in the source srid to a coordinate in the target srid
	 * @param {module:domain/coordinateTypeDef~Coordinate} coordinate
	 * @param {number} sourceSrid srid of the current coordinate
	 * @param {number} targetSrid srid of the transformed coordinate
	 * @returns {module:domain/coordinateTypeDef~Coordinate} transformed coordinate
	 */
	transform(coordinate, sourceSrid, targetSrid) {
		const targetSridAsString = OlCoordinateService._toEpsgCodeString(targetSrid);
		const sourceSridAsString = OlCoordinateService._toEpsgCodeString(sourceSrid);
		if (this._projectionService.getProjections().includes(targetSrid)) {
			return transform(coordinate, sourceSridAsString, targetSridAsString);
		}
		throw new Error('Unsupported SRID: ' + targetSrid);
	}

	/**
	 * Transforms an extent in the source srid to an extent in the target srid
	 * @param {module:domain/extentTypeDef~Extent}  extent
	 * @param {number} sourceSrid srid of the current coordinate
	 * @param {number} targetSrid srid of the transformed coordinate
	 * @returns {module:domain/extentTypeDef~Extent} a new transformed extent
	 */
	transformExtent(extent, sourceSrid, targetSrid) {
		const targetSridAsString = OlCoordinateService._toEpsgCodeString(targetSrid);
		const sourceSridAsString = OlCoordinateService._toEpsgCodeString(sourceSrid);
		if (this._projectionService.getProjections().includes(targetSrid)) {
			return transformExtent(extent, sourceSridAsString, targetSridAsString);
		}
		throw new Error('Unsupported SRID: ' + targetSrid);
	}

	/**
	 * Stringifies a coordinate.
	 * @param {module:domain/coordinateTypeDef~Coordinate} coordinate the coordinate (in map projection)
	 * @param {module:domain/coordinateRepresentation~CoordinateRepresentation} coordinateRepresentation the target CoordinateRepresentation
	 * @param {Object} [options] stringify function specific options
	 * @returns {string} stringified coordinate
	 */
	stringify(coordinate, coordinateRepresentation, options) {
		return this._stringifyFunction(
			coordinate,
			coordinateRepresentation,
			(coordinate, sourceSrid, targetSrid) => this.transform(coordinate, sourceSrid, targetSrid),
			options
		);
	}

	/**
	 * Returns an extent increased by the provided value.
	 * @param {module:domain/extentTypeDef~Extent} extend
	 * @param {number} value
	 * @returns {module:domain/extentTypeDef~Extent} new extent with the applied buffer
	 */
	buffer(extend, value) {
		return [...buffer(extend, value)];
	}

	/**
	 * Check if the passed coordinate is contained or on the edge of the extent.
	 * @param {module:domain/extentTypeDef~Extent} extent
	 * @param {module:domain/coordinateTypeDef~Coordinate} coordinate
	 */
	containsCoordinate(extent, coordinate) {
		return containsCoordinate(extent, coordinate);
	}

	/**
	 * Simplifies (reduces) an array of coordinates for a specified use case when needed.
	 * @param {Array<module:domain/coordinateTypeDef~Coordinate>} coordinates input coordinate
	 * @param {CoordinateSimplificationTarget} type the use case (type) of simplification
	 * @returns {Array<module:domain/coordinateTypeDef~Coordinate>} simplified coordinates
	 * @throws {Error} `Unsupported simplification type` or `Cannot simplify coordinate`
	 */
	simplify(coordinates, type) {
		const throwError = () => {
			throw new Error(`Cannot simplify coordinate, value is not a Coordinates type`);
		};

		if (!Array.isArray(coordinates)) {
			throwError();
		}
		coordinates.forEach((c) => {
			if (!isCoordinate(c)) {
				throwError();
			}
		});
		switch (type) {
			case CoordinateSimplificationTarget.ELEVATION_PROFILE:
				return getCoordinatesForElevationProfile(new LineString(coordinates));
		}

		throw new Error(`Unsupported simplification type: ${type}`);
	}

	/**
	 * Converts a single or array of {@link module:domain/coordinateTypeDef~CoordinateLike} to a single or array of {@link module:domain/coordinateTypeDef~Coordinate}.
	 * @param {Array<module:domain/coordinateTypeDef~CoordinateLike>|module:domain/coordinateTypeDef~CoordinateLike} coordinateLike single or array of `CoordinateLike`
	 * @returns {Array<module:domain/coordinateTypeDef~Coordinate>|module:domain/coordinateTypeDef~Coordinate} coordinates single  or array of `Coordinate`
	 * @throws {Error} `Cannot convert value to coordinate`
	 */
	toCoordinate(coordinateLike) {
		const throwError = () => {
			throw new Error(`Cannot convert value to coordinate, value is not a CoordinateLike type`);
		};

		if (!coordinateLike) {
			throwError();
		}
		// return empty array unchecked
		else if (Array.isArray(coordinateLike) && coordinateLike.length === 0) {
			return coordinateLike;
		}
		const singleValue = !Array.isArray(coordinateLike[0]);
		const coordinateLikeAsArray = singleValue ? [coordinateLike] : coordinateLike;

		coordinateLikeAsArray.forEach((c) => {
			if (!isCoordinateLike(c)) {
				throwError();
			}
		});
		const coordinates = coordinateLikeAsArray.map((c) => c.slice(0, 2));
		return singleValue ? coordinates[0] : coordinates;
	}

	/**
	 * Calculates the length of an array of coordinates.
	 *
	 * If the coordinates are in a local projection, then the extent specifies the valid
	 * frame for a planar length calculation. Otherwise the geodetic length will be calculated.
	 *
	 * Coordinates in a global projection will be always result in geodetic distances (spherical).
	 * @param {Array<module:domain/coordinateTypeDef~Coordinate>} coordinates input coordinates
	 * @param {number} [srid=3857] the srid number for the projection of the coordinates, default is SMERC (3857)
	 * @param {Extent} [extent] an extent in WGS84, which defines whether or not the coordinates (partially)
	 * outside this extent should be handled with geodesic(spherical) length calculation or
	 * with the planar calculation of the local projection
	 */
	getLength(coordinates, srid = 3857, extent = null) {
		const getGeodesicLength = (coordinates) => {
			const wgs84 = Geodesic.WGS84;
			return coordinates.reduce((sum, current, index, coordinates) => {
				if (index === coordinates.length - 1) {
					return sum;
				}
				const next = coordinates[index + 1];
				const r = wgs84.Inverse(current[1], current[0], next[1], next[0]);

				return sum + r.s12;
			}, 0);
		};
		const wgs84Coordinates =
			srid !== 4326 ? coordinates.map((c) => transform(c, OlCoordinateService._toEpsgCodeString(srid), 'EPSG:4326')) : coordinates;

		const isWithinProjectionExtent = extent
			? !wgs84Coordinates.some((coordinate) => {
					return !containsCoordinate(extent, coordinate);
				})
			: true;

		const isLocalProjection = ![4326, 3857].includes(srid);
		return isWithinProjectionExtent && isLocalProjection ? new LineString(coordinates).getLength() : getGeodesicLength(wgs84Coordinates);
	}

	/**
	 * Calculates the area for an array of polygon coordinates.
	 *
	 * If the coordinates are in a local projection, then the extent specifies the valid
	 * frame for a planar length calculation. Otherwise the geodetic area will be calculated.
	 *
	 * Coordinates in a global projection will be always result in geodetic calculation (spherical).
	 * @param {Array<Array<module:domain/coordinateTypeDef~Coordinate>>} coordinates polygon coordinates
	 * @param {number} [srid=3857] the srid number for the projection of the coordinates, default is SMERC (3857)
	 * @param {Extent} [extent=null] an extent in WGS84, which defines whether or not the coordinates should be handled
	 * with geodesic(spherical) length calculation (the coordinates are (partially) outside this extent)
	 * or with the planar calculation of the projection (the coordinates are (completely) inside this extent)
	 */
	getArea(coordinates, srid = 3857, extent = null) {
		const getGeodesicArea = (coordinates) => {
			const geodesicPolygon = new PolygonArea.PolygonArea(Geodesic.WGS84);
			return coordinates.reduce((aggregatedArea, linearRingCoordinates, index) => {
				geodesicPolygon.Clear();
				linearRingCoordinates.forEach(([lon, lat]) => geodesicPolygon.AddPoint(lat, lon));
				const res = geodesicPolygon.Compute(false, true);
				const isExteriorRing = index === 0;
				return isExteriorRing ? aggregatedArea + Math.abs(res.area) : aggregatedArea - Math.abs(res.area);
			}, 0);
		};

		const wgs84Coordinates =
			srid !== 4326
				? coordinates.map((linearRingCoordinates) =>
						linearRingCoordinates.map((c) => transform(c, OlCoordinateService._toEpsgCodeString(srid), 'EPSG:4326'))
					)
				: coordinates;

		// simplification: using only the outer ring to test against the extent;
		// If the outer ring is fully inside the extent, then all inner rings are as well.
		const isOuterRingWithinProjectionExtent = extent ? !wgs84Coordinates[0].some((coordinate) => !containsCoordinate(extent, coordinate)) : true;
		const isLocalProjection = ![4326, 3857].includes(srid);
		return isOuterRingWithinProjectionExtent && isLocalProjection ? new Polygon(coordinates).getArea() : getGeodesicArea(wgs84Coordinates);
	}
}
