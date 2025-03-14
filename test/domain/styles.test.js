import { StyleHint, StyleSize } from '../../src/domain/styles';

describe('StyleSize', () => {
	it('is an enum with a value ', () => {
		expect(Object.entries(StyleSize).length).toBe(3);
		expect(Object.isFrozen(StyleSize)).toBeTrue();
		expect(StyleSize.LARGE).toEqual('large');
		expect(StyleSize.MEDIUM).toEqual('medium');
		expect(StyleSize.SMALL).toEqual('small');
	});
});
describe('StyleHint', () => {
	it('is an enum with a value ', () => {
		expect(Object.entries(StyleHint).length).toBe(1);
		expect(Object.isFrozen(StyleHint)).toBeTrue();
		expect(StyleHint.HIGHLIGHT).toEqual('highlight');
	});
});
