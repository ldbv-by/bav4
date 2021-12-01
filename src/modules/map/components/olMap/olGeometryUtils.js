import { Point, LineString, MultiLineString, Polygon, LinearRing, Circle } from 'ol/geom';


const transformGeometry = (geometry, fromProjection, toProjection) => {

	if (fromProjection && toProjection) {
		return geometry.clone().transform(fromProjection, toProjection);
	}
	return geometry;
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
		const getLineString = (lineStringCandidate) => {
			if (lineStringCandidate instanceof LineString) {
				return lineStringCandidate;
			}
			else if (lineStringCandidate instanceof LinearRing) {
				return new LineString(lineStringCandidate.getCoordinates());
			}
			else if (lineStringCandidate instanceof Polygon) {
				return new LineString(lineStringCandidate.getLinearRing(0).getCoordinates());
			}
		};
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
	const getLineString = (lineStringCandidate) => {
		if (lineStringCandidate instanceof LineString) {
			return lineStringCandidate;
		}
		else if (lineStringCandidate instanceof LinearRing) {
			return new LineString(lineStringCandidate.getCoordinates());
		}
		else if (lineStringCandidate instanceof Polygon) {
			return new LineString(lineStringCandidate.getLinearRing(0).getCoordinates());
		}
	};
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
	const coordinates = geometry instanceof Polygon ? geometry.getCoordinates()[0] : geometry.getCoordinates();

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
	const minDelta = 0.01; // results in max 100 allowed partitions
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
			return geometry.getCoordinates()[0];
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

export const createOffsetGeometry = (geometry, lineOffsetInMeter) => {

	const segments = [];
	geometry.forEachSegment(function (from, to) {
		const coords = [];
		const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
		const newFrom = [
			Math.sin(angle) * lineOffsetInMeter + from[0],
			-Math.cos(angle) * lineOffsetInMeter + from[1]
		];
		const newTo = [
			Math.sin(angle) * lineOffsetInMeter + to[0],
			-Math.cos(angle) * lineOffsetInMeter + to[1]
		];
		coords.push(newFrom);
		coords.push(newTo);
		segments.push(new LineString(coords));
	});
	return new MultiLineString(segments);
};

export const moveParallel = (fromPoint, toPoint, distance) => {
	const coords = [];
	const angle = Math.atan2(toPoint[1] - fromPoint[1], toPoint[0] - fromPoint[0]);
	const newFrom = [
		Math.sin(angle) * distance + fromPoint[0],
		-Math.cos(angle) * distance + fromPoint[1]
	];
	const newTo = [
		Math.sin(angle) * distance + toPoint[0],
		-Math.cos(angle) * distance + toPoint[1]
	];
	coords.push(newFrom);
	coords.push(newTo);
	return new LineString(coords);

};

export const calculatePartitionResidualOfSegments = (geometry, partition) => {
	const residuals = [];
	let currentLength = 0;
	let lineString;
	if (geometry instanceof LineString) {
		lineString = geometry;
	}
	else if (geometry instanceof LinearRing) {
		lineString = new LineString(geometry.getCoordinates());
	}
	else if (geometry instanceof Polygon) {
		lineString = new LineString(geometry.getLinearRing(0).getCoordinates());
	}
	if (lineString) {
		const partitionLength = getGeometryLength(lineString) * partition;
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
