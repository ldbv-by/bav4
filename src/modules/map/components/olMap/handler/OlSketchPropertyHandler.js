import { Polygon } from 'ol/geom';
import { unByKey } from 'ol/Observable';

/**
 * SketchPropertyHandler monitors feature changes for geometry based interactions and
 * handles related properties of the sketch-properties
 * @class
 * @author thiloSchlemmer
 */
export class OlSketchPropertyHandler {

	constructor(sketchFeature) {
		if (!sketchFeature) {
			throw new TypeError('sketchFeature must be defined');
		}

		const onFeatureChange = (event) => {
			this._monitorProperties(event.target);
		};
		this._sketchFeature = sketchFeature;

		this._listener = this._sketchFeature.on('change', onFeatureChange);
		this._pointCount = 1;
		this._isSnapOnLastPoint = false;
		this._isFinishOnFirstPoint = false;
	}

	_getLineCoordinates(geometry) {
		return (geometry instanceof Polygon) ? geometry.getCoordinates()[0].slice(0, -1) : geometry.getCoordinates();
	}

	_monitorProperties(feature) {

		const lineCoordinates = this._getLineCoordinates(feature.getGeometry());

		if (this._pointCount !== lineCoordinates.length) {
			// a point is added or removed
			this._pointCount = lineCoordinates.length;
		}
		else if (lineCoordinates.length > 1) {
			const firstPoint = lineCoordinates[0];
			const lastPoint = lineCoordinates[lineCoordinates.length - 1];
			const lastPoint2 = lineCoordinates[lineCoordinates.length - 2];

			const isSnapOnFirstPoint = (lastPoint[0] === firstPoint[0] && lastPoint[1] === firstPoint[1]);
			this._isFinishOnFirstPoint = (!this._isSnapOnLastPoint && isSnapOnFirstPoint);

			this._isSnapOnLastPoint = (lastPoint[0] === lastPoint2[0] && lastPoint[1] === lastPoint2[1]);
		}
	}

	release() {
		unByKey(this._listener);
	}

	get isSnapOnLastPoint() {
		return this._isSnapOnLastPoint;
	}

	get isFinishOnFirstPoint() {
		return this._isFinishOnFirstPoint;
	}

	get pointCount() {
		return this._pointCount;
	}

}
