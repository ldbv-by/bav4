import { BaGeometry } from '../../src/domain/geometry';
import { BaFeature } from '../../src/domain/feature';
import { StyleHint } from '../../src/domain/styles';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';

describe('Feature', () => {
	it('provides a constructor and getters for properties', () => {
		const geometry = new BaGeometry('data', new SourceType(SourceTypeName.EWKT));
		const feature = new BaFeature(geometry, 'id');

		expect(feature.geometry).toEqual(geometry);
		expect(feature.id).toBe('id');
		expect(feature.styleHint).toBeNull();
	});

	it('check the constructors arguments', () => {
		expect(() => new BaFeature('data')).toThrowError('<geometry> must be a Geometry');
		expect(() => new BaFeature(new BaGeometry('data', new SourceType(SourceTypeName.GPX)))).toThrowError('<id> must be a String');
	});

	it('provides set, get and remove methods for properties', () => {
		const geometry = new BaGeometry('data', new SourceType(SourceTypeName.EWKT));
		const feature = new BaFeature(geometry, 'id');

		expect(feature.getProperties()).toEqual({});

		feature.set('foo', 'bar').set('foo', 'bar1').set(123, 123);

		expect(feature.get('foo')).toBe('bar1');
		expect(feature.get('unknown')).toBeNull();
		expect(feature.get(123)).toBeNull();
		expect(feature.getProperties()).toEqual({ foo: 'bar1' });

		feature.remove('foo').remove(123);
		expect(feature.getProperties()).toEqual({});
	});

	it('provides set, get and check methods for a StyleHint', () => {
		const geometry = new BaGeometry('data', new SourceType(SourceTypeName.EWKT));
		const feature = new BaFeature(geometry, 'id');

		expect(feature.hasStyleHint()).toBeFalse();

		feature.setStyleHint(null);

		expect(feature.hasStyleHint()).toBeFalse();

		feature.setStyleHint(StyleHint.HIGHLIGHT);

		expect(feature.hasStyleHint()).toBeTrue();
		expect(feature.styleHint).toBe(StyleHint.HIGHLIGHT);

		feature.setStyleHint(undefined);

		expect(feature.styleHint).toBe(StyleHint.HIGHLIGHT);
	});

	it('provides set, get and check methods for a Style', () => {
		const geometry = new BaGeometry('data', new SourceType(SourceTypeName.EWKT));
		const feature = new BaFeature(geometry, 'id');

		expect(feature.hasStyle()).toBeFalse();

		feature.setStyle(null);

		expect(feature.hasStyle()).toBeFalse();

		feature.setStyle({ baseColor: '#ff0000' });

		expect(feature.hasStyle()).toBeTrue();
		expect(feature.style).toEqual({ baseColor: '#ff0000' });

		feature.setStyle(undefined);

		expect(feature.style).toEqual({ baseColor: '#ff0000' });
	});
});
