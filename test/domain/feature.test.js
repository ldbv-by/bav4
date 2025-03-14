import { Geometry } from '../../src/domain/geometry';
import { Feature } from '../../src/domain/feature';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';

describe('Feature', () => {
	it('provides a constructor and getters for properties', () => {
		const geometry = new Geometry('data', new SourceType(SourceTypeName.EWKT));
		const feature = new Feature(geometry, 'id');

		expect(feature.geometry).toEqual(geometry);
		expect(feature.id).toBe('id');
	});

	it('check the constructors arguments', () => {
		expect(() => new Feature('data')).toThrowError('<geometry> must be a Geometry');
		expect(() => new Feature(new Geometry('data', new SourceType(SourceTypeName.GPX)))).toThrowError('<id> must be a String');
	});

	it('provides set, get and remove methods for properties', () => {
		const geometry = new Geometry('data', new SourceType(SourceTypeName.EWKT));
		const feature = new Feature(geometry, 'id');

		feature.set('foo', 'bar').set('foo', 'bar1').set(123, 123);

		expect(feature.get('foo')).toBe('bar1');
		expect(feature.get('unknown')).toBeNull();
		expect(feature.get(123)).toBeNull();
		expect(feature.getProperties()).toEqual({ foo: 'bar1' });

		feature.remove('foo').remove(123);
		expect(feature.getProperties()).toEqual({});
	});
});
