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

		const coordinateMock = [21, 42];    


		it('loads Altitude', async () => {

			const backendUrl = 'https://backend.url';
			const altitudeMock = { altitude: 5 };
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						altitudeMock
					)
				)
			));

			const altitude = await loadBvvAltitude(coordinateMock);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(altitude).toEqual(altitudeMock.altitude);

		});

		it('rejects when altitude cannot be resolved', (done) => {

			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
				new Response(null, { status: 200 })
			));


			loadBvvAltitude(coordinateMock).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason).toContain('Altitude could not be resolved:');
				done();
			});

		});

		it('rejects when backend request cannot be fulfilled', (done) => {

			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));


			loadBvvAltitude(coordinateMock).then(() => {
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