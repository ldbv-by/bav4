/**
 * @module modules/olMap/ol/geodesic/geodesicGeometry
 */
import { Geodesic, PolygonArea, Math as geographicMath } from 'geographiclib-geodesic';
import { LineString, Polygon } from 'ol/geom';
import {
	createOrUpdateFromFlatCoordinates /* Warning: private method of openlayers */,
	buffer as bufferExtent,
	returnOrUpdate /* Warning: private method of openlayers */
} from 'ol/extent';
import RBush from 'ol/structs/RBush'; /* Warning: private class of openlayers; Wrapper for rbush-lib */
import { CoordinateBag } from './coordinateBag';

const GEODESIC_WGS84 = Geodesic.WGS84;
const WEBMERCATOR = 'EPSG:3857';
const WGS84 = 'EPSG:4326';

/**
 * A geodesic-geometry
 *
 * based on the GeodesicManager in https://github.com/geoadmin/web-mapviewer
 * and reduced (style-depending methods and properties removed) to our needs
 */
export class GeodesicGeometry {
	constructor(feature, isDrawingCallback = () => false) {
		this.feature = feature;
		this.featureRevision = feature.getRevision();
		if (!(this.feature.getGeometry() instanceof Polygon) && !(this.feature.getGeometry() instanceof LineString)) {
			throw new Error('This class only accepts Polygons (and Linestrings ' + 'after initial drawing is finished)');
		}
		this._isDrawing = isDrawingCallback;
		this._initialize();
	}

	_initialize() {
		const coordinates = this._getCoordinates(this.feature.getGeometry().clone().transform(WEBMERCATOR, WGS84));

		const hasAzimuthCircle = !this.isPolygon && this._isEffectiveSegment(coordinates);
		const geodesicProperties = this._calculateGlobalProperties(coordinates, this.isPolygon, hasAzimuthCircle);
		const resolution = this._calculateResolution(geodesicProperties.length);
		const geodesicCoords = this._calculateGeodesicCoordinates(coordinates, resolution);

		this.azimuthCircle = hasAzimuthCircle ? this._calculateAzimuthCircle(coordinates, geodesicProperties.rotation, geodesicProperties.length) : null;
		this.geometry = geodesicCoords.createGeometry();
		this.polygon = geodesicCoords.createPolygon(this);
		this.subsegmentRTrees = this._calculateSubsegmentRTree(geodesicCoords);
		this.extent = this._getExtent(this.geometry);

		// Overwrites public method getExtent of the feature to include the whole geodesic geometry.
		this.feature.getGeometry().getExtent = (extent) => {
			this._update();
			return returnOrUpdate(this.extent, extent); // FIXME: resolve private ol-method
		};

		this._length = geodesicProperties.length;
		this._area = geodesicProperties.area;
	}

	_update() {
		if (this.feature.getRevision() !== this.featureRevision) {
			this.featureRevision = this.feature.getRevision();
			this._initialize();
		}
	}

	/**
	 * Whether or not the coordinates effectively define a line segment.
	 * This is true if the coordinates array consists of two
	 * distinct (start -> end) or (start -> end -> start) coordinates
	 * @param {Array<Array<Number>>} coordinates
	 * @returns {boolean}
	 */
	_isEffectiveSegment(coordinates) {
		return (
			coordinates.length === 2 || (coordinates.length === 3 && coordinates[1][0] === coordinates[2][0] && coordinates[1][1] === coordinates[2][1])
		);
	}

	_getExtent(geodesicGeometry) {
		const extent = [null, null, null, null];
		// FIXME: resolve private ol-method
		createOrUpdateFromFlatCoordinates(geodesicGeometry.flatCoordinates, 0, geodesicGeometry.flatCoordinates.length, geodesicGeometry.stride, extent);
		return bufferExtent(extent, 0.0001, extent); //account for imprecisions in the calculation
	}

	_getCoordinates(geometry) {
		if (geometry instanceof Polygon) {
			return this._isDrawing() ? geometry.getCoordinates()[0].slice(0, -1) : geometry.getCoordinates()[0];
		}
		return geometry.getCoordinates();
	}

	_calculateGlobalProperties(coordinates, isPolygon, hasAzimuthCircle) {
		const geodesicPolygon = new PolygonArea.PolygonArea(GEODESIC_WGS84, !isPolygon);
		for (const coord of coordinates) {
			geodesicPolygon.AddPoint(coord[1], coord[0]);
		}
		const result = geodesicPolygon.Compute(false, true);

		const calculateRotation = () => {
			const geodesicLine = GEODESIC_WGS84.InverseLine(coordinates[0][1], coordinates[0][0], coordinates[1][1], coordinates[1][0]);
			return geodesicLine.azi1 < 0 ? geodesicLine.azi1 + 360 : geodesicLine.azi1;
		};

		return { length: result.perimeter, area: result.area, rotation: hasAzimuthCircle ? calculateRotation() : null };
	}

