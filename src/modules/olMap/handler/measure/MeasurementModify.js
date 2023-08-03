import { Modify } from 'ol/interaction';

export class MeasurementModify extends Modify {
	constructor(option) {
		super(option);

		this.SEGMENT_WRITERS_['Polygon'] = this.writePolygonGeometry_.bind(this);
	}

	writeLineStringGeometry_(feature, geometry) {
		if (feature.geodesic) {
			super.writeMultiLineStringGeometry_(feature, feature.geodesic.getGeodesicGeom());
		} else {
			super.writeLineStringGeometry_(feature, geometry);
		}
	}
}
