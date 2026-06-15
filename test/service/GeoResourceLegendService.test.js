import { $injector } from '@src/injection';
import { bvvGeoResourceLegendProvider } from '@src/services/provider/geoResourceLegend.provider';
import { GeoResourceLegendService, Legend, LegendEntry, LegendEntryType } from '@src/services/GeoResourceLegendService';
import { TestUtils } from '@test/test-utils';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { addLayer } from '@src/store/layers/layers.action';

const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

const environmentServiceMock = {
	isStandalone: () => {}
};

const geoResourceServiceMock = {
	byId: (id) => {
		return { id: id, legend: false };
	}
};

beforeAll(() => {
	TestUtils.setupStoreAndDi(
		{},
		{
			layers: layersReducer
		}
	);
	$injector.registerSingleton('EnvironmentService', environmentServiceMock).registerSingleton('GeoResourceService', geoResourceServiceMock);
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

		const legendWithoutEntries = new Legend('some id', 'label', null);
		expect(legendWithoutEntries.geoResourceId).toBe('some id');
		expect(legendWithoutEntries.label).toBe('label');
		expect(legendWithoutEntries.entries).toEqual([[]]);

		const legendWithEntries = new Legend('some id', 'label', [[legendEntry]]);
		expect(legendWithEntries.geoResourceId).toBe('some id');
		expect(legendWithEntries.label).toBe('label');
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

		vi.spyOn(geoResourceServiceMock, 'byId').mockImplementation((id) => {
			if (id === `layerWithLegend@georesource`) {
				return { id: id, legend: true };
			}

			return { id: id, legend: false };
		});

		addLayer('layer', { geoResourceId: `layer@georesource`, legend: false });
		addLayer('layerWithLegend', { geoResourceId: `layerWithLegend@georesource`, legend: true });
		expect(service.available()).toEqual(['layerWithLegend@georesource']);
	});

	it('returns a Legend', async () => {
		const geoResourceLegendProvider = vi.fn().mockResolvedValue(new Legend(geoResourceId, ''));
		const service = new GeoResourceLegendService(geoResourceLegendProvider);

		const legend = await service.getLegendById(geoResourceId);

		expect(geoResourceLegendProvider).toHaveBeenCalledOnce();
		expect(legend?.geoResourceId).toBe(geoResourceId);
		expect(legend?.entries).toEqual([[]]);
	});

	it('returns a cached Legend', async () => {
		const geoResourceLegendProvider = vi.fn().mockResolvedValue(new Legend(geoResourceId, 'georesource label'));
		const service = new GeoResourceLegendService(geoResourceLegendProvider);
		const providerSpy = vi.spyOn(service, '_provider');

		await service.getLegendById(geoResourceId);
		const cachedLegend = await service.getLegendById(geoResourceId);

		expect(providerSpy).toHaveBeenCalledOnce();
		expect(cachedLegend?.geoResourceId).toBe(geoResourceId);
		expect(cachedLegend?.entries).toEqual([[]]);
	});

	it('returns LegendEntries with specified zoom level', async () => {
		const legendEntries = [
			[new LegendEntry(LegendEntryType.PDF_URL, 'any zoom')],
			[
				new LegendEntry(LegendEntryType.PDF_URL, 'zoom 0'),
				new LegendEntry(LegendEntryType.PDF_URL, 'zoom 1'),
				new LegendEntry(LegendEntryType.PDF_URL, 'zoom 2')
			]
		];
		const geoResourceLegendProvider = vi.fn().mockResolvedValue(new Legend(geoResourceId, 'georesource label', legendEntries));
		const service = new GeoResourceLegendService(geoResourceLegendProvider);
		const legend = await service.getLegendById(geoResourceId);
		const entriesZoom0 = legend?.filterLegendEntriesByZoomLevel(0);
		const entriesZoom1 = legend?.filterLegendEntriesByZoomLevel(1);
		const entriesZoom2 = legend?.filterLegendEntriesByZoomLevel(2);
		const entriesZoom3 = legend?.filterLegendEntriesByZoomLevel(3);

		expect(entriesZoom0.length).toBe(2);
		expect(entriesZoom0[0].urlOrData).toBe('any zoom');
		expect(entriesZoom0[1].urlOrData).toBe('zoom 0');

		expect(entriesZoom1.length).toBe(2);
		expect(entriesZoom1[0].urlOrData).toBe('any zoom');
		expect(entriesZoom1[1].urlOrData).toBe('zoom 1');

		expect(entriesZoom2.length).toBe(2);
		expect(entriesZoom2[0].urlOrData).toBe('any zoom');
		expect(entriesZoom2[1].urlOrData).toBe('zoom 2');

		expect(entriesZoom3.length).toBe(1);
		expect(entriesZoom3[0].urlOrData).toBe('any zoom');
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
