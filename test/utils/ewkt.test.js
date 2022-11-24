import { parse } from '../../src/utils/ewkt';

describe('ewkt', () => {

	describe('parse)', () => {

		it('returns an object representation for an ewkt string', () => {
			expect(parse('SRID=4326;POINT(21, 42)')).toEqual({ srid: 4326, wkt: 'POINT(21, 42)' });
			expect(parse('   SRID=4326;POINT(21, 42)   ')).toEqual({ srid: 4326, wkt: 'POINT(21, 42)' });
			expect(parse('POINT(21, 42)')).toBeNull();
			expect(parse('SRID=foo;POINT(21, 42)')).toBeNull();
			expect(parse(';POINT(21, 42)')).toBeNull();
			expect(parse(';')).toBeNull();
			expect(parse('SRID=4326;')).toBeNull();
			expect(parse({})).toBeNull();
			expect(parse([])).toBeNull();
			expect(parse()).toBeNull();
		});
	});
});
