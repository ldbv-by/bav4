import { $injector } from '@src/injection';
import { loadBvvElevation } from '@src/services/provider/elevation.provider';

describe('Elevation provider', () => {
	describe('Bvv Elevation provider', () => {
		const configService = {
			getValueAsPath: () => {}
		};

		const httpService = {
			get: async () => {}
		};

		beforeAll(() => {
			$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
		});

		const coordinateMock = [21, 42];

		it('loads an elevation', async () => {
			const backendUrl = 'https://backend.url';
			const elevationMock = { z: 5 };
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(JSON.stringify(elevationMock)));

			await expect(loadBvvElevation(coordinateMock)).resolves.toEqual(elevationMock.z);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(`${backendUrl}dem/elevation/21/42`);
		});

		it('throws an error when backend cannot fulfill', async () => {
			const backendUrl = 'https://backend.url';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: 500 }));

			await expect(loadBvvElevation(coordinateMock)).rejects.toThrow('Elevation could not be retrieved: Http-Status 500');
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(`${backendUrl}dem/elevation/21/42`);
		});
	});
});
