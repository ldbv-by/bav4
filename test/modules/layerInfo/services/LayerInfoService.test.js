import { LayerInfoService } from '../../../../src/modules/layerInfo/services/LayerInfoService';

describe('LayerInfoService', () => {

	it('should return an object with html content', async () => {

		const loadMockBvvLayerInfo = async () => {
			return { content: '<b>content</b>' };
		};

		const layerInfoSerice = new LayerInfoService(loadMockBvvLayerInfo);
		const layerInfo = await layerInfoSerice.byId();

		expect(layerInfo.content).toBe('<b>content</b>');
		expect(layerInfo.title).toBe(null);
	});

	it('should return null if no result is fetched', async () => {

		const loadMockBvvLayerInfo = async () => {
			return null;
		};

		const layerInfoSerice = new LayerInfoService(loadMockBvvLayerInfo);
		const layerInfo = await layerInfoSerice.byId();

		expect(layerInfo).toBe(null);
	});
});
