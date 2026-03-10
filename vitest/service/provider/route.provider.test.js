import { MediaType } from '@src/domain/mediaTypes';
import { RouteCalculationErrors } from '@src/domain/routing';
import { $injector } from '@src/injection';
import { bvvRouteProvider } from '@src/services/provider/route.provider';

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
			const coordinateServiceSpy = vi.spyOn(coordinateService, 'toLonLat').mockImplementation((coord) => coord.map((n) => n + 10));
			const mockResponse = { route: 'route' };
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

			expect(bvvRouteProvider(categories, coordinates3857)).toBeResolvedTo(mockResponse);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(
				backendUrl + 'routing/route',
				JSON.stringify({
					vehicle: categories,
					points: [
						[11, 12],
						[13, 14]
					]
				}),
				MediaType.JSON
			);
			expect(coordinateServiceSpy).toHaveBeenCalled();
		});

		it('throws an Error when status code == 400', async () => {
			const backendUrl = 'https://backend.url/';
			const categories = ['foo'];
			const coordinates3857 = [
				[1, 2],
				[3, 4]
			];
			const statusCode = 400;
			vi.spyOn(coordinateService, 'toLonLat').mockImplementation((coord) => coord.map((n) => n + 10));
			vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			vi.spyOn(httpService, 'post')

				.mockResolvedValue(new Response(null, { status: statusCode }));

			expect(bvvRouteProvider(categories, coordinates3857)).toBeRejectedWith(
				expect.objectContaining({
					message: `A route could not be retrieved: Http-Status ${statusCode}`,
					cause: RouteCalculationErrors.Improper_Waypoints
				})
			);
		});

		it('throws an Error when status code == 500', async () => {
			const backendUrl = 'https://backend.url/';
			const categories = ['foo'];
			const coordinates3857 = [
				[1, 2],
				[3, 4]
			];
			const statusCode = 500;
			vi.spyOn(coordinateService, 'toLonLat').mockImplementation((coord) => coord.map((n) => n + 10));
			vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: statusCode }));

			expect(bvvRouteProvider(categories, coordinates3857)).toBeRejectedWith(
				expect.objectContaining({
					message: `A route could not be retrieved: Http-Status ${statusCode}`,
					cause: RouteCalculationErrors.Technical_Error
				})
			);
		});
		it('throws an Error for any other status then 200', async () => {
			const backendUrl = 'https://backend.url/';
			const categories = ['foo'];
			const coordinates3857 = [
				[1, 2],
				[3, 4]
			];
			const statusCode = 301;
			vi.spyOn(coordinateService, 'toLonLat').mockImplementation((coord) => coord.map((n) => n + 10));
			vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: statusCode }));

			expect(bvvRouteProvider(categories, coordinates3857)).toBeRejectedWith(
				expect.objectContaining({
					message: `A route could not be retrieved: Http-Status ${statusCode}`
				})
			);
		});
	});
});
