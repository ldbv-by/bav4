import { StyleHint, StyleSize } from '@src/domain/styles';

describe('StyleSize', () => {
	it('is an enum with a value ', () => {
		expect(Object.entries(StyleSize).length).toBe(3);
		expect(Object.isFrozen(StyleSize)).toBe(true);
		expect(StyleSize.LARGE).toEqual('large');
		expect(StyleSize.MEDIUM).toEqual('medium');
		expect(StyleSize.SMALL).toEqual('small');
	});
});
describe('StyleHint', () => {
	it('is an enum with a value ', () => {
		expect(Object.entries(StyleHint).length).toBe(2);
		expect(Object.isFrozen(StyleHint)).toBe(true);
		expect(StyleHint.HIGHLIGHT).toEqual('highlight');
		expect(StyleHint.CLUSTER).toEqual('cluster');
	});
});
