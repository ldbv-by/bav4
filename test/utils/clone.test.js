import { deepClone } from '../../src/utils/clone';

describe('deepClone', () => {
	it('returns a deep cloned copy of an array or object', () => {
		const o = { foo: 'bar' };
		const a = ['some', 4, { foo: 'bar' }];

		expect(deepClone(o)).toEqual(o);
		expect(deepClone(o) === o).toBeFalse();
		expect(deepClone(a)).toEqual(a);
		expect(deepClone(a) === a).toBeFalse();
	});
});
