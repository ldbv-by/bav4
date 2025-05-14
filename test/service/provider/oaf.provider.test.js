import { $injector } from '../../../src/injection';
import { bvvOafGeoResourceProvider } from '../../../src/services/provider/oaf.provider';
import { MediaType } from '../../../src/domain/mediaTypes';

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

	const mockResponsePayload = [
		{
			id: 'id0',
			title: 'title0',
			description: 'description0',
			url: 'http://url0/collections/id0',
			totalNumberOfItems: 21,
			crs: 3857
		},
		{
			id: 'id1',
			title: 'title1',
			description: 'description1',
			url: 'http://url1/collections/id1',
			totalNumberOfItems: 42,
			crs: 4326
		},
		{
			id: 'id2',
			title: 'title2',
			description: 'description2',
			url: 'http://url2/collections/id2',
			totalNumberOfItems: 42,
			crs: 55555
		}
	];

	const defaultImportOafOptions = {
		isAuthenticated: false,
		collections: [],
		ids: []
	};

	it('returns a OafGeoResource for each OAF collection without extra ImportOafOptions', async () => {
		const url = 'https://some.url/oaf';

		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
		const httpServiceSpy = spyOn(httpService, 'post')
			.withArgs('BACKEND_URL/oaf/getCollections', JSON.stringify({ url }), MediaType.JSON)
			.and.resolveTo(new Response(JSON.stringify(mockResponsePayload)));

		const result = await bvvOafGeoResourceProvider(url, defaultImportOafOptions);

		expect(result).toHaveSize(2);
		expect(result[0].id).toBe('http://url0/||id0');
		expect(result[0].label).toBe('title0');
		expect(result[0].collectionId).toBe('id0');
		expect(result[0].srid).toBe(3857);
		expect(result[0].limit).toBe(21);

		expect(result[1].id).toBe('http://url1/||id1');
		expect(result[1].label).toBe('title1');
		expect(result[1].collectionId).toBe('id1');
		expect(result[1].srid).toBe(4326);
		expect(result[1].limit).toBe(42);

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
	});

	it('returns a OafGeoResource for each OAF collection considering ImportOafOptions `collections` parameter', async () => {
		const url = 'https://some.url/oaf';

		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
		const httpServiceSpy = spyOn(httpService, 'post')
			.withArgs('BACKEND_URL/oaf/getCollections', JSON.stringify({ url }), MediaType.JSON)
			.and.resolveTo(new Response(JSON.stringify(mockResponsePayload)));

		const result = await bvvOafGeoResourceProvider(url, { ...defaultImportOafOptions, collections: ['id1'] });

		expect(result).toHaveSize(1);

		expect(result[0].id).toBe('http://url1/||id1');
		expect(result[0].label).toBe('title1');
		expect(result[0].collectionId).toBe('id1');
		expect(result[0].srid).toBe(4326);
		expect(result[0].limit).toBe(42);

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
	});

	describe('OAF service has basic authorization', () => {
		it('returns a OafGeoResource for each OAF collection', async () => {
			const url = 'https://some.url/oaf';
			const username = 'foo';
			const password = 'bar';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs('BACKEND_URL/oaf/getCollections', JSON.stringify({ url, username, password }), MediaType.JSON)
				.and.resolveTo(new Response(JSON.stringify(mockResponsePayload)));
			const baaCredentialSpy = spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue({ username, password });

			const result = await bvvOafGeoResourceProvider(url, { ...defaultImportOafOptions, isAuthenticated: true });

			expect(result).toHaveSize(2);
			expect(result[0].id).toBe('http://url0/||id0');
			expect(result[0].label).toBe('title0');
			expect(result[0].collectionId).toBe('id0');
			expect(result[0].srid).toBe(3857);
			expect(result[0].limit).toBe(21);

			expect(result[1].id).toBe('http://url1/||id1');
			expect(result[1].label).toBe('title1');
			expect(result[1].collectionId).toBe('id1');
			expect(result[1].srid).toBe(4326);
			expect(result[1].limit).toBe(42);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(baaCredentialSpy).toHaveBeenCalled();
		});

		it('rejects with an error when credentials are not available', async () => {
			const url = 'https://some.url/oaf';
			const username = 'foo';
			const password = 'bar';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs('BACKEND_URL/oaf/getCollections', JSON.stringify({ url, username, password }), MediaType.JSON)
				.and.resolveTo(new Response(JSON.stringify(mockResponsePayload)));
			const baaCredentialSpy = spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(null);

			await expectAsync(bvvOafGeoResourceProvider(url, { ...defaultImportOafOptions, isAuthenticated: true })).toBeRejectedWithError(
				"Import of OAF service failed. Credential for 'https://some.url/oaf' not found"
			);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).not.toHaveBeenCalled();
			expect(baaCredentialSpy).toHaveBeenCalled();
		});
	});

	describe('OAF service responds with HTTP status 404', () => {
		it('returns an empty array', async () => {
			const url = 'https://some.url/oaf';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs('BACKEND_URL/oaf/getCollections', JSON.stringify({ url }), MediaType.JSON)
				.and.resolveTo(new Response(null, { status: 404 }));

			const result = await bvvOafGeoResourceProvider(url, defaultImportOafOptions);

			expect(result).toHaveSize(0);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
	describe('OAF service responds with any other HTTP status', () => {
		it('rejects with an error ', async () => {
			const url = 'https://some.url/oaf';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs('BACKEND_URL/oaf/getCollections', JSON.stringify({ url }), MediaType.JSON)
				.and.resolveTo(new Response(null, { status: 400 }));

			await expectAsync(bvvOafGeoResourceProvider(url, { ...defaultImportOafOptions })).toBeRejectedWithError(
				"GeoResource for 'https://some.url/oaf' could not be loaded: Http-Status 400"
			);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});
