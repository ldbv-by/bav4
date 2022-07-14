import { StyleSizeTypes } from '../../src/domain/styles';


describe('StyleSizeTypes', () => {

	it('is an enum with a value ', () => {
		expect(Object.entries(StyleSizeTypes).length).toBe(3);
		expect(Object.isFrozen(StyleSizeTypes)).toBeTrue();
		expect(StyleSizeTypes.LARGE).toEqual('large');
		expect(StyleSizeTypes.MEDIUM).toEqual('medium');
		expect(StyleSizeTypes.SMALL).toEqual('small');
	});
});
