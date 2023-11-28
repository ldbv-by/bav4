import { hashCode } from '../../src/utils/hashCode';

describe('hashCode', () => {
	it('provides a hash code for commons types', () => {
		expect(hashCode()).toBe(-1061472734);
		expect(hashCode()).toBe(hashCode());
		expect(hashCode('undefined')).toBe(hashCode('undefined'));

		expect(hashCode(null)).toBe(1008906138);
		expect(hashCode(null)).toBe(hashCode(null));
		expect(hashCode('null')).not.toBe(hashCode(null));

		expect(hashCode(Number.MAX_VALUE)).toBe(1122167623);
		expect(hashCode(Number.MAX_VALUE)).toBe(hashCode(Number.MAX_VALUE));
		expect(hashCode(5)).not.toBe(hashCode(Number.MAX_VALUE));

		expect(hashCode({ foo: 'bar' })).toBe(87056773);
		expect(hashCode({ foo: 'bar' })).toBe(hashCode({ foo: 'bar' }));
		expect(hashCode({ foo: 'ba' })).not.toBe(hashCode({ foo: 'bar' }));

		expect(hashCode(['bar', 4, { foo: 'bar' }])).toBe(-190408593);
		expect(hashCode(['bar', 4, { foo: 'bar' }])).toBe(hashCode(['bar', 4, { foo: 'bar' }]));
		expect(hashCode(['ba', 4, { foo: 'bar' }])).not.toBe(hashCode(['bar', 4, { foo: 'bar' }]));

		expect(hashCode('')).toBe(0);
		expect(hashCode('')).toBe(hashCode(''));
		expect(hashCode('foo')).toBe(101574);
		expect(hashCode('foo')).toBe(hashCode('foo'));
		expect(hashCode('fo')).not.toBe(hashCode('foo'));
	});
});
