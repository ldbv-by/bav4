import { $injector } from '@src/injection';
import { GeoResourceAuthenticationType, WmsGeoResource } from '@src/domain/geoResources';
import { SourceType, SourceTypeName } from '@src/domain/sourceType';
import { bvvCapabilitiesProvider, supportedGetMapMediaTypes, _determinePreferredFormat } from '@src/services/provider/wmsCapabilities.provider';
import { MediaType } from '@src/domain/mediaTypes';

const Default_Capabilities_Result = {
	title: 'The Title',
	provider: 'The Provider',
	serviceType: 'WMS_1_1_1',
	formatsGetMap: ['image/png'],
	formatsGetFeatureInfo: ['text/html'],
	formatsGetLegendGraphic: ['image/png'],
	onlineResourceGetMap: 'https://online.resource/GetMap?',
	onlineResourceGetFeatureInfo: 'https://online.resource/GetFeatureInfo?',
	onlineResourceGetLegendGraphic: 'https://online.resource/GetLegendGraphic?',
	metadataUrlService: 'metadataUrlService',
	layers: [
		{
			name: 'layer0',
			title: 'Layer 0',
			description: 'The description of layer 0',
			minResolution: 8192.0,
			maxResolution: 0.0,
			legendUrl: 'https://legend.url/0',
			metadataUrl: 'https://metadata.url/0',
			queryable: true,
			referenceSystems: [
				{
					code: 31467,
					urn: false,
					axisOrderLatLong: false,
					value: 'EPSG:31467'
				},
				{
					code: 25832,
					urn: false,
					axisOrderLatLong: false,
					value: 'EPSG:25832'
				},
				{
					code: 3857,
					urn: false,
					axisOrderLatLong: false,
					value: 'EPSG:3857'
				},
				{
					code: 31468,
					urn: false,
					axisOrderLatLong: true,
					value: 'EPSG:31468'
				}
			]
		},
		{
			name: 'layer1',
			title: 'Layer 1',
			description: 'The description of layer 1',
			minResolution: 8192.0,
			maxResolution: 0.0,
			legendUrl: 'https://legend.url/1',
			metadataUrl: 'https://metadata.url/1',
			queryable: false,
			referenceSystems: [
				{
					code: 31467,
					urn: false,
					axisOrderLatLong: false,
					value: 'EPSG:31467'
				},
				{
					code: 3857,
					urn: false,
					axisOrderLatLong: false,
					value: 'EPSG:3857'
				},
				{
					code: 31468,
					urn: false,
					axisOrderLatLong: true,
					value: 'EPSG:31468'
				}
			]
		},
		{
			name: 'layer2',
			title: 'Layer 2',
			description: 'The description of layer 2',
			minResolution: 8192.0,
			maxResolution: 0.0,
			legendUrl: 'https://legend.url/1',
			metadataUrl: 'https://metadata.url/1',
			queryable: false,
			referenceSystems: [
				{
					code: 31467,
					urn: false,
					axisOrderLatLong: false,
					value: 'EPSG:31467'
				},
				{
					code: 31468,
					urn: false,
					axisOrderLatLong: true,
					value: 'EPSG:31468'
				}
			]
		}
	]
};

describe('supportedGetMapMediaTypes', () => {
	it('provides an ordered array of supported media types', () => {
		expect(supportedGetMapMediaTypes).toEqual([
			'image/webp',
			'image/png',
			'image/gif',
			'image/jpeg', // no transparency
			'image/svg+xml' // experimental
		]);
	});
});

describe('_determinePreferredFormat', () => {
	it('returns an ordered array of supported media types', () => {
		expect(_determinePreferredFormat()).toEqual([]);
		expect(_determinePreferredFormat('foo')).toEqual([]);
		expect(_determinePreferredFormat([])).toEqual([]);
		expect(_determinePreferredFormat(['foo'])).toEqual([]);
		expect(_determinePreferredFormat(['image/jpeg', 'image/tiff', 'image/png'])).toEqual(['image/png', 'image/jpeg']);
	});

	it('logs a warn statement when no supported mediy types are found', async () => {
		const warnSpy = vi.spyOn(console, 'warn');

		expect(_determinePreferredFormat(['foo'])).toEqual([]);

		expect(warnSpy).toHaveBeenCalledWith(`No supported media type found. Valid media types are: ${supportedGetMapMediaTypes}`);
	});
});

