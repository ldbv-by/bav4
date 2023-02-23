import { getTopLeft } from 'ol/extent';
import { AdvWmtsTileGrid } from '../../../../../src/modules/olMap/ol/tileGrid/AdvWmtsTileGrid';

describe('AdvWmtsTileGrid', () => {
	const extent = [-46133.17, 5048875.26857567, 1206211.10142433, 6301219.54];

	const resolutions = [
		4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.874056570353, 76.4370282851763, 38.2185141425881,
		19.1092570712941, 9.55462853564703, 4.77731426782352, 2.38865713391176, 1.19432856695588, 0.597164283477939, 0.2985821417389695,
		0.14929107086948476
	];

	describe('constructor', () => {
		it('initializes an instance with correct parameters', async () => {
			const instanceUnderTest = new AdvWmtsTileGrid();

			expect(instanceUnderTest.getMinZoom()).toBe(0);
			expect(instanceUnderTest.getOrigin()).toEqual[getTopLeft(extent)];
			expect(instanceUnderTest.getResolutions()).toEqual(resolutions);
			expect(instanceUnderTest.getExtent()).toEqual(extent);
			expect(instanceUnderTest.getTileSize()).toBe(256);
		});
	});
});
