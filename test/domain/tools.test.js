import { Tools } from '../../src/domain/tools';

describe('Tools', () => {
	it('provides an enum of all valid path parameters', () => {
		expect(Object.keys(Tools).length).toBe(6);

		expect(Tools.MEASURE).toBe('measure');
		expect(Tools.DRAW).toBe('draw');
		expect(Tools.SHARE).toBe('share');
		expect(Tools.IMPORT).toBe('import');
		expect(Tools.EXPORT).toBe('export');
		expect(Tools.ROUTING).toBe('routing');
	});
});
