/**
 * @module modules/olMap/utils/olGeometryUtils
 */
import { Geodesic, PolygonArea } from 'geographiclib-geodesic';
import { containsCoordinate } from 'ol/extent';
import { Point, LineString, Polygon, LinearRing, Circle, MultiLineString, Geometry } from 'ol/geom';
import { isNumber } from '../../../utils/checks';

const EPSG_WGS84 = 'EPSG:4326';

const transformGeometry = (geometry, fromProjection, toProjection) => {
	if (fromProjection && toProjection) {
		return geometry.clone().transform(fromProjection, toProjection);
	}
	return geometry;
};

/**
 * Coerce the provided geometry to a LineString or null,
 * if the geometry is not a LineString,LinearRing or Polygon
 * @function
 * @param {Geometry} geometry the geometry to coerce to LineString
 * @returns {Geometry | null} the coerced LineString or null
 */
export const getLineString = (geometry) => {
	if (geometry instanceof LineString) {
		return geometry;
	} else if (geometry instanceof LinearRing) {
		return new LineString(geometry.getCoordinates());
	} else if (geometry instanceof Polygon) {
		return new LineString(geometry.getCoordinates(false)[0]);
	} else if (geometry instanceof MultiLineString) {
		return geometry.getLineStrings().length === 1 ? geometry.getLineStrings()[0] : multiLineStringToLineString(geometry);
	}
	return null;
};

/**
 * @function
 * @param {MultiLineString} multiLineString
 * @returns {LineString} ol LineString
 */
export const multiLineStringToLineString = (multiLineString) => {
	if (!(multiLineString instanceof MultiLineString)) {
		return multiLineString;
	}

	const isConnected = (a, b) => {
		const last = a.getLastCoordinate();
		const first = b.getFirstCoordinate();
		return last[0] === first[0] && last[1] === first[1];
	};

	const lineStrings = multiLineString.getLineStrings();
	let coordinates = [];
	for (let i = 0; i < lineStrings.length; i++) {
		const current = lineStrings[i];
		const next = lineStrings[i + 1];

		if (!next || isConnected(current, next)) {
			coordinates = coordinates.concat(current.getCoordinates());
		} else {
			// LineStrings are not connected.
			coordinates.length = 0;
			break;
		}
	}
	return coordinates.length === 0 ? multiLineString : new LineString(coordinates);
};

/**
 * Creates a polygon from an extent
 * @function
 * @param {Extent} extent the extent, which should be converted to a Polygon
 * @returns {Geometry|null} the polygon representing the extent or `null`
 */
export const getPolygonFrom = (extent) => {
	if (!Array.isArray(extent) || extent.length !== 4) {
		return null;
	}

	const [minx, miny, maxx, maxy] = extent;
	return new Polygon([
		[
			[minx, maxy],
			[maxx, maxy],
			[maxx, miny],
			[minx, miny],
			[minx, maxy]
		]
	]);
};

/**
 * Creates a bounding box from a coordinate and size object
 * (with height- and width-property)
 * @function
 * @param {Coordinate} centerCoordinate
 * @param {Object} size the size object with a height- and a width-property
 * @returns {Array<Number>} the bounding box array in the form of [minX, minY, maxX, maxY]
 */
export const getBoundingBoxFrom = (centerCoordinate, size) => {
	if (!centerCoordinate || !size) {
		return undefined;
	}

	if (!isNumber(size.width) || !isNumber(size.height)) {
		return undefined;
	}

	return [
		centerCoordinate[0] - size.width / 2, // minX
		centerCoordinate[1] - size.height / 2, // minY
		centerCoordinate[0] + size.width / 2, // maxX
		centerCoordinate[1] + size.height / 2 // maxY
	];
};

