import { LayerInfo } from '../../../../src/modules/layerInfo/services/layerInfo';
import { LayerInfoService } from '../../../../src/modules/layerInfo/services/LayerInfoService';
import { loadBvvLayerInfo } from '../../../../src/services/provider/layerInfo.provider';

const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

describe('LayerInfoService', () => {

	it('initializes the service with default provider', async () => {

		const layerInfoService = new LayerInfoService();

		expect(layerInfoService._provider).toEqual(loadBvvLayerInfo);
	});

	it('should return an object with html content', async () => {

		const loadMockBvvLayerInfo = async () => {
			return { content: '<b>content</b>' };
		};
		const layerInfoSerice = new LayerInfoService(loadMockBvvLayerInfo);

		const result = await layerInfoSerice.byId(geoResourceId);
		const layerInfo = new LayerInfo(result.content);

		expect(layerInfo.content).toBe('<b>content</b>');
		expect(layerInfo.title).toBeNull();
	});

	it('should throw error when backend provides empty payload', async () => {

		const providerErrMsg = 'LayerInfo for \'914c9263-5312-453e-b3eb-5104db1bf788\' could not be loaded';
		const loadMockBvvLayerInfo = async () => {
			return Promise.reject(new Error(providerErrMsg));
		};
		const layerInfoSerice = new LayerInfoService(loadMockBvvLayerInfo);

		try {
			await layerInfoSerice.byId(geoResourceId);
			throw new Error('Promise should not be resolved');
		}
		catch (err) {
			expect(err.message).toBe('Could not load layerinfo from provider: ' + providerErrMsg);
		}
	});
});
