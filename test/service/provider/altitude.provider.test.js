import { $injector } from '../../../src/injection';
import { loadBvvAltitude } from '../../../src/services/provider/altitude.provider';

describe('Altitude provider', () => {
	describe('Bvv Altitude provider', () => {

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

		const altitudeMock = { altitude: 5 };
		const coordinateMock = [21, 42];    


		it('loads Altitude', async () => {

			const backendUrl = 'https://backend.url';
			// const expectedArgs0 = backendUrl + 'dem/altitude/' + coordinateMock[0] + '/' + coordinateMock[1];
			// const expectedArgs1 = {
			// 	mode: 'cors'
			// };
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify([
						altitudeMock
					])
				)
			));


			const altitude = await loadBvvAltitude(coordinateMock);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(altitude.length).toBe(1);
			expect(altitude[0]).toEqual(altitudeMock);

		});

		it('rejects when backend request cannot be fulfilled', (done) => {

			const backendUrl = 'https://backend.url';
			// const expectedArgs0 = backendUrl + 'dem/altitude/' + coordinateMock[0] + '/' + coordinateMock[1];
			// const expectedArgs1 = {
			// 	mode: 'cors'
			// };
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));


			loadBvvAltitude(altitudeMock).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason.message).toBe('Altitude could not be retrieved');
				done();
			});

		});


	});
});