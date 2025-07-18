/**
 * @module modules/olMap/handler/OlSketchHandler
 */
import { Polygon } from 'ol/geom';
import { unByKey } from 'ol/Observable';
import { Tools } from '../../../domain/tools';
import { asInternalProperty } from '../../../utils/propertyUtils';

export const DefaultIdPrefix = Tools.DRAW + '_';

/**
 * OlSketchHandler monitors changes for geometry based interactions of sketch-features and
 * handles sketch-related properties
 * @class
 * @author thiloSchlemmer
 */
export class OlSketchHandler {
	constructor() {
		this._pointCount = 0;
		this._isSnapOnLastPoint = false;
		this._isFinishOnFirstPoint = false;
		this._sketch = null;
		this._map = null;
	}

	_getLineCoordinates(geometry) {
		return geometry instanceof Polygon ? geometry.getCoordinates()[0].slice(0, -1) : geometry.getCoordinates();
	}

	_monitorProperties(feature) {
		const lineCoordinates = this._getLineCoordinates(feature.getGeometry());

		if (this._pointCount !== lineCoordinates.length) {
			// a point is added or removed
			this._pointCount = lineCoordinates.length;
		} else if (lineCoordinates.length > 1) {
			const firstPoint = lineCoordinates[0];
			const lastPoint = lineCoordinates[lineCoordinates.length - 1];
			const lastPoint2 = lineCoordinates[lineCoordinates.length - 2];

			const isSnapOnFirstPoint = lastPoint[0] === firstPoint[0] && lastPoint[1] === firstPoint[1];
			this._isFinishOnFirstPoint = !this._isSnapOnLastPoint && isSnapOnFirstPoint;

			this._isSnapOnLastPoint = lastPoint[0] === lastPoint2[0] && lastPoint[1] === lastPoint2[1];
		}

		feature.set(asInternalProperty('finishOnFirstPoint'), this._isFinishOnFirstPoint);
	}

	activate(sketchFeature, map, idPrefix = Tools.DRAW + '_') {
		const onFeatureChange = (event) => this._monitorProperties(event.target);
		this._map = map;
		if (sketchFeature !== this._sketch) {
			sketchFeature.setId(idPrefix + new Date().getTime());

			this._listener = sketchFeature.on('change', onFeatureChange);
			this._pointCount = 1;
			this._sketch = sketchFeature;
		}
	}

	deactivate() {
		unByKey(this._listener);
		this._sketch.unset(asInternalProperty('finishOnFirstPoint'));
		this._sketch = null;
		this._isFinishOnFirstPoint = false;
		this._isSnapOnLastPoint = false;
		this._pointCount = 0;
	}

	get active() {
		return this._sketch;
	}

	get isActive() {
		return this._sketch !== null;
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
