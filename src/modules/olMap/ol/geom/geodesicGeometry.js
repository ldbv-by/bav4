import { Geodesic, PolygonArea, Math as geographicMath } from 'geographiclib-geodesic';
import { LineString, MultiLineString, MultiPolygon, Polygon } from 'ol/geom';
import {
	createOrUpdateFromFlatCoordinates /* Warning: private method of openlayers */,
	buffer as bufferExtent,
	returnOrUpdate /* Warning: private method of openlayers */,
	boundingExtent
} from 'ol/extent';
import RBush from 'ol/structs/RBush'; /* Warning: private class of openlayers; Wrapper for rbush-lib */
import proj4 from 'proj4';
import { Stroke, Style } from 'ol/style';

const geod = Geodesic.WGS84;
const WEBMERCATOR = 'EPSG:3857';
const WGS84 = 'EPSG:4326';
const DEG360_IN_WEBMERCATOR = 2 * Math.PI * 6378137; // FIXME: move to coordinateSystem-utils or something like that
/**
 * A geodesic-geometry
 *
 * based on the GeodesicManager in https://github.com/geoadmin/web-mapviewer
 * - initially cloned
 *
 */
export class GeodesicGeometry {
	constructor(feature, isDrawingCallback = () => false) {
		this.feature = feature;
		this.featureRevision = feature.getRevision();
		if (!(this.feature.getGeometry() instanceof Polygon) && !(this.feature.getGeometry() instanceof LineString)) {
			throw new Error('This class only accepts Polygons (and Linestrings ' + 'after initial drawing is finished)');
		}
		this._isDrawing = isDrawingCallback;
		this._calculateEverything();
	}

	_calculateEverything() {
		this.geom = this.feature.getGeometry().clone().transform(WEBMERCATOR, WGS84);
		this.coords = this.geom.getCoordinates();
		// this.isDrawing = this.feature.get('isDrawing');
		this.isPolygon = false;
		if (this.geom instanceof Polygon) {
			this.coords = this.geom.getCoordinates()[0];
			//if (this.isDrawing) {
			if (this._isDrawing()) {
				this.coords = this.coords.slice(0, -1);
			} else {
				this.isPolygon = true;
			}
		}
		this.hasAzimuthCircle =
			!this.isPolygon &&
			(this.coords.length === 2 || (this.coords.length === 3 && this.coords[1][0] === this.coords[2][0] && this.coords[1][1] === this.coords[2][1]));
		this.stylesReady = !(
			this.coords.length < 2 ||
			(this.coords.length === 2 && this.coords[0][0] === this.coords[1][0] && this.coords[0][1] === this.coords[1][1])
		);
		/* The order of these calculations is important, as some methods require information
        calculated by previous methods. */
		this._calculateGlobalProperties();
		this._calculateResolution();
		this._calculateGeodesicCoords();
		this._calculateAzimuthCircle();

		// Overwrites public method getExtent of the feature to include the whole geodesic geometry.
		// FIXME: resolve private ol-method
		this.extent = createOrUpdateFromFlatCoordinates(
			this.geodesicGeom.flatCoordinates,
			0,
			this.geodesicGeom.flatCoordinates.length,
			this.geodesicGeom.stride,
			this.extent
		);
		this.extent = bufferExtent(this.extent, 0.0001, this.extent); //account for imprecisions in the calculation
		this.feature.getGeometry().getExtent = (extent) => {
			this._update();
			return returnOrUpdate(this.extent, extent); // FIXME: resolve private ol-method
		};
	}

	/* The following "_calculate*" methods are helper methods of "_calculateEverything" */
	_calculateGlobalProperties() {
		const geodesicPolygon = new PolygonArea.PolygonArea(geod, !this.isPolygon);
		for (const coord of this.coords) {
			geodesicPolygon.AddPoint(coord[1], coord[0]);
		}
		const res = geodesicPolygon.Compute(false, true);
		this.totalLength = res.perimeter;
		this.totalArea = res.area;
		if (this.hasAzimuthCircle) {
			const geodesicLine = geod.InverseLine(this.coords[0][1], this.coords[0][0], this.coords[1][1], this.coords[1][0]);
			this.rotation = geodesicLine.azi1 < 0 ? geodesicLine.azi1 + 360 : geodesicLine.azi1;
		}
	}

