import { $injector } from '../../../src/injection';
import { IconResult } from '../../../src/services/IconService';
import { loadBvvIcons } from '../../../src/services/provider/icons.provider';

describe('Icons provider', () => {

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

	it('loads icons', async () => {

		const backendUrl = 'https://backend.url';

		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response(
				JSON.stringify([
					{ name: 'foo1', svg: 'bar1' },
					{ name: 'foo2', svg: 'bar2' },
					{ name: 'foo3', svg: 'bar3' }]
				)
			)));

		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(icons.length).toBe(3);

		const fooIconResult1 = icons[0];
		expect(fooIconResult1).toEqual(jasmine.any(IconResult));


	});

	it('rejects when backend request cannot be fulfilled', (done) => {

		const backendUrl = 'https://backend.url';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response(null, { status: 404 })
		));


		loadBvvIcons().then(() => {
			done(new Error('Promise should not be resolved'));
		}, (reason) => {
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(reason.message).toBe('Icons could not be retrieved');
			done();
		});

	});
});
