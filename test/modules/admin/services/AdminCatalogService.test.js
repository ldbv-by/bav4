import { $injector } from '../../../../src/injection';
import { BvvAdminCatalogService } from '../../../../src/modules/admin/services/AdminCatalogService';

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

	it('calls  HttpService and ConfigService on getTopics', async () => {
		const service = new BvvAdminCatalogService();
		const configSpy = spyOn(configService, 'getValueAsPath').and.callThrough();
		const httpSpy = spyOn(httpService, 'get').and.callThrough();

		await service.getTopics();

		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_URL');
		expect(httpSpy).toHaveBeenCalledOnceWith(
			'BACKEND_URL/adminui/topics',
			jasmine.objectContaining({
				headers: jasmine.objectContaining({
					'Content-Type': 'application/json',
					'x-auth-admin-token': 'BACKEND_ADMIN_TOKEN'
				})
			})
		);
	});

	it('calls HttpService and ConfigService on getGeoResources', async () => {
		const service = new BvvAdminCatalogService();
		const configSpy = spyOn(configService, 'getValueAsPath').and.callThrough();
		const httpSpy = spyOn(httpService, 'get').and.callThrough();

		await service.getGeoResources();

		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_URL');
		expect(httpSpy).toHaveBeenCalledOnceWith(
			'BACKEND_URL/georesources/all',
			jasmine.objectContaining({
				headers: jasmine.objectContaining({
					'Content-Type': 'application/json',
					'x-auth-admin-token': 'BACKEND_ADMIN_TOKEN'
				})
			})
		);
	});

	it('calls HttpService and ConfigService on getCatalog', async () => {
		const service = new BvvAdminCatalogService();
		const configSpy = spyOn(configService, 'getValueAsPath').and.callThrough();
		const httpSpy = spyOn(httpService, 'get').and.callThrough();

		await service.getCatalog('foo');

		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_URL');
		expect(httpSpy).toHaveBeenCalledOnceWith(
			'BACKEND_URL/adminui/catalog/foo',
			jasmine.objectContaining({
				headers: jasmine.objectContaining({
					'Content-Type': 'application/json',
					'x-auth-admin-token': 'BACKEND_ADMIN_TOKEN'
				})
			})
		);
	});

	it('throws when http status code is not OK', async () => {
		const service = new BvvAdminCatalogService();

		spyOn(httpService, 'get').and.returnValue({
			status: 400,
			json: async () => []
		});

		await expectAsync(service._getRequestAsJson('some url')).toBeRejectedWithError('Http-Status 400');
	});
});
