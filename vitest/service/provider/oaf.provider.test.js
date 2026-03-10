import { $injector } from '@src/injection';
import { bvvOafFilterCapabilitiesProvider, bvvOafGeoResourceProvider } from '@src/services/provider/oaf.provider';
import { MediaType } from '@src/domain/mediaTypes';
import { GeoResourceAuthenticationType, OafGeoResource } from '@src/domain/geoResources';

describe('bvvOafFilterCapabilitiesProvider', () => {
	const configService = {
		getValueAsPath() {}
	};

	const httpService = {
		async post() {}
	};

	const baaCredentialService = {
		get() {}
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService)
			.registerSingleton('BaaCredentialService', baaCredentialService);
	});

	afterAll(() => {
		$injector.reset();
	});

	const mockResponsePayload = {
		totalNumberOfItems: 10000,
		sampled: true,
		queryables: [
			{
				id: 'h_id',
				title: 'ID',
				description: 'The identifier',
				type: 'integer',
				values: [5, 36, 37],
				finalized: false,
				minValue: 0,
				maxValue: 1007029
			},
			{
				id: 'datum',
				type: 'date',
				values: ['1992-01-15', '2000-01-01', '1998-09-14'],
				finalized: false
			},
			{
				id: 'gemeinde_code',
				type: 'string',
				values: ['671139', '674147'],
				pattern: '^\\d{5}$',
				finalized: false
			},
			{
				id: 'gemeinde_name',
				type: 'string',
				values: ['Laufach', 'Haßfurt', 'Schweinfurt'],
				finalized: false
			}
		]
	};

	it('returns the OafFilterCapabilities for a OafGeoResource', async () => {
		const url = 'https://some.url/oaf';
		const collectionId = 'collectionId';
		const oafGeoResource = new OafGeoResource('id', 'label', url, collectionId, 12345);
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));

		const result = await bvvOafFilterCapabilitiesProvider(oafGeoResource);

		expect(result).toEqual(mockResponsePayload);
		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/oaf/getFilterCapabilities', JSON.stringify({ url, collectionId }), MediaType.JSON, {
			timeout: 20_000
		});
	});

	describe('OAF service has basic authorization', () => {
		it('returns the OafFilterCapabilities for a BAA-restricted OafGeoResource', async () => {
			const url = 'https://some.url/oaf';
			const collectionId = 'collectionId';
			const username = 'foo';
			const password = 'bar';
			const oafGeoResource = new OafGeoResource('id', 'label', url, collectionId, 12345).setAuthenticationType(GeoResourceAuthenticationType.BAA);
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));
			const baaCredentialSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username, password });

			const result = await bvvOafFilterCapabilitiesProvider(oafGeoResource);

			expect(result).toEqual(mockResponsePayload);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(
				'BACKEND_URL/oaf/getFilterCapabilities',
				JSON.stringify({ url, collectionId, username, password }),
				MediaType.JSON,
				{
					timeout: 20_000
				}
			);
			expect(baaCredentialSpy).toHaveBeenCalledWith(url);
		});

		it('rejects with an error when credentials are not available', async () => {
			const url = 'https://some.url/oaf';
			const collectionId = 'collectionId';
			const username = 'foo';
			const password = 'bar';
			const oafGeoResource = new OafGeoResource('id', 'label', url, collectionId).setAuthenticationType(GeoResourceAuthenticationType.BAA);
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));
			const baaCredentialSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(null);

			expect(bvvOafFilterCapabilitiesProvider(oafGeoResource)).rejects.toThrow(
				"Fetching of filter capabilities failed. Credential for 'https://some.url/oaf' not found"
			);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).not.toHaveBeenCalledWith(
				'BACKEND_URL/oaf/getFilterCapabilities',
				JSON.stringify({ url, collectionId, username, password }),
				MediaType.JSON,
				{
					timeout: 20_000
				}
			);
			expect(baaCredentialSpy).toHaveBeenCalledWith(url);
		});
	});

	describe('OafFilterCapabilities endpoint responds with any other HTTP status', () => {
		it('rejects with an error ', async () => {
			const url = 'https://some.url/oaf';
			const collectionId = 'collectionId';
			const oafGeoResource = new OafGeoResource('id', 'label', url, collectionId);
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 400 }));

			expect(bvvOafFilterCapabilitiesProvider(oafGeoResource)).rejects.toThrow(
				"Filter capabilities for 'https://some.url/oaf' could not be loaded: Http-Status 400"
			);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/oaf/getFilterCapabilities', JSON.stringify({ url, collectionId }), MediaType.JSON, {
				timeout: 20_000
			});
		});
	});
});

