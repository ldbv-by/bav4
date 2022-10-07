import { getTopLeft } from 'ol/extent';
import { AdvWmtsTileGrid } from '../../../../../src/modules/olMap/ol/tileGrid/AdvWmtsTileGrid';

describe('AdvWmtsTileGrid', () => {

	const extent = [-46133.17, 5048875.26857567, 1206211.10142433, 6301219.54];

	const resolutions = [
		4891.969810251280,
		2445.984905125640,
		1222.992452562820,
		611.4962262814100,
		305.7481131407050,
		152.8740565703530,
		76.43702828517630,
		38.21851414258810,
		19.10925707129410,
		9.554628535647030,
		4.777314267823520,
		2.388657133911760,
		1.194328566955880,
		0.5971642834779390,
		0.2985821417389695,
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
