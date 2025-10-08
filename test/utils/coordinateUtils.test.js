import { fromString } from '../../src/utils/coordinateUtils.js';

describe('Unit test functions from coordinateUtils.js', () => {
	describe('fromString', () => {
		it('parses a coordinate from a string', () => {
			expect(fromString('1,2.3456')).toEqual([1, 2.3456]);
			expect(fromString('1#2.3456', '#')).toEqual([1, 2.3456]);
			expect(fromString()).toBeNull();
			expect(fromString('1,foo')).toBeNull();
			expect(fromString('1')).toBeNull();
			expect(fromString('Infinity,123')).toBeNull();
			expect(fromString('Infinity,NaN')).toBeNull();
		});
	});
});
