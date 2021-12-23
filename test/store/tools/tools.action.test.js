import { Tool } from '../../../src/store/tools/tools.action';

describe('toolAction', () => {

	it('exports a ToolKey enum', () => {
		expect(Object.keys(Tool).length).toBe(3);
		expect(Object.isFrozen(Tool)).toBeTrue();

		expect(Tool.MEASURING).toBe('measuring');
		expect(Tool.DRAWING).toBe('drawing');
		expect(Tool.SHARING).toBe('sharing');
	});
});
