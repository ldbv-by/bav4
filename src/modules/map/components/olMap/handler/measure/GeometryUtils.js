import { Point, LineString, Polygon, LinearRing, Circle } from 'ol/geom';

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
		let lineString;
		if (calculationGeometry instanceof LineString) {
			lineString = calculationGeometry;
		}
		else if (calculationGeometry instanceof LinearRing) {
			lineString = new LineString(calculationGeometry.getCoordinates());
		}
		else if (calculationGeometry instanceof Polygon) {
			lineString = new LineString(calculationGeometry.getLinearRing(0).getCoordinates());
		}

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
	let coordinates = geometry.getCoordinates();
	if (geometry instanceof Polygon) {
		coordinates = coordinates[0];
	}

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
	const stepFactor = 10;
	const minPartitionLength = 10;
	const maxPartitionLength = 100000;
	let delta = 1;
	const minLengthResolution = 20;
	const isValidForResolution = (partition) => {
		const partitionResolution = partition / resolution;
		return partitionResolution > minLengthResolution && length > partition ;
	};	

	let partitionLength = minPartitionLength;
	while (partitionLength <= maxPartitionLength) {
		if ( isValidForResolution(partitionLength)) {
			delta = partitionLength / length;
			break;
		}	
		partitionLength = partitionLength * stepFactor;
	}

	return delta;
};


/**
 * Appends the appropriate unit of measure to the specified number
 * @param {number} length 
 * @returns {String} the formatted length 
 */
//todo:intermediate helper-function until kind of FormattingService is in place
export const getFormattedLength = (length) => {
	let formatted;
	if (length > 100) {
		formatted = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
	}
	else {
		formatted = length !== 0 ? Math.round(length * 100) / 100 + ' ' + 'm' : '0 m';
	}
	return formatted;
};

/**
 * Appends the appropriate unit of measure to the specified number
 * @param {number} area 
 * @returns {String} the formatted length 
 */
//todo: intermediate helper-function until kind of FormattingService is in place
export const getFormattedArea = (area) => {
	let formatted;
	if (area >= 1000000) {
		formatted = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km&sup2;';
	}
	else if (area >= 10000) {
		formatted = Math.round((area / 10000) * 100) / 100 + ' ' + 'ha';
	}
	else {
		formatted = Math.round(area * 100) / 100 + ' ' + 'm&sup2;';
	}
	return formatted;
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
	let coordinates = geometry.getCoordinates();
	if (geometry instanceof Polygon) {
		coordinates = geometry.getCoordinates()[0];
	}
	if (geometry instanceof Point) {
		coordinates = [geometry.getCoordinates()];
	}
	const result = coordinates.find(c => c[0] === vertexCoordinate[0] && c[1] === vertexCoordinate[1]);
	return result ? true : false;
};