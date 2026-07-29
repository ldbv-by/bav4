import { $injector } from '@src/injection';
import { loadBvvAdministration } from '@src/services/provider/administration.provider';

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

		it('loads an Administration object without a parcel', async () => {
			const backendUrl = 'https://backend.url';
			const administrationMock = { gemeinde: 'gemeinde', gemarkung: 'gemarkung', flstBezeichnung: null };
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(JSON.stringify(administrationMock)));

			const administration = await loadBvvAdministration(coordinateMock);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(administration.community).toBe(administrationMock.gemeinde);
			expect(administration.district).toBe(administrationMock.gemarkung);
			expect(administration.parcel).toBeNull();
		});

		it('loads an Administration object containing a parcel', async () => {
			const backendUrl = 'https://backend.url';
			const administrationMock = { gemeinde: 'gemeinde', gemarkung: 'gemarkung', flstBezeichnung: '12345' };
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(JSON.stringify(administrationMock)));

			const administration = await loadBvvAdministration(coordinateMock);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(administration.community).toBe(administrationMock.gemeinde);
			expect(administration.district).toBe(administrationMock.gemarkung);
			expect(administration.parcel).toBe(administrationMock.flstBezeichnung);
		});

		it('return null when for status 404', async () => {
			const backendUrl = 'https://backend.url';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: 404 }));

			await expect(loadBvvAdministration(coordinateMock)).resolves.toBe(null);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalled();
		});

		it('throws error when backend request cannot be fulfilled', async () => {
			const backendUrl = 'https://backend.url';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: 500 }));

			await expect(loadBvvAdministration(coordinateMock)).rejects.toThrow('Administration could not be retrieved: Http-Status 500');
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});
