import { $injector } from '../../../src/injection';
import { loadBvvAdministration } from '../../../src/services/provider/administration.provider';

describe('Administration provider', () => {
	describe('Bvv Administration provider', () => {

		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			get: async () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});

		const coordinateMock = [21, 42];


		it('loads Administration', async () => {

			const backendUrl = 'https://backend.url';
			const administrationMock = { gemeinde: 'LDBV', gemarkung: 'Ref42' };
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						administrationMock
					)
				)
			));

			const administration = await loadBvvAdministration(coordinateMock);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(administration.gemeinde).toEqual(administrationMock.community);
			expect(administration.gemarkung).toEqual(administrationMock.district);
		});

		it('throws error when backend provides empty payload', async () => {

			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
				new Response(JSON.stringify({}), { status: 200 })
			));

			try {
				await loadBvvAdministration(coordinateMock);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toContain('Administration could not be retrieved');
			}
		});

		it('throws error when backend provides empty administration', async () => {

			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const administrationMock = { gemeinde: '', gemarkung: '' };
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
				new Response(JSON.stringify(administrationMock), { status: 200 })
			));

			try {
				await loadBvvAdministration(coordinateMock);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toContain('Administration could not be retrieved');
			}
		});

		it('throws error when backend provides just one property', async () => {

			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const administrationMock = { gemeinde: 'LDBV' };
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
				new Response(JSON.stringify(administrationMock), { status: 200 })
			));

			try {
				await loadBvvAdministration(coordinateMock);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toContain('Administration could not be retrieved');
			}
		});

		it('throws error when backend request cannot be fulfilled', async () => {

			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));

			try {
				await loadBvvAdministration(coordinateMock);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toBe('Administration could not be retrieved');
			}
		});
	});
});
