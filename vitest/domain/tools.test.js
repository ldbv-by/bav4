import { Tools, WcTools } from '../../src/domain/tools';

describe('Tools', () => {
	it('provides an enum of all valid path parameters', () => {
		expect(Object.keys(Tools).length).toBe(7);
		expect(Object.isFrozen(Tools)).toBeTrue();

		expect(Tools.MEASURE).toBe('measure');
		expect(Tools.DRAW).toBe('draw');
		expect(Tools.SHARE).toBe('share');
		expect(Tools.IMPORT).toBe('import');
		expect(Tools.EXPORT).toBe('export');
		expect(Tools.ROUTING).toBe('routing');
		expect(Tools.COMPARE).toBe('compare');
	});
});

describe('WcTools', () => {
	it('provides an enum of all valid path parameters', () => {
		expect(WcTools.length).toBe(1);
		expect(Object.isFrozen(WcTools)).toBeTrue();
		expect(WcTools).toEqual([Tools.DRAW]);
	});
});