	_calculateResolution() {
		/*
        Warning: the following numbers were only graphically measured, not calculated. So there is
        no guarantee to mathematical accuracy whatsover.

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
		const resolution = Math.pow(10, Math.trunc(this.totalLength / 1000).toString(10).length);
		this.resolution = Math.max(1000, resolution);
	}

	_calculateGeodesicCoords() {
		let currentDistance = 0;
		// const measurePoints = new MeasureStyles(this.resolution)
		const geodesicCoords = new CoordinateBag();
		const segments = [];
		for (let i = 0; i < this.coords.length - 1; i++) {
			const from = coordNormalize(this.coords[i]);
			const to = coordNormalize(this.coords[i + 1]);
			segments[i] = [];
			// const segment = segments[i]; /** unneeded variable */
			geodesicCoords.add(from, true);
			const geodesicLine = geod.InverseLine(from[1], from[0], to[1], to[0]);
			let length = geodesicLine.s13;
			let distToPoint = 0;
			while ((currentDistance % this.resolution) + length >= this.resolution) {
				const partialLength = this.resolution - (currentDistance % this.resolution);
				distToPoint += partialLength;
				const positionCalcRes = geodesicLine.Position(distToPoint);
				const pos = [positionCalcRes.lon2, positionCalcRes.lat2];
				currentDistance += partialLength;
				length -= partialLength;
				if (geodesicLine.s13 >= 1000) geodesicCoords.add(pos);
				// measurePoints.push(pos, currentDistance);
			}
			currentDistance += length;
		}
		if (this.coords.length) {
			geodesicCoords.add(coordNormalize(this.coords[this.coords.length - 1]));
		}

		const subsegmentRTrees = [];
		for (let i = 0; i < geodesicCoords.subsegments.length; i++) {
			subsegmentRTrees[i] = new RBush();
			subsegmentRTrees[i].load(geodesicCoords.subsegmentExtents[i], geodesicCoords.subsegments[i]);
		}

		this.geodesicCoords = geodesicCoords;
		this.geodesicGeom = geodesicCoords.generateGeom();
		this.geodesicPolygonGeom = geodesicCoords.generatePolygonGeom(this);
		//this.measurePoints = measurePoints;
		this.subsegmentRTrees = subsegmentRTrees;
	}

	_calculateAzimuthCircle() {
		if (this.hasAzimuthCircle) {
			const nbPoints = 1000;
			const arcLength = 360 / nbPoints;
			const circleCoords = new CoordinateBag();
			for (let i = 0; i <= nbPoints; i++) {
				const res = geod.Direct(
					this.coords[0][1],
					this.coords[0][0],
					//Adding "this.rotation" to be sure that the line meets the circle perfectly
					arcLength * i + this.rotation,
					this.totalLength
				);
				circleCoords.add({ lon: res.lon2, lat: res.lat2 });
			}
			this.azimuthCircle = circleCoords.generateGeom();
			this.azimuthCircleStyle = new Style({
				stroke: new Stroke({
					width: 3,
					color: [255, 0, 0]
				}),
				geometry: this.azimuthCircle,
				zIndex: 0
			});
		}
	}

	_update() {
		if (this.feature.getRevision() !== this.featureRevision) {
			this.featureRevision = this.feature.getRevision();
			this._calculateEverything();
		}
	}

	/** @returns {MultiLineString} Represents the drawn LineString or the border of the drawn Polygon */
	getGeodesicGeom() {
		this._update();
		return this.geodesicGeom;
	}

	/** @returns {MultiLineString} Represents the filling of the feature */
	getGeodesicPolygonGeom() {
		this._update();
		return this.geodesicPolygonGeom;
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
	 * @returns {[[number]]}
	 */
	getSubsegments(segmentIndex, extent) {
		this._update();
		return this.subsegmentRTrees[segmentIndex].getInExtent(extent);
	}
}

