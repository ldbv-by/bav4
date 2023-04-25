import { LLtoUTM, forward } from '../../src/utils/mgrs';

describe('mgrs', () => {
	// no detailed test here, we just check if our needed functions are 
	it('exports all necessary functions', () => {
		expect(typeof LLtoUTM).toBe('function');
		expect(typeof forward).toBe('function');
	});
});
