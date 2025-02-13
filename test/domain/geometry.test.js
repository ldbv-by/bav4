import { GeometryType } from '../../src/domain/geometryTypes';
import { Geometry, GeometryDataType } from '../../src/domain/geometry';

describe('Geometry', () => {
	it('provides a constructor getter for properties', () => {
		const geometry = new Geometry('data', GeometryType.POINT, GeometryDataType.GEOJSON);

		expect(geometry.data).toBe('data');
		expect(geometry.geometryType).toBe(GeometryType.POINT);
		expect(geometry.dataType).toBe(GeometryDataType.GEOJSON);
	});
});

describe('GeometryDataType', () => {
	it('provides an enum of all available types', () => {
		expect(Object.keys(GeometryDataType).length).toBe(1);
		expect(Object.isFrozen(GeometryDataType)).toBeTrue();
		expect(GeometryDataType.GEOJSON).toBe(0);
	});
});
