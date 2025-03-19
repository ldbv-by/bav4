import { BaGeometry } from '../../src/domain/geometry';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';

describe('Geometry', () => {
	it('provides a constructor and getters for properties', () => {
		const geometry = new BaGeometry('data', new SourceType(SourceTypeName.GPX));

		expect(geometry.data).toBe('data');
		expect(geometry.sourceType).toEqual(new SourceType(SourceTypeName.GPX));
	});

	it('provides a constructor that stringifies a GeoJSON', () => {
		const json = { foo: 'bar' };
		const geometry = new BaGeometry(json, new SourceType(SourceTypeName.GEOJSON));

		expect(geometry.data).toBe(JSON.stringify(json));
		expect(geometry.sourceType).toEqual(new SourceType(SourceTypeName.GEOJSON));
	});

	it('check the constructors arguments', () => {
		expect(() => new BaGeometry('data', new SourceType(SourceTypeName.WMS))).toThrowError('Unsupported source type: wms');
		expect(() => new BaGeometry('data')).toThrowError('<sourceType> must be a SourceType');
		expect(() => new BaGeometry(123, new SourceType(SourceTypeName.GPX))).toThrowError('<data> must be a String');
	});
});
