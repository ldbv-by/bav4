/**
 * @module modules/olMap/ol/geodesic/geodesicGeometry
 */
import { Geodesic, PolygonArea } from 'geographiclib-geodesic';
import { LineString, Polygon } from 'ol/geom';
import { TiledCoordinateBag } from './tiledCoordinateBag';
import { PROJECTED_LENGTH_GEOMETRY_PROPERTY } from '../../utils/olGeometryUtils';
import { fromLonLat } from '../../../../../node_modules/ol/proj';

export const GEODESIC_FEATURE_PROPERTY = 'geodesic';
export const GEODESIC_CALCULATION_STATUS = Object.freeze({ ACTIVE: 'active', INACTIVE: 'inactive' });

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
	#isDrawing = null;
	#geometry = null;
	#geodesicLines = null;
	#polygon = null;
	#length = null;
	#area = null;
	#azimuthCircle = null;
	#calculationStatus;
	#map;

	constructor(feature, map, isDrawingCallback = () => false) {
		this.feature = feature;
		this.featureRevision = feature.getRevision();
		if (!(this.feature.getGeometry() instanceof Polygon) && !(this.feature.getGeometry() instanceof LineString)) {
			throw new Error('This class only accepts Polygons (and Linestrings ' + 'after initial drawing is finished)');
		}
		this.#map = map;
		this.#isDrawing = isDrawingCallback;
		this.#initialize();
	}

	#initialize() {
		const coordinates = this.#getCoordinates(this.feature.getGeometry().clone().transform(WEBMERCATOR, WGS84));
		const isPolygon = this.feature?.getGeometry() instanceof Polygon && !this.#isDrawing();
		const hasAzimuthCircle = !isPolygon && this.#isEffectiveSegment(coordinates);
		const geodesicProperties = this.#calculateGlobalProperties(coordinates, isPolygon, hasAzimuthCircle);
		this.#geodesicLines = this.#createGeodesicLines(coordinates);

		const geodesicCoords = this.#calculateGeodesicCoordinatesFrom(this.#geodesicLines);
		this.#azimuthCircle = hasAzimuthCircle ? this.#calculateAzimuthCircle(coordinates, geodesicProperties.rotation, geodesicProperties.length) : null;
		this.#geometry = geodesicCoords.createTiledGeometry();
		this.#polygon = isPolygon && !this.#isDrawing() ? geodesicCoords.createTiledPolygon(this) : null;
		this.#geometry.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, geodesicProperties.length);
		this.#length = geodesicProperties.length;
		this.#area = geodesicProperties.area;
	}

	#update() {
		if (this.feature.getRevision() !== this.featureRevision) {
			this.featureRevision = this.feature.getRevision();
			this.#initialize();
		}
	}

	/**
	 * Whether or not the coordinates effectively define a line segment.
	 * This is true if the coordinates array consists of two
	 * distinct (start -> end) or (start -> end -> start) coordinates
	 * @param {Array<Array<Number>>} coordinates
	 * @returns {boolean}
	 */
	#isEffectiveSegment(coordinates) {
		return (
			coordinates.length === 2 || (coordinates.length === 3 && coordinates[1][0] === coordinates[2][0] && coordinates[1][1] === coordinates[2][1])
		);
	}

	#getCoordinates(geometry) {
		if (geometry instanceof Polygon) {
			return this.#isDrawing() ? geometry.getCoordinates()[0].slice(0, -1) : geometry.getCoordinates()[0];
		}
		return geometry.getCoordinates();
	}

	#calculateGlobalProperties(coordinates, isPolygon, hasAzimuthCircle) {
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

	#calculateGeodesicCoordinatesFrom(geodesicLines) {
		const geodesicBag = new TiledCoordinateBag();
		const geodesicCalculationThresholdInMeter = 55555;
		const arcInterpolationCount = FULL_CIRCLE_POINTS / 2;
		let interpolationCount = 0;
		const calculateGeodesicCoordinates = (geodesicLine) => {
			const { geodesic, from, to } = geodesicLine;
			if (geodesic.s13 < geodesicCalculationThresholdInMeter) {
				return [from, to];
			}

			const calculatedCoords = [];
			const daIncrement = geodesic.a13 / arcInterpolationCount;
			for (let z = 0; z <= arcInterpolationCount; ++z) {
				const a = daIncrement * z;

				const r = geodesic.ArcPosition(a, Geodesic.STANDARD | Geodesic.LONG_UNROLL);
				calculatedCoords.push([r.lon2, r.lat2]);
			}
			interpolationCount++;
			return calculatedCoords;
		};

		geodesicLines.forEach((geodesicLine) =>
			calculateGeodesicCoordinates(geodesicLine).forEach((c, index) => (index === 0 ? geodesicBag.add(c, true) : geodesicBag.add(c)))
		);
		this.#calculationStatus = interpolationCount === 0 ? GEODESIC_CALCULATION_STATUS.INACTIVE : GEODESIC_CALCULATION_STATUS.ACTIVE;
		return geodesicBag;
	}

	#createTicksByDistance(distance, map) {
		const ticks = [];
		let residual = 0;
		this.#geodesicLines.forEach((geodesicLine) => {
			const { geodesic } = geodesicLine;
			let currentResidual = residual;
			for (let currentDistance = currentResidual; currentDistance <= geodesic.s13; currentDistance += distance) {
				const r = geodesic.Position(currentDistance, Geodesic.STANDARD | Geodesic.LONG_UNROLL);
				const tickCoordinate = fromLonLat([r.lon2, r.lat2], 'EPSG:3857');
				const pixel = map.getPixelFromCoordinate(tickCoordinate);
				ticks.push([...pixel, r.azi2]);
				currentResidual = geodesic.s13 - currentDistance;
			}
			residual = distance - currentResidual;
		});
		return ticks;
	}

	#createGeodesicLines(coordinates) {
		return coordinates
			? coordinates.reduce((geodesicLines, toCoordinate, index) => {
					const fromCoordinate = index > 0 ? coordinates[index - 1] : null;
					if (fromCoordinate) {
						const geodesicLine = {
							geodesic: Geodesic.WGS84.InverseLine(fromCoordinate[1], fromCoordinate[0], toCoordinate[1], toCoordinate[0]),
							from: fromCoordinate,
							to: toCoordinate
						};
						geodesicLines.push(geodesicLine);
					}
					return geodesicLines;
				}, [])
			: [];
	}

	#calculateAzimuthCircle(coords, rotation, length) {
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

	getTicksByDistance(distance) {
		return this.#createTicksByDistance(distance, this.#map);
	}

	getCalculationStatus() {
		this.#update();
		return this.#calculationStatus;
	}

	/** @returns {import('ol').MultiLineString} Represents the drawn LineString or the border of the drawn Polygon */
	getGeometry() {
		this.#update();
		return this.#geometry;
	}

	/** @returns {import('ol').MultiLineString} Represents the filling of the feature */
	getPolygon() {
		this.#update();
		return this.#polygon;
	}

	get length() {
		this.#update();
		return this.#length;
	}

	get area() {
		this.#update();
		return this.#area;
	}

	get azimuthCircle() {
		this.#update();
		return this.#azimuthCircle;
	}
}
