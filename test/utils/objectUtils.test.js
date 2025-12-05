import { removeUndefinedProperties } from '../../src/utils/objectUtils';

describe('provides utils for objects', () => {
	it('removes undefined properties from an object', () => {
		expect(removeUndefinedProperties({})).toEqual({});
		expect(removeUndefinedProperties({ foo: 'bar', some: undefined })).toEqual({ foo: 'bar' });
	});
});
