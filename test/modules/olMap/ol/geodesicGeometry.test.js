import { Feature } from 'ol';
import { Geometry, LineString, MultiPolygon, Point, Polygon } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { GeodesicGeometry } from '../../../../src/modules/olMap/ol/geodesic/geodesicGeometry';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

//proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);
describe('GeodesicGeometry', () => {
	const point = new Point(fromLonLat([9, 48]));
	const lineString = new LineString([fromLonLat([9, 48]), fromLonLat([11, 48]), fromLonLat([10, 47])]);

	const lineMunich_Paris = new LineString([fromLonLat([11.60221, 48.15629]), fromLonLat([2.192, 48.86656])]);
	const polygon = new Polygon([[fromLonLat([9, 48]), fromLonLat([11, 48]), fromLonLat([10, 47])]]);

	describe('constructor', () => {
		it('initializes an instance with correct parameters', () => {
			const lineStringFeature = new Feature(lineString);
			const polygonFeature = new Feature(polygon);

			const lineStringInstance = new GeodesicGeometry(lineStringFeature);
			const polygonInstance = new GeodesicGeometry(polygonFeature);

			expect(lineStringInstance).toBeInstanceOf(GeodesicGeometry);
			expect(polygonInstance).toBeInstanceOf(GeodesicGeometry);
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
});
