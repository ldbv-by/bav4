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

			const elevation = await loadBvvElevation(coordinateMock);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(elevation).toEqual(elevationMock.z);
		});

		it('throws error when backend provides empty payload', async () => {
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(JSON.stringify({}), { status: 200 })));

			await expectAsync(loadBvvElevation(coordinateMock)).toBeRejectedWithError('Elevation could not be retrieved');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});

		it('throws error when backend provides empty elevation', async () => {
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(JSON.stringify({ z: null }), { status: 200 })));

			await expectAsync(loadBvvElevation(coordinateMock)).toBeRejectedWithError('Elevation could not be retrieved');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});

		it('throws error when backend request cannot be fulfilled', async () => {
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(null, { status: 404 })));

			await expectAsync(loadBvvElevation(coordinateMock)).toBeRejectedWithError('Elevation could not be retrieved');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});
