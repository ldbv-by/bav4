import { VtLayerRenderingService } from '../../../../src/modules/olMap/services/VtLayerRenderingService';
import { mapLibreRenderingProvider, mapLibreRenderMapProviderFunction } from '../../../../src/modules/olMap/utils/olRendering.provider';

describe('VtLayerRenderingService', () => {
	describe('constructor', () => {
		it('initializes the service with default providers', () => {
			const instanceUnderTest = new VtLayerRenderingService();
			expect(instanceUnderTest._renderingProvider).toEqual(mapLibreRenderingProvider);
			expect(instanceUnderTest._renderMapFactory).toEqual(mapLibreRenderMapProviderFunction);
		});

		it('initializes the service with custom provider', () => {
			const customRenderingProvider = () => {};
			const customRenderMapFunction = () => {};

			const instanceUnderTest = new VtLayerRenderingService(customRenderingProvider, customRenderMapFunction);
			expect(instanceUnderTest._renderingProvider).toEqual(customRenderingProvider);
			expect(instanceUnderTest._renderMapFactory).toEqual(customRenderMapFunction);
		});
	});

	describe('renderLayer', () => {
		it('calls the renderingProvider with correct parameters', async () => {
			const customRenderingProvider = (olLayer, renderMapFactory, mapExtent, mapSize) => {
				// simply pass on all parameters to get it verified
				return { olLayer, renderMapFactory, mapExtent, mapSize };
			};
			const olLayer = {};
			const mapExtent = [21, 21, 42, 42];
			const mapSize = [4, 2];

			const instanceUnderTest = new VtLayerRenderingService(customRenderingProvider);
			const actualParameters = await instanceUnderTest.renderLayer(olLayer, mapExtent, mapSize);
			expect(actualParameters).toEqual({ olLayer, renderMapFactory: mapLibreRenderMapProviderFunction, mapExtent, mapSize });
		});
	});
});
