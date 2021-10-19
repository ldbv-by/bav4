import { StyleSizeTypes } from '../../../src/services/domain/styles';


describe('StyleSizeTypes', () => {

	it('is an enum with a value ', () => {
		expect(Object.entries(StyleSizeTypes).length).toBe(3);
		expect(Object.isFrozen(StyleSizeTypes)).toBeTrue();
		expect(StyleSizeTypes.BIG).toEqual('big');
		expect(StyleSizeTypes.MEDIUM).toEqual('medium');
		expect(StyleSizeTypes.SMALL).toEqual('small');
	});
});