/**
 * Contains information for transformation-methods
 * @typedef CalculationHints
 * @property {string} fromProjection the 'source' ProjectionLike-object for usage in ol/geometry.transform() as String like 'EPSG:3875'
 * @property {string} toProjection the 'destination' ProjectionLike-object for usage in ol/geometry.transform() as String like 'EPSG:3875'
 * @property {Extent} [toProjectionExtent] an extent in WGS84, which defines whether or not a geometry with coordinates outside this extent should be handled
 */

/**
 * Calculates the area of the geometry.
 * @function
 * @param {Geometry} geometry the area-like geometry, to calculate with
 * @param {module:modules/olMap/utils/olGeometryUtils~CalculationHints} calculationHints calculationHints for a optional transformation
 * @returns {number} the calculated length or 0 if the geometry-object is not area-like
 */
export const getArea = (geometry, calculationHints = {}) => {
	if (!(geometry instanceof Polygon) && !(geometry instanceof Circle) && !(geometry instanceof LinearRing)) {
		return 0;
	}

	const wgs84Geometry = transformGeometry(geometry, calculationHints.fromProjection, EPSG_WGS84);
	const wgs84LineString = getLineString(wgs84Geometry);

	const getLength = (geometry, calculationHints) => {
		const calculationGeometry = transformGeometry(geometry, calculationHints.fromProjection, calculationHints.toProjection);
		return calculationGeometry.getArea();
	};

	const isWithinProjectionExtent = calculationHints.toProjectionExtent
		? !wgs84LineString.getCoordinates().some((coordinate) => !containsCoordinate(calculationHints.toProjectionExtent, coordinate))
		: true;
	return isWithinProjectionExtent ? getLength(geometry, calculationHints) : getGeodesicArea(wgs84Geometry);
};

/**
 * Calculates the length of the geometry.
 * If the calculationHints provides a toProjectionExtent, any provided geometry with coordinates outside this extent
 * results in a calculation of a geodesic length, instead of a length in the provided toProjection.
 * @function
 * @param {Geometry} geometry the geometry, to calculate with
 * @param {module:modules/olMap/utils/olGeometryUtils~CalculationHints} calculationHints calculationHints for a optional transformation
 * @returns {number} the calculated length or 0 if the geometry-object is not a LineString/LinearRing/Polygon
 */
export const getGeometryLength = (geometry, calculationHints = {}) => {
	if (geometry) {
		const wgs84Geometry = transformGeometry(geometry, calculationHints.fromProjection, EPSG_WGS84);
		const wgs84LineString = getLineString(wgs84Geometry);

		const getLength = (geometry, calculationHints) => {
			const calculationGeometry = transformGeometry(geometry, calculationHints.fromProjection, calculationHints.toProjection);
			const lineString = getLineString(calculationGeometry);
			return lineString.getLength();
		};

		if (wgs84LineString) {
			const isWithinProjectionExtent = calculationHints.toProjectionExtent
				? !wgs84LineString.getCoordinates().some((coordinate) => !containsCoordinate(calculationHints.toProjectionExtent, coordinate))
				: true;
			return isWithinProjectionExtent ? getLength(geometry, calculationHints) : getGeodesicLength(wgs84LineString);
		}
	}
	return 0;
};

/**
 * Calculates the geodesic length of a geometry
 * @function
 * @param {LineString} wgs84LineString the LineString (in WGS84), to calculate with
 * @returns {number} the calculated length or 0 if the geometry-object is not a LineString/LinearRing/Polygon
 */
const getGeodesicLength = (wgs84LineString) => {
	const geodesicPolygon = new PolygonArea.PolygonArea(Geodesic.WGS84, true);
	for (const [lon, lat] of wgs84LineString.getCoordinates()) {
		geodesicPolygon.AddPoint(lat, lon);
	}
	const res = geodesicPolygon.Compute(false, true);
	return res.perimeter;
};

/**
 * Calculates the geodesic area of a geometry
 * @function
 * @param {Polygon} wgs84Polygon the Polygon (in WGS84), to calculate with
 * @returns {number} the calculated area or 0 if the geometry-object is not a Polygon
 */