describe('bvvOafGeoResourceProvider', () => {
	const configService = {
		getValueAsPath() {}
	};

	const httpService = {
		async post() {}
	};

	const projectionService = {
		getProjections: () => [3857, 4326]
	};

	const baaCredentialService = {
		get() {}
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService)
			.registerSingleton('ProjectionService', projectionService)
			.registerSingleton('BaaCredentialService', baaCredentialService);
	});

	afterAll(() => {
		$injector.reset();
	});

	const mockResponsePayload = [
		{
			id: 'id0',
			title: 'title0',
			url: 'http://url0/collections/id0',
			totalNumberOfItems: 21,
			srid: 3857,
			crs: 'http://www.opengis.net/def/crs/EPSG/0/3857',
			apiLevel: 1
		},
		{
			id: 'id1',
			title: 'title1',
			url: 'http://url1/collections/id1',
			totalNumberOfItems: 42,
			srid: 4326,
			crs: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84',
			apiLevel: 2
		},
		{
			id: 'id2',
			title: 'title2',
			url: 'http://url2/collections/id2',
			totalNumberOfItems: 42,
			srid: 55555,
			crs: 'http://www.opengis.net/def/crs/EPSG/0/5555',
			apiLevel: 3
		}
	];

	const defaultImportOafOptions = {
		isAuthenticated: false,
		collections: [],
		ids: []
	};

	it('returns a OafGeoResource for each OAF collection without extra ImportOafOptions', async () => {
		const url = 'https://some.url/oaf';
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));

		const result = await bvvOafGeoResourceProvider(url, defaultImportOafOptions);

		expect(result).toHaveLength(2);
		expect(result[0].id).toBe('http://url0/||id0');
		expect(result[0].label).toBe('title0');
		expect(result[0].collectionId).toBe('id0');
		expect(result[0].srid).toBe(3857);
		expect(result[0].crs).toBe('http://www.opengis.net/def/crs/EPSG/0/3857');
		expect(result[0].limit).toBe(21);
		expect(result[0].apiLevel).toBe(1);

		expect(result[1].id).toBe('http://url1/||id1');
		expect(result[1].label).toBe('title1');
		expect(result[1].collectionId).toBe('id1');
		expect(result[1].srid).toBe(4326);
		expect(result[1].crs).toBe('http://www.opengis.net/def/crs/OGC/1.3/CRS84');
		expect(result[1].limit).toBe(42);
		expect(result[1].apiLevel).toBe(2);

		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/oaf/getCollections', JSON.stringify({ url }), MediaType.JSON);
	});

	it('returns a OafGeoResource for each OAF collection considering ImportOafOptions `collections` parameter', async () => {
		const url = 'https://some.url/oaf';

		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));

		const result = await bvvOafGeoResourceProvider(url, { ...defaultImportOafOptions, collections: ['id1'] });

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('http://url1/||id1');
		expect(result[0].label).toBe('title1');
		expect(result[0].collectionId).toBe('id1');
		expect(result[0].srid).toBe(4326);
		expect(result[0].crs).toBe('http://www.opengis.net/def/crs/OGC/1.3/CRS84');
		expect(result[0].limit).toBe(42);
		expect(result[0].apiLevel).toBe(2);

		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/oaf/getCollections', JSON.stringify({ url }), MediaType.JSON);
	});

	describe('OAF service has basic authorization', () => {
		it('returns a OafGeoResource for each OAF collection', async () => {
			const url = 'https://some.url/oaf';
			const username = 'foo';
			const password = 'bar';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));
			const baaCredentialSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username, password });

			const result = await bvvOafGeoResourceProvider(url, { ...defaultImportOafOptions, isAuthenticated: true });

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe('http://url0/||id0');
			expect(result[0].label).toBe('title0');
			expect(result[0].collectionId).toBe('id0');
			expect(result[0].srid).toBe(3857);
			expect(result[0].crs).toBe('http://www.opengis.net/def/crs/EPSG/0/3857');
			expect(result[0].limit).toBe(21);
			expect(result[0].apiLevel).toBe(1);

			expect(result[1].id).toBe('http://url1/||id1');
			expect(result[1].label).toBe('title1');
			expect(result[1].collectionId).toBe('id1');
			expect(result[1].srid).toBe(4326);
			expect(result[1].crs).toBe('http://www.opengis.net/def/crs/OGC/1.3/CRS84');
			expect(result[1].limit).toBe(42);
			expect(result[1].apiLevel).toBe(2);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/oaf/getCollections', JSON.stringify({ url, username, password }), MediaType.JSON);
			expect(baaCredentialSpy).toHaveBeenCalledWith(url);
		});

		it('rejects with an error when credentials are not available', async () => {
			const url = 'https://some.url/oaf';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));
			const baaCredentialSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(null);

			expect(bvvOafGeoResourceProvider(url, { ...defaultImportOafOptions, isAuthenticated: true })).rejects.toThrow(
				"Import of OAF service failed. Credential for 'https://some.url/oaf' not found"
			);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).not.toHaveBeenCalled();
			expect(baaCredentialSpy).toHaveBeenCalledWith(url);
		});
	});

	describe('OafCollection endpoint responds with HTTP status 404', () => {
		it('returns an empty array', async () => {
			const url = 'https://some.url/oaf';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 404 }));

			const result = await bvvOafGeoResourceProvider(url, defaultImportOafOptions);

			expect(result).toHaveLength(0);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/oaf/getCollections', JSON.stringify({ url }), MediaType.JSON);
		});
	});
	
	describe('OafCollection endpoint responds with any other HTTP status', () => {
		it('rejects with an error ', async () => {
			const url = 'https://some.url/oaf';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi
				.spyOn(httpService, 'post')
				.mockResolvedValue(new Response(null, { status: 400 }));

			expect(bvvOafGeoResourceProvider(url, { ...defaultImportOafOptions })).rejects.toThrow(
				"GeoResource for 'https://some.url/oaf' could not be loaded: Http-Status 400"
			);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/oaf/getCollections', JSON.stringify({ url }), MediaType.JSON);
		});
	});
});