const coordNormalize = (coord) => {
	/* if (Array.isArray(coord)) {
		coord = { lon: coord[0], lat: coord[1] };
	}
	return [geographicMath.AngNormalize(coord.lon), coord.lat]; */

	// FIXME: actually no need to check for object
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

/**
 * Class to organize spherical coordinates and create geometries as
 * - a MultiLineString (geodesicGeom)
 * - a MultiPolygon (geodesicPolygonGeom)
 * - a list of subsegments
 */
class CoordinateBag {
	constructor() {
		this.lastCoord = null;

		this.lineStrNr = 0;
		this.lineStrings = [[]];

		this.subsegments = [[]];
		this.subsegmentExtents = [[]];
		this.segmentNr = -1;

		this.polygons = {};
		this.worldNr = 0;
	}

	/**
	 * adds a new coordinate to the bag
	 *
	 * @param {Coordinate } coordinate The coordinate to add
	 * @param {boolean} newSegment whether this vertex is the binding vertex of two segments or not
	 */
	add(coordinate, newSegment) {
		if (newSegment) {
			this.segmentNr++;
		}
		if (this.lastCoord && 180 - Math.abs(this.lastCoord[0]) < 40) {
			if (coordinate[0] < 0 && this.lastCoord[0] > 0) {
				this._push(coordinate, 1);
				this.lineStrings[++this.lineStrNr] = [];
			} else if (coordinate[0] > 0 && this.lastlon < 0) {
				this._push(coordinate, -1);
				this.lineStrings[++this.lineStrNr] = [];
			}
		}
		this._push(coordinate);
		this.lastCoord = coordinate;
	}
	_push(coordinate, offset = 0) {
		const coord = [coordinate[0] + offset * 360, coordinate[1]];
		const polygonId = 'polygon_' + this.worldNr;
		this.worldNr += offset;
		//Push to lineString (border of the shape)
		this.lineStrings[this.lineStrNr].push(coord);
		//Push to polygons (To color the area of the shape)
		if (this.polygons[polygonId] == null) {
			this.polygons[polygonId] = [];
		}
		this.polygons[polygonId].push(coord);
		/* Push to subsegments (Used to calculate distances form mouse cursor to shape and to
        calculate the extent of each segment and subsegment) */
		if (this.segmentNr >= 0 && this.lineStrings[this.lineStrNr].length > 1) {
			const lastCoord = [...this.lastCoord];
			const subsegment = [proj4(WGS84, WEBMERCATOR, lastCoord), proj4(WGS84, WEBMERCATOR, coord)];
			subsegment[1][0] += offset * DEG360_IN_WEBMERCATOR;
			const subsegmentExtent = boundingExtent(subsegment);
			if (!this.subsegments[this.segmentNr]) {
				if (this.segmentNr > 0) {
					this.subsegments[this.segmentNr - 1].push(subsegment);
					this.subsegmentExtents[this.segmentNr - 1].push(subsegmentExtent);
				}
				this.subsegments[this.segmentNr] = [];
				this.subsegmentExtents[this.segmentNr] = [];
			} else {
				this.subsegments[this.segmentNr].push(subsegment);
				this.subsegmentExtents[this.segmentNr].push(subsegmentExtent);
			}
		}
	}
	generateGeom() {
		if (this.lineStrings[this.lineStrNr].length <= 1) {
			this.lineStrings.pop();
		}
		return new MultiLineString(this.lineStrings).transform(WGS84, WEBMERCATOR);
	}
	/**
	 * @param {GeodesicGeometries} geodesic
	 * @returns {MultiPolygon | null}
	 */
	generatePolygonGeom(geodesic) {
		if (
			(!geodesic.isDrawing && !geodesic.isPolygon) ||
			(geodesic.isDrawing && this.lineStrNr === 1) ||
			(this.lineStrNr > 1 && this.worldNr !== 0) ||
			this.lineStrNr > 2
		) {
			/* If polygon should not be filled OR
            the chance for the algorithm to not color the polygon correctly is too high.*/
			return null;
		}
		return new MultiPolygon(
			Object.values(this.polygons).map((coords) => {
				const first = coords[0];
				if (this.lineStrNr === 1) {
					/* The polygon goes through north or south pol. The coloring will be correct as
                    long as the shape is not too complex (no overlapping) */
					if (coords.length <= 1) return [coords];
					const last = coords[coords.length - 1];
					// Drawing at 90deg breaks things, thats why we stop at 89
					const lat = geographicMath.copysign(89, this.worldNr * geodesic.totalArea);
					coords.push([last[0], lat], [first[0], lat]);
				}
				coords.push(first);
				return [coords];
			})
		).transform(WGS84, WEBMERCATOR);
	}
}
