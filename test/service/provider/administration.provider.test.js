import { $injector } from '../../../src/injection';
import { loadBvvAdministration } from '../../../src/services/provider/administration.provider';

describe('Administration provider', () => {
	describe('Bvv Administration provider', () => {

		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			fetch: async () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});

		const coordinateMock = [21, 42];    


		it('loads Altitude', async () => {

			const backendUrl = 'https://backend.url';
			const administrationMock = { gemeinde: 'LDBV', gemarkung: 'Ref42' };
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
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

		it('throws error when backend provides empty payload', (done) => {

			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
				new Response(JSON.stringify({}), { status: 200 })
			));

			loadBvvAdministration(coordinateMock).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason.message).toContain('Administration could not be retrieved');
				done();
			});
		});

		it('throws error when backend provides empty administration', (done) => {

			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const administrationMock = { gemeinde: '', gemarkung: '' };
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
				new Response(JSON.stringify(administrationMock), { status: 200 })
			));

			loadBvvAdministration(coordinateMock).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason.message).toContain('Administration could not be retrieved');
				done();
			});
		});

		it('throws error when backend request cannot be fulfilled', (done) => {

			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));

			loadBvvAdministration(coordinateMock).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason.message).toBe('Administration could not be retrieved');
				done();
			});
		});
	});
});