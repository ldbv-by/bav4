import { LineString, Polygon, LinearRing } from 'ol/geom';

export const getGeometryLength = (geometry) => {
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
		return lineString.getLength();
	}
	return 0;
};

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

export const getPartitionDelta = (geometry) => {
	const length = getGeometryLength(geometry);
	let delta = 1;
	if (length > 200000) {
		delta = 100000 / length;				
	}
	else if (length > 20000) {
		delta = 10000 / length;				
	}
	else if (length !== 0) {
		delta = 1000 / length;
	}

	return delta;
};

export const isClosedPolygon = (geometry) => {
	if (geometry instanceof Polygon) {
		const coordinates = geometry.getCoordinates()[0];
		const first = coordinates[0];
		const last = coordinates[coordinates.length - 2];
		return (first[0] !== last[0] || first[1] !== last[1]);
	}
	return false;
};