describe('bvvCapabilitiesProvider', () => {
	const configService = {
		getValueAsPath() {}
	};

	const httpService = {
		async post() {}
	};

	const mapService = {
		getSrid: () => 3857,
		getLocalProjectedSrid: () => 25832
	};

	const baaCredentialService = {
		get() {}
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService)
			.registerSingleton('MapService', mapService)
			.registerSingleton('BaaCredentialService', baaCredentialService);
	});

	it('use services to build a backend request', () => {
		const url = 'https://some.url/wms';

		const responseMock = {
			ok: true,
			status: 200,
			json: () => {
				return { layers: [] };
			}
		};
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const configSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpSpy = vi.spyOn(httpService, 'post').mockResolvedValue(responseMock);

		bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: false, ids: [], layers: [] });

		expect(configSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpSpy).toHaveBeenCalledWith('BACKEND_URL/wms/getCapabilities', JSON.stringify({ url: url }), MediaType.JSON);
	});

	it('use services to build a backend request with credentials', () => {
		const url = 'https://some.url/wms';
		const username = 'foo';
		const password = 'bar';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const responseMock = {
			ok: true,
			status: 200,
			json: () => {
				return { layers: [] };
			}
		};

		const configSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpSpy = vi.spyOn(httpService, 'post').mockResolvedValue(responseMock);
		const baaCredentialSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username: username, password: password });

		bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: true, ids: [], layers: [] });

		expect(configSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpSpy).toHaveBeenCalledWith(
			'BACKEND_URL/wms/getCapabilities',
			JSON.stringify({ url: url, username: username, password: password }),
			MediaType.JSON
		);
		expect(baaCredentialSpy).toHaveBeenCalledWith(url);
	});

	it("handles the import options 'isAuthenticated'", async () => {
		const url = 'https://some.url/wms';
		const username = 'foo';
		const password = 'bar';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const responseMock = {
			ok: true,
			status: 200,
			json: () => {
				return Default_Capabilities_Result;
			}
		};
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(responseMock);
		vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username: username, password: password });

		const wmsGeoResources = await bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: true, ids: [], layers: [] });

		expect(wmsGeoResources).toHaveLength(2);
		expect(wmsGeoResources).toEqual(expect.arrayContaining([expect.any(WmsGeoResource), expect.any(WmsGeoResource)]));
		expect(wmsGeoResources).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ authenticationType: GeoResourceAuthenticationType.BAA }),
				expect.objectContaining({ authenticationType: GeoResourceAuthenticationType.BAA })
			])
		);
		expect(httpServiceSpy).toHaveBeenCalledWith(
			'BACKEND_URL/wms/getCapabilities',
			JSON.stringify({ url: url, username: username, password: password }),
			MediaType.JSON
		);
	});

	it('maps wmsGeoResource with valid properties from layer ', async () => {
		const url = 'https://some.url/wms';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const responseMock = {
			ok: true,
			status: 200,
			json: () => {
				return Default_Capabilities_Result;
			}
		};
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(responseMock);

		const wmsGeoResources = await bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: false, ids: [], layers: [] });

		expect(wmsGeoResources).toHaveLength(2);
		expect(wmsGeoResources[0]).toEqual(
			expect.objectContaining({
				id: `${url}||layer0||Layer 0`,
				label: 'Layer 0',
				url: 'https://online.resource/GetMap?',
				format: 'image/png',
				queryable: true,
				authenticationType: null,
				exportable: true
			})
		);
		expect(wmsGeoResources[1]).toEqual(
			expect.objectContaining({
				id: `${url}||layer1||Layer 1`,
				label: 'Layer 1',
				url: 'https://online.resource/GetMap?',
				format: 'image/png',
				queryable: false,
				authenticationType: null,
				exportable: false
			})
		);
		expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/wms/getCapabilities', JSON.stringify({ url: url }), MediaType.JSON);
	});

	it('returns just a subset of all available WmsGeoResources filtered by layer name', async () => {
		const layerName = 'layer1';
		const url = 'https://some.url/wms';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const responseMock = {
			ok: true,
			status: 200,
			json: () => {
				return Default_Capabilities_Result;
			}
		};
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(responseMock);

		const wmsGeoResources = await bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: false, ids: [], layers: [layerName] });

		expect(wmsGeoResources).toHaveLength(1);
		expect(wmsGeoResources[0]).toEqual(
			expect.objectContaining({
				id: `${url}||layer1||Layer 1`,
				label: 'Layer 1',
				url: 'https://online.resource/GetMap?',
				format: 'image/png',
				queryable: false,
				authenticationType: null,
				layers: layerName,
				exportable: false
			})
		);
		expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/wms/getCapabilities', JSON.stringify({ url: url }), MediaType.JSON);
	});

	it('returns WmsGeoResource with custom ids', async () => {
		const layerId0 = 'myLayerId0';
		const layerId1 = 'myLayerId1';
		const url = 'https://some.url/wms';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const responseMock = {
			ok: true,
			status: 200,
			json: () => {
				return Default_Capabilities_Result;
			}
		};
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(responseMock);

		const wmsGeoResources = await bvvCapabilitiesProvider(url, {
			sourceType: sourceType,
			isAuthenticated: false,
			ids: [layerId0, layerId1],
			layers: []
		});

		expect(wmsGeoResources).toHaveLength(2);
		expect(wmsGeoResources[0]).toEqual(
			expect.objectContaining({
				id: layerId0,
				label: 'Layer 0',
				url: 'https://online.resource/GetMap?',
				format: 'image/png',
				queryable: true,
				authenticationType: null,
				exportable: true
			})
		);
		expect(wmsGeoResources[1]).toEqual(
			expect.objectContaining({
				id: layerId1,
				label: 'Layer 1',
				url: 'https://online.resource/GetMap?',
				format: 'image/png',
				queryable: false,
				authenticationType: null,
				exportable: false
			})
		);
		expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/wms/getCapabilities', JSON.stringify({ url: url }), MediaType.JSON);
	});

	it('recognize extraParams from layers', async () => {
		const url = 'https://some.url/wms';
		const username = 'foo';
		const password = 'bar';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const responseMock = {
			ok: true,
			status: 200,
			json: () => {
				return { ...Default_Capabilities_Result, maxHeight: 2000, maxWidth: 2000 };
			}
		};
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(responseMock);
		vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username: username, password: password });

		const wmsGeoResources = await bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: true, ids: [], layers: [] });

		expect(wmsGeoResources).toHaveLength(2);
		expect(wmsGeoResources).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ extraParams: { maxHeight: 2000, maxWidth: 2000 } }),
				expect.objectContaining({ extraParams: { maxHeight: 2000, maxWidth: 2000 } })
			])
		);
		expect(httpServiceSpy).toHaveBeenCalledWith(
			'BACKEND_URL/wms/getCapabilities',
			JSON.stringify({ url: url, username: username, password: password }),
			MediaType.JSON
		);
	});

	it('throws an error on missing credential', async () => {
		const url = 'https://some.url/wms';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const failedResponseMock = { ok: false, status: 420 };
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(failedResponseMock);
		vi.spyOn(baaCredentialService, 'get').mockReturnValue(null);

		expect(bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: true, ids: [], layers: [] })).rejects.toThrow(
			"Import of WMS failed. Credential for 'https://some.url/wms' not found."
		);
		expect(httpServiceSpy).not.toHaveBeenCalled();
	});

	it('throws an error on failed request', async () => {
		const url = 'https://some.url/wms';
		const username = 'foo';
		const password = 'bar';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const failedResponseMock = { ok: false, status: 420 };
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(failedResponseMock);
		vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username: username, password: password });

		expect(bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: true, ids: [], layers: [] })).rejects.toThrow(
			"GeoResource for 'https://some.url/wms' could not be loaded: Http-Status 420"
		);
		expect(httpServiceSpy).toHaveBeenCalledWith(
			'BACKEND_URL/wms/getCapabilities',
			JSON.stringify({ url: url, username: username, password: password }),
			MediaType.JSON
		);
	});

	it('returns empty list for 404-response', async () => {
		const url = 'https://some.url/wms';
		const username = 'foo';
		const password = 'bar';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const emptyResponseMock = { ok: false, status: 404 };
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(emptyResponseMock);
		vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username: username, password: password });

		const wmsGeoResources = await bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: true, ids: [], layers: [] });

		expect(wmsGeoResources).toEqual([]);
		expect(httpServiceSpy).toHaveBeenCalledWith(
			'BACKEND_URL/wms/getCapabilities',
			JSON.stringify({ url: url, username: username, password: password }),
			MediaType.JSON
		);
	});

	it('returns empty list for capabilities with invalid content', async () => {
		const url = 'https://some.url/wms';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const responseMock = {
			ok: true,
			status: 200,
			json: () => {
				return { ...Default_Capabilities_Result, layers: null };
			}
		};
		vi.spyOn(mapService, 'getSrid').mockReturnValue(42);
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(responseMock);

		const wmsGeoResources = await bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: false, ids: [], layers: [] });

		expect(wmsGeoResources).toEqual([]);
		expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/wms/getCapabilities', JSON.stringify({ url: url }), MediaType.JSON);
	});

	it('returns empty list for capabilities with unsupported getMap media types', async () => {
		const url = 'https://some.url/wms';
		const sourceType = new SourceType(SourceTypeName.WMS, '42');
		const responseMock = {
			ok: true,
			status: 200,
			json: () => {
				return { ...Default_Capabilities_Result, formatsGetMap: ['unsupported'] };
			}
		};
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(responseMock);

		const wmsGeoResources = await bvvCapabilitiesProvider(url, { sourceType: sourceType, isAuthenticated: false, ids: [], layers: [] });

		expect(wmsGeoResources).toEqual([]);
		expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/wms/getCapabilities', JSON.stringify({ url: url }), MediaType.JSON);
	});
});
