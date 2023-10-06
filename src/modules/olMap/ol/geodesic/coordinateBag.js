/**
 * @module modules/olMap/ol/geodesic/coordinateBag
 */
import { Math as geographicMath } from 'geographiclib-geodesic';
import { MultiLineString, MultiPolygon } from 'ol/geom';
import { boundingExtent } from 'ol/extent';
import proj4 from 'proj4';

const Epsg_WebMercartor = 'EPSG:3857';
const Epsg_Wgs84 = 'EPSG:4326';
const Deg360_In_WebMercartor = 2 * Math.PI * 6378137; // FIXME: move to coordinateSystem-utils or something like that

const Left_World = -1;
const Right_World = 1;
const Dateline_Buffer = 40;

/**
 * Class to organize spherical coordinates and create geometries as
 * - a MultiLineString (createGeometry())
 * - a MultiPolygon (createPolygon())
 */
export class CoordinateBag {
	constructor() {
		this.lastCoordinate = null;

		this.lineStringIndex = 0;
		this.lineStrings = [[]];

		this.subsegments = [[]];
		this.subsegmentExtents = [[]];
		this.segmentIndex = -1;
		this.segmentIndices = [];

		this.polygons = {};
		this.worldIndex = 0;
	}

	/**
	 * adds a new coordinate to the bag
	 *
	 * @param {Coordinate } coordinate The coordinate to add
	 * @param {Boolean} newSegment whether this vertex is the binding vertex of two segments or not
	 */
	add(coordinate, newSegment = false) {
		if (newSegment) {
			this.segmentIndex++;
		}
		if (this.lastCoordinate && 180 - Math.abs(this.lastCoordinate[0]) < Dateline_Buffer) {
			if (coordinate[0] < 0 && this.lastCoordinate[0] > 0) {
				this._push(coordinate, Right_World);
				this.lineStrings[++this.lineStringIndex] = [];
			} else if (coordinate[0] > 0 && this.lastCoordinate[0] < 0) {
				this._push(coordinate, Left_World);
				this.lineStrings[++this.lineStringIndex] = [];
			}
		}
		this._push(coordinate);
		this.lastCoordinate = coordinate;
	}

	_push(coordinate, offset = 0) {
		const coord = [coordinate[0] + offset * 360, coordinate[1]];
		const polygonId = 'polygon_' + this.worldIndex;
		this.worldIndex += offset;
		//Push to lineString (border of the shape)
		this.lineStrings[this.lineStringIndex].push(coord);
		//Push to polygons (To color the area of the shape)
		if (this.polygons[polygonId] == null) {
			this.polygons[polygonId] = [];
		}
		this.polygons[polygonId].push(coord);
		/* Push to subsegments (Used to calculate distances form mouse cursor to shape and to
        calculate the extent of each segment and subsegment) */
		if (this.segmentIndex >= 0 && this.lineStrings[this.lineStringIndex].length > 1) {
			const lastCoord = [...this.lastCoordinate];
			const subsegment = [proj4(Epsg_Wgs84, Epsg_WebMercartor, lastCoord), proj4(Epsg_Wgs84, Epsg_WebMercartor, coord)];
			subsegment[1][0] += offset * Deg360_In_WebMercartor;
			const subsegmentExtent = boundingExtent(subsegment);
			if (!this.subsegments[this.segmentIndex]) {
				if (this.segmentIndex > 0) {
					this.subsegments[this.segmentIndex - 1].push(subsegment);
					this.subsegmentExtents[this.segmentIndex - 1].push(subsegmentExtent);
				}
				this.subsegments[this.segmentIndex] = [];
				this.subsegmentExtents[this.segmentIndex] = [];
			} else {
				this.subsegments[this.segmentIndex].push(subsegment);
				this.subsegmentExtents[this.segmentIndex].push(subsegmentExtent);
			}
		}
	}

	/**
	 * Creates a geodetic Geometry from all added coordinates
	 * @returns  {MultiLineString | null}
	 */
	createGeometry() {
		if (this.lineStrings[this.lineStringIndex].length <= 1) {
			this.lineStrings.pop();
		}
		return new MultiLineString(this.lineStrings).transform(Epsg_Wgs84, Epsg_WebMercartor);
	}

	/**
	 * @param {import('./geodesicGeometry').GeodesicGeometry} geodesicGeometry
	 * @returns {MultiPolygon | null}
	 */
	createPolygon(geodesicGeometry) {
		if (
			!geodesicGeometry.isPolygon ||
			(geodesicGeometry.isDrawing && this.lineStringIndex === 1) ||
			(this.lineStringIndex > 1 && this.worldIndex !== 0) ||
			this.lineStringIndex > 2
		) {
			/* If polygon should not be filled OR
            the chance for the algorithm to not color the polygon correctly is too high.*/
			return null;
		}
		return new MultiPolygon(
			Object.values(this.polygons).map((coordinates) => {
				const first = coordinates[0];
				if (this.lineStringIndex === 1) {
					/* The polygon goes through north or south pol. The coloring will be correct as
                    long as the shape is not too complex (no overlapping) */
					if (coordinates.length <= 1) return [coordinates];
					const last = coordinates[coordinates.length - 1];
					// Drawing at 90deg breaks things, thats why we stop at 89
					const lat = geographicMath.copysign(89, this.worldIndex * geodesicGeometry.totalArea);
					coordinates.push([last[0], lat], [first[0], lat]);
				}
				coordinates.push(first);
				return [coordinates];
			})
		).transform(Epsg_Wgs84, Epsg_WebMercartor);
	}
}