	_calculateResolution(geodesicLength) {
		/*
        Warning: the following numbers were only graphically measured, not calculated. So there is
        no guarantee to mathematical accuracy whatsoever.

        Here is the maximal measured difference between webmercator linear lines and wgs84
        geodesic lines at 47° (switzerland) and 70° (north of Norway). (At the equator, there
        is no difference):
         Km  47°    70°
         1   2,1cm  5,5cm
         10  2,1m   5,5m
         100 210m   550m

        "this.resolution" indicates the maximal distance between two points in meters. We select it
        so that each feature has less than 1000 points.

        So for the resolution scheme selected here, this is the relation between line length and
        maximal discrepancy from a perfect geodesic line at 47°:
        Line length                Max discrepancy at 47°
        line < 1000km              2.1cm
        1000km <= line < 10000km   2.1m
        line >= 10000km            210m
        */

		// FIXME: verify whether this calculation suites to our approach or not
		const resolution = Math.pow(10, Math.trunc(geodesicLength / 1000).toString(10).length);
		return Math.max(1000, resolution);
	}

	_calculateGeodesicCoordinates(coordinates, resolution) {
		let currentDistance = 0;
		const geodesicCoordinates = new CoordinateBag();

		for (let i = 0; i < coordinates.length - 1; i++) {
			const from = coordNormalize(coordinates[i]);
			const to = coordNormalize(coordinates[i + 1]);

			geodesicCoordinates.add(from, true);
			const geodesicLine = GEODESIC_WGS84.InverseLine(from[1], from[0], to[1], to[0]);

			let length = geodesicLine.s13;
			let distToPoint = 0;
			while ((currentDistance % resolution) + length >= resolution) {
				const partialLength = resolution - (currentDistance % resolution);
				distToPoint += partialLength;
				const positionCalcRes = geodesicLine.Position(distToPoint);
				const pos = [positionCalcRes.lon2, positionCalcRes.lat2];
				currentDistance += partialLength;
				length -= partialLength;
				if (geodesicLine.s13 >= 1000) geodesicCoordinates.add(pos);
			}
			currentDistance += length;
		}
		if (coordinates.length) {
			geodesicCoordinates.add(coordNormalize(coordinates[coordinates.length - 1]));
		}

		return geodesicCoordinates;
	}

	_calculateSubsegmentRTree(geodesicCoords) {
		const subsegmentRTrees = [];
		for (let i = 0; i < geodesicCoords.subsegments.length; i++) {
			subsegmentRTrees[i] = new RBush();
			subsegmentRTrees[i].load(geodesicCoords.subsegmentExtents[i], geodesicCoords.subsegments[i]);
		}

		return subsegmentRTrees;
	}

	_calculateAzimuthCircle(coords, rotation, length) {
		const center = coords[0];
		const pointsOnArc = 1000;
		const arcLength = 360 / pointsOnArc;
		const circleCoords = new CoordinateBag();
		for (let i = 0; i <= pointsOnArc; i++) {
			const res = GEODESIC_WGS84.Direct(
				center[1],
				center[0],
				//Adding "this.rotation" to be sure that the line meets the circle perfectly
				arcLength * i + rotation,
				length
			);
			circleCoords.add([res.lon2, res.lat2]);
		}
		return circleCoords.createGeometry();
	}

	/** @returns {import('ol').MultiLineString} Represents the drawn LineString or the border of the drawn Polygon */
	getGeometry() {
		this._update();
		return this.geometry;
	}

	/** @returns {import('ol').MultiLineString} Represents the filling of the feature */
	getPolygon() {
		this._update();
		return this.polygon;
	}

	/**
	 * Get the extent of the specified segment. The segmentIndex must be valid!
	 *
	 * @param {number} segmentIndex
	 * @returns {Extent}
	 */
	getSegmentExtent(segmentIndex) {
		this._update();
		const extent = this.subsegmentRTrees[segmentIndex].getExtent();
		return bufferExtent(extent, 0.0001, extent);
	}

	/**
	 * Get all subsegments that are inside the specified extent. The segmentIndex must be valid!
	 *
	 * @param {number} segmentIndex
	 * @param {Extent} extent
	 * @returns {Array<Array<Number>>}
	 */
	getSubsegments(segmentIndex, extent) {
		this._update();
		return this.subsegmentRTrees[segmentIndex].getInExtent(extent);
	}

	get isDrawing() {
		return this._isDrawing();
	}

	get isPolygon() {
		const geometry = this.feature?.getGeometry();
		return geometry instanceof Polygon && !this._isDrawing();
	}

	get length() {
		this._update();
		return this._length;
	}

	get area() {
		this._update();
		return this._area;
	}
}

const coordNormalize = (coord) => {
	return [geographicMath.AngNormalize(coord[0]), coord[1]];
};

export function segmentExtent(feature, segmentIndex) {
	if (feature.geodesic) {
		return feature.geodesic.getSegmentExtent(segmentIndex);
	}
}

export function subsegments(feature, segmentIndex, viewExtent) {
	if (feature.geodesic) {
		return feature.geodesic.getSubsegments(segmentIndex, viewExtent);
	}
}
