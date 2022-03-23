import { Point, LineString, Polygon, LinearRing, Circle, MultiLineString } from 'ol/geom';


const transformGeometry = (geometry, fromProjection, toProjection) => {

	if (fromProjection && toProjection) {
		return geometry.clone().transform(fromProjection, toProjection);
	}
	return geometry;
};

/**
 * Coerce the provided geometry to a LineString or null,
 * if the geometry is not a LineString,LinearRing or Polygon
 *
 * @param {Geometry} geometry the geometry to coerce to LineString
 * @return {Geometry | null} the coerced LineString or null
 */
export const getLineString = (geometry) => {
	if (geometry instanceof LineString) {
		return geometry;
	}
	else if (geometry instanceof LinearRing) {
		return new LineString(geometry.getCoordinates());
	}
	else if (geometry instanceof Polygon) {
		return new LineString(geometry.getCoordinates(false)[0]);
	}
	return null;
};

/**
 * Contains informations for transformation-methods
 * @typedef {Object} CalculationHints
 * @property {string} fromProjection the 'source' ProjectionLike-object for usage in ol/geometry.transform() as String like 'EPSG:3875'
 * @property {string} toProjection the 'destination' ProjectionLike-object for usage in ol/geometry.transform() as String like 'EPSG:3875'
 */

/**
 * Calculates the area of the geometry.
 * @param {Geometry} geometry the area-like geometry, to calculate with
 * @param {CalculationHints} calculationHints calculationHints for a optional transformation
 * @returns {number} the calculated length or 0 if the geometry-object is not area-like
 */
export const getArea = (geometry, calculationHints = {}) => {
	if (!(geometry instanceof Polygon) &&
		!(geometry instanceof Circle) &&
		!(geometry instanceof LinearRing)) {
		return 0;
	}
	const calculationGeometry = transformGeometry(geometry, calculationHints.fromProjection, calculationHints.toProjection);
	return calculationGeometry.getArea();
};


/**
 * Calculates the length of the geometry.
 * @param {Geometry} geometry the geometry, to calculate with
 * @param {CalculationHints} calculationHints calculationHints for a optional transformation
 * @returns {number} the calculated length or 0 if the geometry-object is not a LineString/LinearRing/Polygon
 */
export const getGeometryLength = (geometry, calculationHints = {}) => {
	if (geometry) {
		const calculationGeometry = transformGeometry(geometry, calculationHints.fromProjection, calculationHints.toProjection);
		const lineString = getLineString(calculationGeometry);


		if (lineString) {
			return lineString.getLength();
		}
	}
	return 0;
};

/**
 * A wrapper method for ol/LineString.getCoordinateAt().
 * Return the coordinate at the provided fraction along the linear geometry or along the boundary of a area-like geometry.
 * The fraction is a number between 0 and 1, where 0 is the start (first coordinate) of the geometry and 1 is the end (last coordinate). *
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
 * @param {Geometry} geometry the geometry
 * @returns {boolean}
 */
export const canShowAzimuthCircle = (geometry) => {
	if (geometry instanceof LineString) {
		const coords = geometry.getCoordinates();
		if (coords.length === 2 ||
			(coords.length === 3 && coords[1][0] === coords[2][0] && coords[1][1] === coords[2][1])) {
			return true;
		}
	}
	return false;
};


/**
 * Calculates the azimuth-angle between the start(first coordinate) and end(last coordinate) of the geometry
 * @param {Geometry} geometry
 * @returns {number} the azimuth-angle as degree of arc with a value between 0 and 360
 */
export const getAzimuth = (geometry) => {
	if (!(geometry instanceof Polygon) &&
		!(geometry instanceof LineString) &&
		!(geometry instanceof LinearRing)) {
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

	return (360 + (factor * rad * 180 / Math.PI)) % 360;
};


/**
 * Calculates delta-value as a factor of the length of a provided geometry,
 * to get equal-distanced partition points related to the start of the geometry.
 * The count of the points is based on the resolution of the MapView.
 * @param {Geometry} geometry the linear/area-like geometry
 * @param {number} resolution the resolution of the MapView, e. g. map.getView().getResolution()
 * @param {CalculationHints} calculationHints calculationHints for a optional transformation
 * @returns {number} the delta, a value between 0 and 1
 */
export const getPartitionDelta = (geometry, resolution = 1, calculationHints = {}) => {
	const length = getGeometryLength(geometry, calculationHints);

	const minLengthResolution = 20;
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
 * @param {Geometry} geometry the geometry
 * @param {Point} vertexCandidate the candidate point to test against the geometryn if candidate is other than
 * {Point}, it returns immediately false
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

	const result = coordinates.find(c => c[0] === vertexCoordinate[0] && c[1] === vertexCoordinate[1]);
	return result ? true : false;
};

/**
 * Creates a LineString, which is parallel to the two given points with the given distance.
 * @param {Coordinate} fromPoint the first coordinate of a hypotetic source-line
 * @param {Coordinate} toPoint the last coordinate of a hypotetic source-line
 * @param {number} distance the distance for which the destination line is moved parallel from the hypotetic source-line
 * @returns {LineString} the resulting line
 */
export const moveParallel = (fromPoint, toPoint, distance) => {

	const angle = Math.atan2(toPoint[1] - fromPoint[1], toPoint[0] - fromPoint[0]);
	const movedFrom = [
		Math.sin(angle) * distance + fromPoint[0],
		-Math.cos(angle) * distance + fromPoint[1]
	];
	const movedTo = [
		Math.sin(angle) * distance + toPoint[0],
		-Math.cos(angle) * distance + toPoint[1]
	];
	return new LineString([movedFrom, movedTo]);

};

/**
 * Calculates the residuals that occurs when the partitions are distributed over the individual segments of the geometry
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
		return { ...stats, length: geometry.getLineStrings().reduce((partialLength, lineString) => partialLength + getGeometryLength(lineString, calculationHints), 0) };
	}
	if (geometry instanceof Polygon) {
		return { ...stats, length: getGeometryLength(geometry, calculationHints), area: getArea(geometry, calculationHints) };
	}
	return stats;
};
