import { MediaType } from '../../../src/domain/mediaTypes';
import { $injector } from '../../../src/injection';
import { bvvRouteProvider } from '../../../src/services/provider/route.provider';

describe('Route provider', () => {
	describe('Bvv route provider', () => {
		const configService = {
			getValueAsPath: () => {}
		};

		const httpService = {
			post: async () => {}
		};
		const coordinateService = {
			toLonLat: () => {}
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService)
				.registerSingleton('CoordinateService', coordinateService);
		});

		it('loads a route', async () => {
			const backendUrl = 'https://backend.url/';
			const categories = ['foo'];
			const coordinates3857 = [
				[1, 2],
				[3, 4]
			];
			const coordinateServiceSpy = spyOn(coordinateService, 'toLonLat').and.callFake((coord) => coord.map((n) => n + 10));
			const mockResponse = { route: 'route' };
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(
					backendUrl + 'routing/route',
					JSON.stringify({
						vehicle: categories,
						points: [
							[11, 12],
							[13, 14]
						]
					}),
					MediaType.JSON,
					{ timeout: 2000 }
				)
				.and.resolveTo(new Response(JSON.stringify(mockResponse)));

			await expectAsync(bvvRouteProvider(categories, coordinates3857)).toBeResolvedTo(mockResponse);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(coordinateServiceSpy).toHaveBeenCalled();
		});

		it('throws an Error when status code != 200', async () => {
			const backendUrl = 'https://backend.url/';
			const categories = ['foo'];
			const coordinates3857 = [
				[1, 2],
				[3, 4]
			];
			const statusCode = 400;
			spyOn(coordinateService, 'toLonLat').and.callFake((coord) => coord.map((n) => n + 10));
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'post')
				.withArgs(
					backendUrl + 'routing/route',
					JSON.stringify({
						vehicle: categories,
						points: [
							[11, 12],
							[13, 14]
						]
					}),
					MediaType.JSON,
					{ timeout: 2000 }
				)
				.and.resolveTo(new Response(null, { status: statusCode }));

			await expectAsync(bvvRouteProvider(categories, coordinates3857)).toBeRejectedWithError(
				`A route could not be retrieved: Http-Status ${statusCode}`
			);
		});
	});
});
