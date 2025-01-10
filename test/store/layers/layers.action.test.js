import { SwipeAlignment } from '../../../src/store/layers/layers.action';

describe('layersAction', () => {
	it('exports a enum for SwipeAlignment', () => {
		expect(Object.keys(SwipeAlignment).length).toBe(3);
		expect(SwipeAlignment.NOT_SET).toBe(0);
		expect(SwipeAlignment.LEFT).toBe(1);
		expect(SwipeAlignment.RIGHT).toBe(2);
	});
});
