import { $injector } from '@src/injection';
import { BvvAdminCatalogService, Environment } from '@src/modules/admin/services/AdminCatalogService';
import { MediaType } from '@src/domain/mediaTypes';
import { HttpService } from '@src/services/HttpService';

describe('BvvAdminCatalogService', () => {
	const configService = {
		getValueAsPath: (key) => {
			return key + '/';
		},
		getValue: (key) => {
			return key;
		}
	};

	const httpService = {
		get: async (url) => {
			return {
				status: 200,
				json: async () => {
					return [url];
				}
			};
		},
		fetch: async (url) => {
			return {
				status: 200,
				url: url
			};
		}
	};

	beforeAll(() => {
		$injector.registerSingleton('HttpService', httpService).registerSingleton('ConfigService', configService);
	});

	it('returns cached geo-resources', async () => {
		const service = new BvvAdminCatalogService();

		vi.spyOn(httpService, 'get').mockReturnValue({
			status: 200,
			json: async () => ['foo', 'bar']
		});

		await service.getGeoResources();
		const cachedResources = service.getCachedGeoResources();

		expect(cachedResources).toEqual(['foo', 'bar']);
	});

	it('returns no cached geo-resources by default when geo-resources are not geted', () => {
		const service = new BvvAdminCatalogService();
		expect(service.getCachedGeoResourceById('foo')).toBeNull();
		expect(service.getCachedGeoResources()).toHaveLength(0);
	});

	it('returns a cached geo-resource by id', async () => {
		const service = new BvvAdminCatalogService();

		vi.spyOn(httpService, 'get').mockReturnValue({
			status: 200,
			json: async () => [{ id: 'foo' }, { id: 'bar' }]
		});

		await service.getGeoResources();

		expect(service.getCachedGeoResourceById('bar')).toEqual({ id: 'bar' });
		expect(service.getCachedGeoResourceById('id not found')).toBeNull();
	});

	it('requests json on getTopics', async () => {
		const service = new BvvAdminCatalogService();
		const configSpy = vi.spyOn(configService, 'getValueAsPath');
		const jsonSpy = vi.spyOn(service, '_getRequestAsJson');

		await service.getTopics();

		expect(configSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_URL');
		expect(jsonSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_URL/adminui/topics');
	});

	it('requests json on getGeoResources', async () => {
		const service = new BvvAdminCatalogService();
		const configSpy = vi.spyOn(configService, 'getValueAsPath');
		const jsonSpy = vi.spyOn(service, '_getRequestAsJson');

		await service.getGeoResources();

		expect(configSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_URL');
		expect(jsonSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_URL/georesources/all');
	});

	it('gets default fetch Options', () => {
		const service = new BvvAdminCatalogService();
		expect(service._getFetchOptions('BACKEND_ADMIN_TOKEN')).toEqual({
			mode: HttpService.DEFAULT_REQUEST_MODE,
			headers: {
				'x-auth-admin-token': 'BACKEND_ADMIN_TOKEN',
				'Content-Type': MediaType.JSON
			}
		});
	});

	it('requests json on getCatalog', async () => {
		const service = new BvvAdminCatalogService();
		const configSpy = vi.spyOn(configService, 'getValueAsPath');
		const jsonSpy = vi.spyOn(service, '_getRequestAsJson');

		await service.getCatalog('foo');

		expect(jsonSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_URL/adminui/catalog/foo');
		expect(configSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_URL');
	});

	it('calls HttpService and Config Service on _getRequestAsJson', async () => {
		const url = 'foo url';
		const getOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			headers: {
				'Content-Type': MediaType.JSON,
				'x-auth-admin-token': 'BACKEND_ADMIN_TOKEN'
			}
		};
		const service = new BvvAdminCatalogService();
		const configSpy = vi.spyOn(configService, 'getValue');
		const httpSpy = vi.spyOn(httpService, 'get');

		await service._getRequestAsJson(url);

		expect(configSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_ADMIN_TOKEN');
		expect(httpSpy).toHaveBeenCalledExactlyOnceWith(url, getOptions);
	});

	it('saves the catalog', async () => {
		const expectedCatalog = [{ label: 'foo catalog' }];
		const expectedFetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			method: 'PUT',
			body: JSON.stringify(expectedCatalog),
			headers: {
				'x-auth-admin-token': 'BACKEND_ADMIN_TOKEN',
				'Content-Type': MediaType.JSON
			}
		};

		const service = new BvvAdminCatalogService();
		const configSpy = vi.spyOn(configService, 'getValue');
		const httpSpy = vi.spyOn(httpService, 'fetch');

		await service.saveCatalog('foo', expectedCatalog);

		expect(configSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_ADMIN_TOKEN');
		expect(httpSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_URL/adminui/catalog/foo', expectedFetchOptions);
	});

	it('publishes the catalog to production', async () => {
		const expectedFetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			method: 'PUT',
			headers: {
				'x-auth-admin-token': 'BACKEND_ADMIN_TOKEN',
				'Content-Type': MediaType.JSON
			},
			body: JSON.stringify({
				editor: 'editor',
				message: 'message'
			})
		};

		const service = new BvvAdminCatalogService();
		const configSpy = vi.spyOn(configService, 'getValue');
		const httpSpy = vi.spyOn(httpService, 'fetch');
		await service.publishCatalog(Environment.PRODUCTION, 'foo', {
			editor: 'editor',
			message: 'message'
		});

		expect(configSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_ADMIN_TOKEN');
		expect(httpSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_URL/adminui/publish/catalog/foo', expectedFetchOptions);
	});

	it('publishes the catalog to stage', async () => {
		const expectedFetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			method: 'PUT',
			headers: {
				'x-auth-admin-token': 'BACKEND_ADMIN_TOKEN',
				'Content-Type': MediaType.JSON
			},
			body: '{}'
		};

		const service = new BvvAdminCatalogService();
		const configSpy = vi.spyOn(configService, 'getValue');
		const httpSpy = vi.spyOn(httpService, 'fetch');
		await service.publishCatalog(Environment.STAGE, 'foo');

		expect(configSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_ADMIN_TOKEN');
		expect(httpSpy).toHaveBeenCalledExactlyOnceWith('BACKEND_URL/adminui/stage/catalog/foo', expectedFetchOptions);
	});

	it('throws "_getRequestAsJson" when http status code is not OK', async () => {
		const service = new BvvAdminCatalogService();

		vi.spyOn(httpService, 'get').mockResolvedValue({
			status: 400,
			json: async () => []
		});

		await expect(service._getRequestAsJson('some url')).rejects.toThrow('Http-Status 400');
	});

	it('throws "publishCatalog" when http status code is not OK', async () => {
		const service = new BvvAdminCatalogService();

		vi.spyOn(httpService, 'fetch').mockResolvedValue({
			status: 400,
			json: async () => []
		});

		await expect(service.publishCatalog(Environment.STAGE, 'foo')).rejects.toThrow('Http-Status 400');
	});

	it('throws "saveCatalog" when http status code is not OK', async () => {
		const service = new BvvAdminCatalogService();

		vi.spyOn(httpService, 'fetch').mockResolvedValue({
			status: 400,
			json: async () => []
		});

		await expect(service.saveCatalog('foo', [])).rejects.toThrow('Http-Status 400');
	});
});
