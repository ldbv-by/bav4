/**
 * @module modules/olMap/ol/geodesic/geodesicGeometry
 */
import { Geodesic, PolygonArea } from 'geographiclib-geodesic';
import { LineString, Polygon } from 'ol/geom';
import { TiledCoordinateBag } from './tiledCoordinateBag';

const GEODESIC_WGS84 = Geodesic.WGS84;
const WEBMERCATOR = 'EPSG:3857';
const WGS84 = 'EPSG:4326';
const FULL_CIRCLE_POINTS = 100; // count of points to form a smooth circle (closed arc)

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
		const geodesicCoords = this._calculateGeodesicCoordinates(coordinates);
		this.azimuthCircle = hasAzimuthCircle ? this._calculateAzimuthCircle(coordinates, geodesicProperties.rotation, geodesicProperties.length) : null;
		this.geometry = geodesicCoords.createTiledGeometry();
		this.polygon = this.isPolygon && !this.isDrawing ? geodesicCoords.createTiledPolygon(this) : null;
		this.extent = this.geometry.getExtent();

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

	_calculateGeodesicCoordinates(coordinates) {
		const geodesicBag = new TiledCoordinateBag();
		const geodesicCalculationThresholdInMeter = 55555;
		const arcInterpolationCount = FULL_CIRCLE_POINTS / 2;

		const calculateGeodesicCoordinates = (fromCoord, toCoord) => {
			const l = Geodesic.WGS84.InverseLine(fromCoord[1], fromCoord[0], toCoord[1], toCoord[0]);
			if (l.s13 < geodesicCalculationThresholdInMeter) {
				return [fromCoord, toCoord];
			}
			const calculatedCoords = [];
			const daIncrement = l.a13 / arcInterpolationCount;
			for (let z = 0; z <= arcInterpolationCount; ++z) {
				const a = daIncrement * z;

				const r = l.ArcPosition(a, Geodesic.STANDARD | Geodesic.LONG_UNROLL);
				calculatedCoords.push([r.lon2, r.lat2]);
			}
			return calculatedCoords;
		};

		for (let i = 0; i < coordinates.length - 1; i++) {
			const from = coordinates[i];
			const to = coordinates[i + 1];
			calculateGeodesicCoordinates(from, to).forEach((c, index) => (index === 0 ? geodesicBag.add(c, true) : geodesicBag.add(c)));
		}
		return geodesicBag;
	}

	_calculateAzimuthCircle(coords, rotation, length) {
		const center = coords[0];
		const arcLength = 360 / FULL_CIRCLE_POINTS;
		const circleCoords = new TiledCoordinateBag();
		for (let i = 0; i <= FULL_CIRCLE_POINTS; i++) {
			const res = GEODESIC_WGS84.Direct(
				center[1],
				center[0],
				//Adding "rotation" to be sure that the line meets the circle perfectly
				arcLength * i + rotation,
				length
			);
			circleCoords.add([res.lon2, res.lat2]);
		}
		return circleCoords.createTiledGeometry();
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
