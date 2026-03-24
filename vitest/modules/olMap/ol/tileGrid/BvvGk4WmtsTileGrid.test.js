import { getTopLeft } from 'ol/extent';
import { BvvGk4WmtsTileGrid } from '../../../../../src/modules/olMap/ol/tileGrid/BvvGk4WmtsTileGrid';

describe('BvvGk4WmtsTileGrid', () => {
	const extent = [3925712.0, 4875712.0, 4974288.0, 5924288.0];

	const resolutions = [4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125];

	describe('constructor', () => {
		it('initializes an instance with correct parameters', async () => {
			const instanceUnderTest = new BvvGk4WmtsTileGrid();

			expect(instanceUnderTest.getMinZoom()).toBe(0);
			expect(instanceUnderTest.getOrigin()).toEqual[getTopLeft(extent)];
			expect(instanceUnderTest.getResolutions()).toEqual(resolutions);
			expect(instanceUnderTest.getExtent()).toEqual(extent);
			expect(instanceUnderTest.getTileSize()).toBe(256);
		});
	});
});
