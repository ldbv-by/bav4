import { $injector } from '../../../src/injection';
import { loadBvvElevation } from '../../../src/services/provider/elevation.provider';

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
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(JSON.stringify(elevationMock))));

			await expectAsync(loadBvvElevation(coordinateMock)).toBeResolvedTo(elevationMock.z);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});

		it('throws an error when backend cannot fulfill', async () => {
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(null, { status: 500 })));

			await expectAsync(loadBvvElevation(coordinateMock)).toBeRejectedWithError('Elevation could not be retrieved: Http-Status 500');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});
