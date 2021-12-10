import { getBvvIconColor } from '../../../src/services/provider/iconColor.provider';

describe('IconColor provider', () => {

	it('provides a color', () => {

		expect(getBvvIconColor('https://some.url/0,0,0/foo')).toEqual([0, 0, 0]);
		expect(getBvvIconColor('https://some.url/foo/bar/1,2,3/baz')).toEqual([1, 2, 3]);
		expect(getBvvIconColor('https://some.url/foo/bar/1,22,333/baz')).toEqual([1, 22, 333]);
		expect(getBvvIconColor('https://some.url/foo/bar/1/22/333/baz')).toBeNull();

	});
});