const getGeodesicArea = (wgs84Polygon) => {
	const geodesicPolygon = new PolygonArea.PolygonArea(Geodesic.WGS84);
	return wgs84Polygon.getLinearRings().reduce((aggregatedArea, linearRing, index) => {
		geodesicPolygon.Clear();
		for (const [lon, lat] of linearRing.getCoordinates()) {
			geodesicPolygon.AddPoint(lat, lon);
		}
		const res = geodesicPolygon.Compute(false, true);
		const isExteriorRing = index === 0;
		return isExteriorRing ? aggregatedArea + Math.abs(res.area) : aggregatedArea - Math.abs(res.area);
	}, 0);
};

/**
 * A wrapper method for ol/LineString.getCoordinateAt().
 * Return the coordinate at the provided fraction along the linear geometry or along the boundary of a area-like geometry.
 * The fraction is a number between 0 and 1, where 0 is the start (first coordinate) of the geometry and 1 is the end (last coordinate). *
 * @function
 * @param {Geometry} geometry
 * @param {number} fraction
 * @returns {Array.<number>} the calculated coordinate or null if the geometry is not linear or area-like
 */
export const getCoordinateAt = (geometry, fraction) => {
	const lineString = getLineString(geometry);

	if (lineString) {
		return lineString.getCoordinateAt(fraction);
	}
	return null;
};

/**
 * Determines whether or not the geometry has the property of a azimuth-angle
 * @function
 * @param {Geometry} geometry the geometry
 * @returns {boolean}
 */
export const canShowAzimuthCircle = (geometry) => {
	if (geometry instanceof LineString) {
		const coords = geometry.getCoordinates();
		if (coords.length === 2 || (coords.length === 3 && coords[1][0] === coords[2][0] && coords[1][1] === coords[2][1])) {
			return true;
		}
	}
	return false;
};

/**
 * Calculates the azimuth-angle between the start(first coordinate) and end(last coordinate) of the geometry
 * @function
 * @param {Geometry} geometry
 * @returns {number} the azimuth-angle as degree of arc with a value between 0 and 360
 */
export const getAzimuth = (geometry) => {
	if (!(geometry instanceof Polygon) && !(geometry instanceof LineString) && !(geometry instanceof LinearRing)) {
		return null;
	}
	const coordinates = geometry instanceof Polygon ? geometry.getCoordinates(false)[0] : geometry.getCoordinates();

	if (coordinates.length < 2) {
		return null;
	}

	const startPoint = coordinates[0];
	const endPoint = coordinates[1];

	const x = endPoint[0] - startPoint[0];
	const y = endPoint[1] - startPoint[1];
	const rad = Math.acos(y / Math.sqrt(x * x + y * y));
	const factor = x > 0 ? 1 : -1;

	return (360 + (factor * rad * 180) / Math.PI) % 360;
};

/**
 * Calculates the median azimuth-angle of a convex quadrilateral (polygon).
 * The first and the third segment are defined as the top- and bottom-segment,
 * which are used to calculate the azimuth-angle
 * @function
 * @param {Polygon} polygon the polygon, with shape-properties of a convex quadrilateral
 * @returns {number} the azimuth-angle in radian
 */
export const getAzimuthFrom = (polygon) => {
	if (!polygon || polygon.getType() !== 'Polygon') {
		return null;
	}
	const coordinates = polygon.getCoordinates()[0];
	const getAngle = (fromPoint, toPoint) => Math.atan2(toPoint[1] - fromPoint[1], toPoint[0] - fromPoint[0]);
	const topAngle = getAngle(coordinates[0], coordinates[1]);
	const bottomAngle = getAngle(coordinates[3], coordinates[2]);

	const angle = (topAngle + bottomAngle) / 2;
	return angle;
};

