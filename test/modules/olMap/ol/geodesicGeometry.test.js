import { Feature } from 'ol';
import { Geometry, LineString, MultiPolygon, Point, Polygon } from 'ol/geom';
import { fromLonLat, toLonLat } from 'ol/proj';
import { GEODESIC_CALCULATION_STATUS, GeodesicGeometry } from '../../../../src/modules/olMap/ol/geodesic/geodesicGeometry';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

//proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);
describe('GeodesicGeometry', () => {
	const point = new Point(fromLonLat([9, 48]));
	const shortLineString = new LineString([fromLonLat([9, 48]), fromLonLat([9.0001, 48])]);
	const lineString = new LineString([fromLonLat([9, 48]), fromLonLat([11, 48]), fromLonLat([10, 47])]);

	const lineMunich_Paris = new LineString([fromLonLat([11.60221, 48.15629]), fromLonLat([2.192, 48.86656])]);
	const polygon = new Polygon([[fromLonLat([9, 48]), fromLonLat([11, 48]), fromLonLat([10, 47])]]);

	const mapMock = { getPixelFromCoordinate: (c) => c };

	describe('constructor', () => {
		it('initializes an instance with correct parameters', () => {
			const shortLineStringFeature = new Feature(shortLineString);
			const lineStringFeature = new Feature(lineString);
			const polygonFeature = new Feature(polygon);

			const shortLineStringInstance = new GeodesicGeometry(shortLineStringFeature);
			const lineStringInstance = new GeodesicGeometry(lineStringFeature);
			const polygonInstance = new GeodesicGeometry(polygonFeature);

			expect(shortLineStringInstance).toBeInstanceOf(GeodesicGeometry);
			expect(shortLineStringInstance.getCalculationStatus()).toBe(GEODESIC_CALCULATION_STATUS.INACTIVE);
			expect(lineStringInstance).toBeInstanceOf(GeodesicGeometry);
			expect(lineStringInstance.getCalculationStatus()).toBe(GEODESIC_CALCULATION_STATUS.ACTIVE);
			expect(polygonInstance).toBeInstanceOf(GeodesicGeometry);
			expect(polygonInstance.getCalculationStatus()).toBe(GEODESIC_CALCULATION_STATUS.ACTIVE);
		});

		it('throws an error while initializing an instance with incorrect parameters', () => {
			const pointFeature = new Feature(point);

			expect(() => new GeodesicGeometry(pointFeature)).toThrowError(
				'This class only accepts Polygons (and Linestrings after initial drawing is finished)'
			);
		});

		it('initializes an instance with azimuth circle', () => {
			const lineStringFeature = new Feature(lineMunich_Paris);

			const instance = new GeodesicGeometry(lineStringFeature);

			expect(instance.azimuthCircle).toBeInstanceOf(Geometry);
		});
	});

	describe('update geometry', () => {
		it('updates the geometry based on feature revision', () => {
			const feature = new Feature(lineString);

			const instance = new GeodesicGeometry(feature);
			const firstGeometryInstance = instance.getGeometry();

			feature.setGeometry(polygon); // trigger new feature revision
			const secondGeometryInstance = instance.getGeometry();

			expect(firstGeometryInstance).not.toBe(secondGeometryInstance);
		});

		it('does NOT updates the geometry based on feature revision', () => {
			const feature = new Feature(lineString);

			const instance = new GeodesicGeometry(feature);

			const geometryInstance = instance.getGeometry();

			expect(instance.getGeometry()).toBe(geometryInstance);
		});

		it('is aware of geometry changes for statistic properties', () => {
			const feature = new Feature(polygon);

			const instance = new GeodesicGeometry(feature);

			const length = instance.length;
			const area = instance.area;

			expect(length).toBeCloseTo(417850.6, 1);
			expect(Math.abs(area)).toBeCloseTo(8333081687.8, 1);
		});

		it('is aware of geometry changes for creating polygon geometry', () => {
			const feature = new Feature(polygon);

			const instance = new GeodesicGeometry(feature);
			const geodesicPolygon = instance.getPolygon();

			expect(geodesicPolygon).toBeInstanceOf(MultiPolygon);
		});
	});

	describe('getTicksByDistance', () => {
		it('creates ticks', () => {
			const feature = new Feature(lineString);
			const distance_10 = 1000 * 10; // 10 km
			const distance_100 = 1000 * 100; // 100 km
			const instance = new GeodesicGeometry(feature, mapMock);

			expect(instance.getTicksByDistance(distance_10)).toHaveSize(28);
			expect(instance.getTicksByDistance(distance_100)).toHaveSize(2);
		});
	});

	describe('getCoordinateAt', () => {
		it('calculates the coordinate', () => {
			const feature = new Feature(lineString);
			const instance = new GeodesicGeometry(feature);

			const actualFractionInFirstSegment = toLonLat(instance.getCoordinateAt(0.1));
			const actualFractionInLastSegment = toLonLat(instance.getCoordinateAt(0.9));

			expect(actualFractionInFirstSegment[0]).toBeCloseTo(9.4, 1);
			expect(actualFractionInFirstSegment[1]).toBeCloseTo(48.0, 1);
			expect(actualFractionInLastSegment[0]).toBeCloseTo(10.2, 1);
			expect(actualFractionInLastSegment[1]).toBeCloseTo(47.2, 1);
		});
	});
});
