import { $injector } from '../../../../src/injection';
import { BvvAdminCatalogService } from '../../../../src/modules/admin/services/AdminCatalogService';
import { MediaType } from '../../../../src/domain/mediaTypes';
import { HttpService } from '../../../../src/services/HttpService';

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

		spyOn(httpService, 'get').and.returnValue({
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
		expect(service.getCachedGeoResources()).toHaveSize(0);
	});

	it('returns a cached geo-resource by id', async () => {
		const service = new BvvAdminCatalogService();

		spyOn(httpService, 'get').and.returnValue({
			status: 200,
			json: async () => [{ id: 'foo' }, { id: 'bar' }]
		});

		await service.getGeoResources();

		expect(service.getCachedGeoResourceById('bar')).toEqual({ id: 'bar' });
		expect(service.getCachedGeoResourceById('id not found')).toBeNull();
	});

	it('requests json on getTopics', async () => {
		const service = new BvvAdminCatalogService();
		const configSpy = spyOn(configService, 'getValueAsPath').and.callThrough();
		const jsonSpy = spyOn(service, '_getRequestAsJson').and.callThrough();

		await service.getTopics();

		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_URL');
		expect(jsonSpy).toHaveBeenCalledOnceWith('BACKEND_URL/adminui/topics');
	});

	it('requests json on getGeoResources', async () => {
		const service = new BvvAdminCatalogService();
		const configSpy = spyOn(configService, 'getValueAsPath').and.callThrough();
		const jsonSpy = spyOn(service, '_getRequestAsJson').and.callThrough();

		await service.getGeoResources();

		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_URL');
		expect(jsonSpy).toHaveBeenCalledOnceWith('BACKEND_URL/georesources/all');
	});

	it('requests json on getCatalog', async () => {
		const service = new BvvAdminCatalogService();
		const configSpy = spyOn(configService, 'getValueAsPath').and.callThrough();
		const jsonSpy = spyOn(service, '_getRequestAsJson').and.callThrough();

		await service.getCatalog('foo');

		expect(jsonSpy).toHaveBeenCalledOnceWith('BACKEND_URL/adminui/catalog/foo');
		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_URL');
	});

	it('calls HttpService and Config Service on _getRequestAsJson', async () => {
		const url = 'foo url';
		const getOptions = {
			headers: {
				'Content-Type': MediaType.JSON,
				'x-auth-admin-token': 'BACKEND_ADMIN_TOKEN'
			}
		};
		const service = new BvvAdminCatalogService();
		const configSpy = spyOn(configService, 'getValue').and.callThrough();
		const httpSpy = spyOn(httpService, 'get').withArgs(url, getOptions).and.callThrough();

		await service._getRequestAsJson(url);

		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_ADMIN_TOKEN');
		expect(httpSpy).toHaveBeenCalled();
	});

	it('saves a catalog', async () => {
		const expectedCatalog = [{ label: 'foo catalog' }];
		const expectedFetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			method: 'PUT',
			body: JSON.stringify(expectedCatalog),
			headers: {
				'x-auth-admin-token': 'BACKEND_ADMIN_TOKEN'
			}
		};

		const service = new BvvAdminCatalogService();
		const configSpy = spyOn(configService, 'getValue').and.callThrough();
		const httpSpy = spyOn(httpService, 'fetch').withArgs('BACKEND_URL/adminui/catalog/foo topic', expectedFetchOptions).and.callThrough();

		await service.saveCatalog('foo topic', expectedCatalog);

		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_ADMIN_TOKEN');
		expect(httpSpy).toHaveBeenCalled();
	});

	it('publishes a catalog', async () => {});

	it('throws "_getRequestAsJson" when http status code is not OK', async () => {
		const service = new BvvAdminCatalogService();

		spyOn(httpService, 'get').and.resolveTo({
			status: 400,
			json: async () => []
		});

		await expectAsync(service._getRequestAsJson('some url')).toBeRejectedWithError('Http-Status 400');
	});
});
