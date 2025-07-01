import { DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS } from '../../src/domain/layer';

describe('layer', () => {
	it('exports constant values', () => {
		expect(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS).toBe(5);
	});
});