/**
 * Calculates delta-value as a factor of the length of a provided geometry,
 * to get equal-distanced partition points related to the start of the geometry.
 * The count of the points is based on the resolution of the MapView.
 * @function
 * @param {Geometry} geometry the linear/area-like geometry
 * @param {number} resolution the resolution of the MapView, e. g. map.getView().getResolution()
 * @param {module:modules/olMap/utils/olGeometryUtils~CalculationHints} calculationHints calculationHints for a optional transformation
 * @returns {number} the delta, a value between 0 and 1
 */
export const getPartitionDelta = (geometry, resolution = 1, calculationHints = {}) => {
	const length = getGeometryLength(geometry, calculationHints);

	const minLengthResolution = 40;
	const isValidForResolution = (partition) => {
		const partitionResolution = partition / resolution;
		return partitionResolution > minLengthResolution && length > partition;
	};

	const stepFactor = 10;
	const minDelta = 0.02; // results in max 50 allowed partitions
	const maxDelta = 1;
	const minPartitionLength = 10;
	const findBestFittingDelta = (partitionLength) => {
		const delta = partitionLength / length;
		if (maxDelta < delta) {
			return maxDelta;
		}
		if (isValidForResolution(partitionLength)) {
			if (minDelta < delta) {
				return delta;
			}
		}
		const nextPartitionLength = partitionLength * stepFactor;
		return findBestFittingDelta(nextPartitionLength);
	};

	return findBestFittingDelta(minPartitionLength);
};

/**
 * Tests whether the vertex candidate is part of the geometry vertices
 * @function
 * @param {Geometry} geometry the geometry
 * @param {Point} vertexCandidate the candidate point to test against the geometry. If candidate is other than
 * `Point`, it returns immediately false
 * @returns {boolean}
 */
export const isVertexOfGeometry = (geometry, vertexCandidate) => {
	const isPoint = vertexCandidate instanceof Point;
	if (!isPoint) {
		return false;
	}
	const vertexCoordinate = vertexCandidate.getCoordinates();
	const getCoordinates = (geometry) => {
		if (geometry instanceof Polygon) {
			return geometry.getCoordinates(false)[0];
		}
		if (geometry instanceof Point) {
			return [geometry.getCoordinates()];
		}
		return geometry.getCoordinates();
	};
	const coordinates = getCoordinates(geometry);

	const result = coordinates.find((c) => c[0] === vertexCoordinate[0] && c[1] === vertexCoordinate[1]);
	return result ? true : false;
};

/**
 * Creates a LineString, which is parallel to the two given points with the given distance.
 * @function
 * @param {Coordinate} fromPoint the first coordinate of a hypothetic source-line
 * @param {Coordinate} toPoint the last coordinate of a hypothetic source-line
 * @param {number} distance the distance for which the destination line is moved parallel from the hypothetic source-line
 * @returns {LineString} the resulting line
 */
export const moveParallel = (fromPoint, toPoint, distance) => {
	const angle = Math.atan2(toPoint[1] - fromPoint[1], toPoint[0] - fromPoint[0]);
	const movedFrom = [Math.sin(angle) * distance + fromPoint[0], -Math.cos(angle) * distance + fromPoint[1]];
	const movedTo = [Math.sin(angle) * distance + toPoint[0], -Math.cos(angle) * distance + toPoint[1]];
	return new LineString([movedFrom, movedTo]);
};

/**
 * Calculates the residuals that occurs when the partitions are distributed over the individual segments of the geometry
 * @function
 * @param {Geometry} geometry the source geometry
 * @param {number} partition the partition-value
 * @returns {Array<number>} the residuals for all segments of the geometry
 */
