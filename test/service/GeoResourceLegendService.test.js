import { $injector } from '@src/injection';
import { bvvGeoResourceLegendProvider } from '@src/services/provider/geoResourceLegend.provider';
import { GeoResourceLegendService, Legend, LegendEntry, LegendEntryType } from '@src/services/GeoResourceLegendService';
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

	it('constructs service objects correctly', async () => {
		const legendEntry = new LegendEntry(LegendEntryType.HTML, 'foo');
		expect(legendEntry.type).toBe(LegendEntryType.HTML);
		expect(legendEntry.urlOrData).toBe('foo');

		const legendWithoutEntries = new Legend('some id', null);
		expect(legendWithoutEntries.geoResourceId).toBe('some id');
		expect(legendWithoutEntries.entries).toEqual([[]]);

		const legendWithEntries = new Legend('some id', [[legendEntry]]);
		expect(legendWithEntries.geoResourceId).toBe('some id');
		expect(legendWithEntries.entries).toEqual([[legendEntry]]);
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
		const geoResourceLegendProvider = vi.fn().mockResolvedValue(new Legend(geoResourceId));
		const service = new GeoResourceLegendService(geoResourceLegendProvider);

		const legend = await service.getLegendById(geoResourceId);

		expect(geoResourceLegendProvider).toHaveBeenCalledOnce();
		expect(legend?.geoResourceId).toBe(geoResourceId);
		expect(legend?.entries).toEqual([[]]);
	});

	it('returns a cached Legend', async () => {
		const geoResourceLegendProvider = vi.fn().mockResolvedValue(new Legend(geoResourceId, [[]]));
		const service = new GeoResourceLegendService(geoResourceLegendProvider);
		const providerSpy = vi.spyOn(service, '_provider');

		await service.getLegendById(geoResourceId);
		const cachedLegend = await service.getLegendById(geoResourceId);

		expect(providerSpy).toHaveBeenCalledOnce();
		expect(cachedLegend?.geoResourceId).toBe(geoResourceId);
		expect(cachedLegend?.entries).toEqual([[]]);
	});

	it('returns null when no legend found', async () => {
		const geoResourceLegendProvider = vi.fn().mockResolvedValue(null);
		const service = new GeoResourceLegendService(geoResourceLegendProvider);

		const legend = await service.getLegendById(geoResourceId);

		expect(geoResourceLegendProvider).toHaveBeenCalledOnce();
		expect(legend).toBe(null);
	});

	it('throws on unexpected response', async () => {
		const providerError = new Error('Http-Status 500');
		const geoResourceLegendProvider = vi.fn().mockThrow(providerError);
		const service = new GeoResourceLegendService(geoResourceLegendProvider);

		await expect(service.getLegendById(geoResourceId)).rejects.toEqual(
			expect.objectContaining({
				message: 'Could not load a Legend from provider',
				cause: providerError
			})
		);
		expect(geoResourceLegendProvider).toHaveBeenCalledOnce();
	});
});
