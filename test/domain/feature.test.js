import { GeometryType } from '../../src/domain/geometryTypes';
import { Geometry, GeometryDataType } from '../../src/domain/geometry';
import { Feature } from '../../src/domain/feature';

describe('Feature', () => {
	it('provides a constructor and getters for properties', () => {
		const geometry = new Geometry('data', GeometryType.POINT, GeometryDataType.GEOJSON);
		const feature = new Feature(geometry, 'id');

		expect(feature.geometry).toEqual(geometry);
		expect(feature.id).toBe('id');
	});

	it('provides default values', () => {
		const geometry = new Geometry('data', GeometryType.POINT, GeometryDataType.GEOJSON);
		const feature = new Feature(geometry);

		expect(feature.geometry).toEqual(geometry);
		expect(feature.id).toBeNull();
		expect(feature.getProperties()).toEqual({});
	});

	it('provides set method for the id', () => {
		const geometry = new Geometry('data', GeometryType.POINT, GeometryDataType.GEOJSON);
		const feature = new Feature(geometry);

		feature.id = 'id0';
		
		expect(feature.id).toBe('id0');
	});

	it('provides set, get and remove methods for properties', () => {
		const geometry = new Geometry('data', GeometryType.POINT, GeometryDataType.GEOJSON);
		const feature = new Feature(geometry);

		feature.set('foo', 'bar');
		feature.set('foo', 'bar1');

		expect(feature.get('foo')).toBe('bar1');
		expect(feature.get('unknown')).toBeNull();
		expect(feature.getProperties()).toEqual({ foo: 'bar1' });

		feature.remove('foo');
		expect(feature.getProperties()).toEqual({});
	});
});