export const calculatePartitionResidualOfSegments = (geometry, partition) => {
	const residuals = [];
	const lineString = getLineString(geometry);
	if (lineString) {
		const partitionLength = getGeometryLength(lineString) * partition;
		let currentLength = 0;
		let lastResidual = 0;
		lineString.forEachSegment((from, to) => {
			const segmentGeometry = new LineString([from, to]);
			currentLength = currentLength + segmentGeometry.getLength();
			residuals.push(lastResidual);
			lastResidual = (currentLength % partitionLength) / partitionLength;
		});
	}

	return residuals;
};
/**
 * Checks whether or not the geometry is valid for mapping purposes
 * @function
 * @param {Geometry|null} geometry the geometry supported GeometryTypes are Point, LineString, Polygon
 * @returns {boolean}
 */
export const isValidGeometry = (geometry) => {
	if (geometry == null) {
		return false;
	}

	if (geometry instanceof Point) {
		return true;
	}

	if (geometry instanceof LineString) {
		return geometry.getLength() > 0;
	}

	if (geometry instanceof Polygon) {
		return geometry.getArea() > 0;
	}
	return false;
};

/**
 * Contains information for transformation-methods
 * @typedef GeometryStats
 * @property {module:domain/coordinateTypeDef~Coordinate|null} coordinate
 * @property {number|null} azimuth
 * @property {number|null} length
 * @property {number|null} area
 */

/**
 * @function
 * @param {Geometry} geometry ol geometry
 * @param {module:modules/olMap/utils/olGeometryUtils~CalculationHints} calculationHints
 * @returns {module:modules/olMap/utils/olGeometryUtils~GeometryStats}
 */
export const getStats = (geometry, calculationHints) => {
	const stats = {
		coordinate: null,
		azimuth: null,
		length: null,
		area: null
	};

	if (geometry instanceof Point) {
		return { ...stats, coordinate: geometry.getCoordinates() };
	}
	if (geometry instanceof LineString) {
		return { ...stats, azimuth: canShowAzimuthCircle(geometry) ? getAzimuth(geometry) : null, length: getGeometryLength(geometry, calculationHints) };
	}
	if (geometry instanceof MultiLineString) {
		return {
			...stats,
			length: geometry.getLineStrings().reduce((partialLength, lineString) => partialLength + getGeometryLength(lineString, calculationHints), 0)
		};
	}
	if (geometry instanceof Polygon) {
		return { ...stats, length: getGeometryLength(geometry, calculationHints), area: getArea(geometry, calculationHints) };
	}
	return stats;
};

export const PROFILE_GEOMETRY_SIMPLIFY_DISTANCE_TOLERANCE_3857 = 17.5; /**In map units, adopted from v3 and adjusted to 3857 */
export const PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES = 1000; /**Adopted from v3  */

/**
 * Creates a simplified version of this geometry.
 * For LineStrings it uses the Douglas-Peucker algorithm.
 * For Polygons, a quantization-based simplification is used to preserve topology.
 * @function
 * @param {Geometry} geometry ol geometry
 * @param {number} maxCount max. count of coordinates on which the geometry won't be simplified
 * @param {number} tolerance the tolerance distance for simplification (in map units)
 * @returns {Geometry} A new, simplified version of the original geometry
 */
export const simplify = (geometry, maxCount, tolerance) => {
	if (geometry instanceof Geometry && maxCount && tolerance && geometry?.getCoordinates().length > maxCount) {
		return geometry.simplify(tolerance);
	}
	return geometry;
};

/**
 * Returns an array of coordinates suitable for calculating an elevation profile.
 * @function
 * @param {Geometry} geometry ol geometry
 * @returns {Array<module:domain/coordinateTypeDef~Coordinate>} the coordinates
 */
export const getCoordinatesForElevationProfile = (geometry) => {
	if (geometry instanceof Geometry) {
		const simplifiedLineString = simplify(
			getLineString(geometry),
			PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES,
			PROFILE_GEOMETRY_SIMPLIFY_DISTANCE_TOLERANCE_3857
		);
		if (simplifiedLineString) {
			return simplifiedLineString.getCoordinates();
		}
	}
	return [];
};
