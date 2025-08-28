import { $injector } from '../../../../src/injection';
import { AdminCatalogService } from '../../../../src/modules/admin/services/AdminCatalogService';

describe('AdminCatalogService', () => {
	const configService = {
		getValueAsPath: (key) => {
			return key + '/';
		}
	};

	const httpService = {
		fetch: async (url) => {
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
		const service = new AdminCatalogService();

		spyOn(httpService, 'fetch').and.returnValue({
			status: 200,
			json: async () => ['foo', 'bar']
		});

		await service.getGeoResources();
		const cachedResources = service.getCachedGeoResources();

		expect(cachedResources).toEqual(['foo', 'bar']);
	});

	it('returns no cached geo-resources by default when geo-resources are not fetched', () => {
		const service = new AdminCatalogService();
		expect(service.getCachedGeoResourceById('foo')).toBeNull();
		expect(service.getCachedGeoResources()).toHaveSize(0);
	});

	it('returns a cached geo-resource by id', async () => {
		const service = new AdminCatalogService();

		spyOn(httpService, 'fetch').and.returnValue({
			status: 200,
			json: async () => [{ id: 'foo' }, { id: 'bar' }]
		});

		await service.getGeoResources();

		expect(service.getCachedGeoResourceById('bar')).toEqual({ id: 'bar' });
		expect(service.getCachedGeoResourceById('id not found')).toBeNull();
	});

	it('calls  HttpService and ConfigService on getTopics', async () => {
		const service = new AdminCatalogService();
		const configSpy = spyOn(configService, 'getValueAsPath').and.callThrough();
		const httpSpy = spyOn(httpService, 'fetch').and.callThrough();

		await service.getTopics();

		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_URL');
		expect(httpSpy).toHaveBeenCalledOnceWith(
			'BACKEND_URL/adminui/topics',
			jasmine.objectContaining({
				method: 'GET',
				mode: 'cors',
				headers: jasmine.objectContaining({
					'Content-Type': 'application/json'
				})
			})
		);
	});

	it('calls HttpService and ConfigService on getGeoResources', async () => {
		const service = new AdminCatalogService();
		const configSpy = spyOn(configService, 'getValueAsPath').and.callThrough();
		const httpSpy = spyOn(httpService, 'fetch').and.callThrough();

		await service.getGeoResources();

		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_URL');
		expect(httpSpy).toHaveBeenCalledOnceWith(
			'BACKEND_URL/georesources/all',
			jasmine.objectContaining({
				method: 'GET',
				mode: 'cors',
				headers: jasmine.objectContaining({
					'Content-Type': 'application/json'
				})
			})
		);
	});

	it('calls HttpService and ConfigService on getCatalog', async () => {
		const service = new AdminCatalogService();
		const configSpy = spyOn(configService, 'getValueAsPath').and.callThrough();
		const httpSpy = spyOn(httpService, 'fetch').and.callThrough();

		await service.getCatalog('foo');

		expect(configSpy).toHaveBeenCalledOnceWith('BACKEND_URL');
		expect(httpSpy).toHaveBeenCalledOnceWith(
			'BACKEND_URL/catalog/foo',
			jasmine.objectContaining({
				method: 'GET',
				mode: 'cors',
				headers: jasmine.objectContaining({
					'Content-Type': 'application/json'
				})
			})
		);
	});

	it('throws when http status code is not OK', async () => {
		const service = new AdminCatalogService();

		spyOn(httpService, 'fetch').and.returnValue({
			status: 400,
			json: async () => []
		});

		await expectAsync(service._getRequestAsJson('some url')).toBeRejectedWithError('Http-Status 400');
	});
});
