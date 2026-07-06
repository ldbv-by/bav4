import { $injector } from '@src/injection';
import { bvvStaGeoResourceProvider } from '@src/services/provider/sta.provider';
import { MediaType } from '@src/domain/mediaTypes';
import { StaGeoResource } from '@src/domain/geoResources';
import { expect } from 'vitest';

describe('bvvStaGeoResourceProvider', () => {
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

	const mockResponsePayload = [
		{
			id: 'id0',
			name: 'name0',
			description: 'description0',
			url: 'http://url0/'
		},
		{
			id: 'id1',
			name: 'name1',
			description: 'description1',
			url: 'http://url1/'
		}
	];

	const defaultImportStaOptions = {
		isAuthenticated: false,
		observedPropertyIds: [],
		ids: []
	};

	it('returns a StaGeoResource for each STA observedProperty without extra ImportStaOptions', async () => {
		const url = 'https://some.url/sta';
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));

		const result = await bvvStaGeoResourceProvider(url, defaultImportStaOptions);

		expect(result).toHaveLength(2);
		expect(result[0]).toBeInstanceOf(StaGeoResource);
		expect(result[0].id).toBe('http://url0/||id0');
		expect(result[0].label).toBe('name0');
		expect(result[0].observedPropertyId).toBe('id0');

		expect(result[1]).toBeInstanceOf(StaGeoResource);
		expect(result[1].id).toBe('http://url1/||id1');
		expect(result[1].label).toBe('name1');
		expect(result[1].observedPropertyId).toBe('id1');

		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/sta/getObservedProperties', JSON.stringify({ url }), MediaType.JSON);
	});

	it('returns a StaGeoResource for each STA observedProperty considering ImportStaOptions `observedProperties` parameter', async () => {
		const url = 'https://some.url/sta';

		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));

		const result = await bvvStaGeoResourceProvider(url, { ...defaultImportStaOptions, observedPropertyIds: ['id1'] });

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('http://url1/||id1');
		expect(result[0].label).toBe('name1');
		expect(result[0].observedPropertyId).toBe('id1');

		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/sta/getObservedProperties', JSON.stringify({ url }), MediaType.JSON);
	});

	describe('STA service has basic authorization', () => {
		it('returns a StaGeoResource for each STA observedProperty', async () => {
			const url = 'https://some.url/sta';
			const username = 'foo';
			const password = 'bar';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));
			const baaCredentialSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username, password });

			const result = await bvvStaGeoResourceProvider(url, { ...defaultImportStaOptions, isAuthenticated: true });

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe('http://url0/||id0');
			expect(result[0].label).toBe('name0');
			expect(result[0].observedPropertyId).toBe('id0');

			expect(result[1].id).toBe('http://url1/||id1');
			expect(result[1].label).toBe('name1');
			expect(result[1].observedPropertyId).toBe('id1');

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(
				'BACKEND_URL/sta/getObservedProperties',
				JSON.stringify({ url, username, password }),
				MediaType.JSON
			);
			expect(baaCredentialSpy).toHaveBeenCalledWith(url);
		});

		it('rejects with an error when credentials are not available', async () => {
			const url = 'https://some.url/sta';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponsePayload)));
			const baaCredentialSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(null);

			await expect(bvvStaGeoResourceProvider(url, { ...defaultImportStaOptions, isAuthenticated: true })).rejects.toThrow(
				"Import of STA service failed. Credential for 'https://some.url/sta' not found"
			);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).not.toHaveBeenCalled();
			expect(baaCredentialSpy).toHaveBeenCalledWith(url);
		});
	});

	describe('STA observesProperties endpoint responds with HTTP status 404', () => {
		it('returns an empty array', async () => {
			const url = 'https://some.url/sta';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 404 }));

			const result = await bvvStaGeoResourceProvider(url, defaultImportStaOptions);

			expect(result).toHaveLength(0);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/sta/getObservedProperties', JSON.stringify({ url }), MediaType.JSON);
		});
	});

	describe('STA observesProperties endpoint responds with any other HTTP status', () => {
		it('rejects with an error ', async () => {
			const url = 'https://some.url/sta';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue('BACKEND_URL/');
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 400 }));

			await expect(bvvStaGeoResourceProvider(url, { ...defaultImportStaOptions })).rejects.toThrow(
				"GeoResource for 'https://some.url/sta' could not be loaded: Http-Status 400"
			);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith('BACKEND_URL/sta/getObservedProperties', JSON.stringify({ url }), MediaType.JSON);
		});
	});
});
