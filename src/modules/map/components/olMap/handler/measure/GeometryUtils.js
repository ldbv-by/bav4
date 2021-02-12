import { LineString, Polygon, LinearRing } from 'ol/geom';

export const getGeometryLength = (geometry) => {
	let lineString;
	if(geometry instanceof LineString) {
		lineString = geometry;
	}
	else if(geometry instanceof LinearRing) {
		lineString = new LineString(geometry.getCoordinates());
	}
	else if(geometry instanceof Polygon) {
		lineString = new LineString(geometry.getLinearRing(0).getCoordinates());
	}	
	
	if(lineString) {
		return lineString.getLength();
	}
	return 0;
};

export const canShowAzimuthCircle = (geometry) => {
	if(geometry instanceof LineString) {
		const coords = geometry.getCoordinates();
		if(coords.length === 2 || 
			(coords.length === 3 && coords[1][0] === coords[2][0] && coords[1][1] === coords[2][1])) {
			return true;
		}
	}
	return false;
};
