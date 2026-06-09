import { $injector } from '@src/injection';
import { bvvGeoResourceLegendProvider } from '@src/services/provider/geoResourceLegend.provider';
import { GeoResourceLegendService, LegendEntryType } from '@src/services/GeoResourceLegendService';
import { TestUtils } from '@test/test-utils';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { addLayer } from '@src/store/layers/layers.action';

const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

const environmentService = {
	isStandalone: () => {}
};

beforeAll(() => {
	TestUtils.setupStoreAndDi(
		{},
		{
			layers: layersReducer
		}
	);
	$injector.registerSingleton('EnvironmentService', environmentService);
});

describe('GeoResourceLegendService', () => {
	it('initializes the service with default provider', async () => {
		const instanceUnderTest = new GeoResourceLegendService();
		expect(instanceUnderTest._provider).toEqual(bvvGeoResourceLegendProvider);
	});

	it('initializes the service with custom provider', async () => {
		const customProvider = async () => {};
		const instanceUnderTest = new GeoResourceLegendService(customProvider);
		expect(instanceUnderTest._provider).toEqual(customProvider);
	});

	it('has all LegendEntryTyped defined', () => {
		expect(Object.isFrozen(LegendEntryType)).toBe(true);
		expect(LegendEntryType).toEqual({
			IMAGE_BASE64: 'IMAGE_BASE64',
			IMAGE_URL: 'IMAGE_URL',
			PDF_URL: 'PDF_URL',
			HTML: 'HTML'
		});
	});

	it('gets all georesources containing a legend', async () => {
		const service = new GeoResourceLegendService(() => {
			return null;
		});

		addLayer('layer', { geoResourceId: `layer@georesource`, legend: false });
		addLayer('layerWithLegend', { geoResourceId: `layerWithLegend@georesource`, legend: true });
		expect(service.available()).toEqual(['layerWithLegend@georesource']);
	});

	it('returns a Legend', async () => {
		const jsonProviderMock = async () => {
			return `{ "geoResourceId": "${geoResourceId}" , "entries": [[]] }`;
		};
		const service = new GeoResourceLegendService(jsonProviderMock);
		const providerSpy = vi.spyOn(service, '_provider');
		const legend = await service.getLegendById(geoResourceId);

		expect(providerSpy).toHaveBeenCalledOnce();
		expect(legend).toEqual({ geoResourceId: geoResourceId, entries: [[]] });
	});

	it('returns a cached Legend', async () => {
		const jsonProviderMock = async () => {
			return `{ "geoResourceId": "${geoResourceId}" , "entries": [[]] }`;
		};
		const service = new GeoResourceLegendService(jsonProviderMock);
		const providerSpy = vi.spyOn(service, '_provider');

		await service.getLegendById(geoResourceId);
		const cachedLegend = await service.getLegendById(geoResourceId);

		expect(providerSpy).toHaveBeenCalledOnce();
		expect(cachedLegend).toEqual({ geoResourceId: geoResourceId, entries: [[]] });
	});
});
