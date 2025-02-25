import { Geometry } from '../../src/domain/geometry';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';

describe('Geometry', () => {
	it('provides a constructor and getters for properties', () => {
		const geometry = new Geometry('data', new SourceType(SourceTypeName.GPX));

		expect(geometry.data).toBe('data');
		expect(geometry.sourceType).toEqual(new SourceType(SourceTypeName.GPX));
		expect(new Geometry('data').sourceType).toBeNull();
	});

	it('check the constructors arguments', () => {
		expect(() => new Geometry('data', 'Foo')).toThrowError('Unsupported source type: Foo');
		expect(() => new Geometry(123, new SourceType(SourceTypeName.GPX))).toThrowError('<data> must be a String');
	});
});
