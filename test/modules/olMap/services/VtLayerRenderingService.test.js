import { VtLayerRenderingService } from '../../../../src/modules/olMap/services/VtLayerRenderingService';
import { mapLibreRenderingProvider } from '../../../../src/modules/olMap/utils/olRendering.provider';

describe('VtLayerRenderingService', () => {
	describe('constructor', () => {
		it('initializes the service with default providers', () => {
			const instanceUnderTest = new VtLayerRenderingService();
			expect(instanceUnderTest._renderingProvider).toEqual(mapLibreRenderingProvider);
		});

		it('initializes the service with custom provider', () => {
			const customRenderingProvider = () => {};

			const instanceUnderTest = new VtLayerRenderingService(customRenderingProvider);
			expect(instanceUnderTest._renderingProvider).toEqual(customRenderingProvider);
		});
	});

	describe('renderLayer', () => {
		it('calls the renderingProvider with correct parameters', async () => {
			const customRenderingProvider = (olLayer, mapExtent, mapSize) => {
				// simply pass on all parameters to get it verified
				return { olLayer, mapExtent, mapSize };
			};
			const olLayer = {};
			const mapExtent = [21, 21, 42, 42];
			const mapSize = [4, 2];

			const instanceUnderTest = new VtLayerRenderingService(customRenderingProvider);
			const actualParameters = await instanceUnderTest.renderLayer(olLayer, mapExtent, mapSize);
			expect(actualParameters).toEqual({ olLayer, mapExtent, mapSize });
		});
	});
});
