import { Geometry } from '../../src/domain/geometry';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';

describe('Geometry', () => {
	it('provides a constructor and getters for properties', () => {
		const geometry = new Geometry('data', new SourceType(SourceTypeName.GPX));

		expect(geometry.data).toBe('data');
		expect(geometry.sourceType).toEqual(new SourceType(SourceTypeName.GPX));
	});

	it('provides a constructor that stringifies a GeoJSON', () => {
		const json = { foo: 'bar' };
		const geometry = new Geometry(json, new SourceType(SourceTypeName.GEOJSON));

		expect(geometry.data).toBe(JSON.stringify(json));
		expect(geometry.sourceType).toEqual(new SourceType(SourceTypeName.GEOJSON));
	});

	it('check the constructors arguments', () => {
		expect(() => new Geometry('data', new SourceType(SourceTypeName.WMS))).toThrowError('Unsupported source type: wms');
		expect(() => new Geometry('data')).toThrowError('<sourceType> must be a SourceType');
		expect(() => new Geometry(123, new SourceType(SourceTypeName.GPX))).toThrowError('<data> must be a String');
	});
});
