import { Tools } from '../../src/domain/tools';

describe('Tools', () => {
	it('provides an enum of all valid path parameters', () => {
		expect(Object.keys(Tools).length).toBe(5);

		expect(Tools.MEASURING).toBe('measuring');
		expect(Tools.DRAWING).toBe('drawing');
		expect(Tools.SHARING).toBe('sharing');
		expect(Tools.IMPORT).toBe('import');
		expect(Tools.EXPORT).toBe('export');
	});
});
