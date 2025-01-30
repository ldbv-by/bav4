import { SwipeAlignment } from '../../../src/store/layers/layers.action';

describe('layersAction', () => {
	it('exports a enum for SwipeAlignment', () => {
		expect(Object.keys(SwipeAlignment).length).toBe(3);
		expect(SwipeAlignment.NOT_SET).toBe('b');
		expect(SwipeAlignment.LEFT).toBe('l');
		expect(SwipeAlignment.RIGHT).toBe('r');
	});
});
