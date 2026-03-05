import { LayerState, SwipeAlignment } from '../../../src/store/layers/layers.action';

describe('layersAction', () => {
	it('exports a enum for SwipeAlignment', () => {
		expect(Object.isFrozen(SwipeAlignment)).toBeTrue();
		expect(Object.keys(SwipeAlignment).length).toBe(3);
		expect(SwipeAlignment.NOT_SET).toBe('b');
		expect(SwipeAlignment.LEFT).toBe('l');
		expect(SwipeAlignment.RIGHT).toBe('r');
	});

	it('exports a enum for LayerState', () => {
		expect(Object.isFrozen(LayerState)).toBeTrue();
		expect(Object.keys(LayerState).length).toBe(4);
		expect(LayerState.OK).toBe('ok');
		expect(LayerState.ERROR).toBe('error');
		expect(LayerState.LOADING).toBe('loading');
		expect(LayerState.INCOMPLETE_DATA).toBe('incomplete_data');
	});
});
