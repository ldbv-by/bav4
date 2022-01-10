import { ToolId } from '../../../src/store/tools/tools.action';

describe('toolAction', () => {

	it('exports a ToolId enum', () => {
		expect(Object.keys(ToolId).length).toBe(3);
		expect(Object.isFrozen(ToolId)).toBeTrue();

		expect(ToolId.MEASURING).toBe('measuring');
		expect(ToolId.DRAWING).toBe('drawing');
		expect(ToolId.SHARING).toBe('sharing');
	});
});
