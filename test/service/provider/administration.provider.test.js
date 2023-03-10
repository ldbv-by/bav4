import { $injector } from '../../../src/injection';
import { loadBvvAdministration } from '../../../src/services/provider/administration.provider';

describe('Administration provider', () => {
	describe('Bvv Administration provider', () => {
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

		it('loads an Administration object', async () => {
			const backendUrl = 'https://backend.url';
			const administrationMock = { gemeinde: 'gemeinde', gemarkung: 'gemarkung' };
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(JSON.stringify(administrationMock))));

			const administration = await loadBvvAdministration(coordinateMock);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(administration.community).toEqual(administrationMock.gemeinde);
			expect(administration.district).toEqual(administrationMock.gemarkung);
		});

		it('throws error when backend request cannot be fulfilled', async () => {
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(null, { status: 500 })));

			await expectAsync(loadBvvAdministration(coordinateMock)).toBeRejectedWithError('Administration could not be retrieved: Http-Status 500');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});
