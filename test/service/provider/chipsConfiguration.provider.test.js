import { $injector } from '../../../src/injection';
import { loadBvvChipConfiguration } from '../../../src/services/provider/chipsConfiguration.provider';

describe('Chips configuration provider', () => {

	describe('loadBvvChipConfiguration', () => {

		const mockResponse = [
			{
				'id': 'gh',
				'title': 'Fork me',
				'href': 'https://github.com/ldbv-by/bav4/',
				'permanent': true,
				'target': 'external',
				'observer': {
					'geoResources': [],
					'topics': []
				},
				'style': {
					'colorLight': 'var(--primary-color)',
					'backgroundColorLight': 'var(--primary-bg-color)',
					'colorDark': 'var(--primary-color)',
					'backgroundColorDark': 'var(--primary-bg-color)',
					'icon': '<path d="m 8.06415,0.2995526 c -4.260197,0 -7.70415223,3.4693444 -7.70415223,7.7613964 0,3.430867 2.20666073,6.335023 5.26788413,7.362895 0.3827318,0.07727 0.5229249,-0.167002 0.5229249,-0.372481 0,-0.179933 -0.012616,-0.796688 -0.012616,-1.439305 -2.1431086,0.462685 -2.5893925,-0.925211 -2.5893925,-0.925211 -0.3444112,-0.899506 -0.8547202,-1.13069 -0.8547202,-1.13069 -0.7014384,-0.475459 0.051094,-0.475459 0.051094,-0.475459 0.7780792,0.05141 1.186358,0.796688 1.186358,0.796688 0.6886649,1.1821 1.7983821,0.848097 2.2448237,0.64246 0.06371,-0.501163 0.2679279,-0.848097 0.4847619,-1.040804 -1.7092829,-0.179933 -3.5076649,-0.848097 -3.5076649,-3.8293681 0,-0.8480967 0.3059331,-1.5419653 0.7906951,-2.0816063 -0.076484,-0.1927064 -0.3444113,-0.9895518 0.076641,-2.0560597 0,0 0.6505021,-0.2056375 2.1172463,0.7966877 A 7.4070501,7.4070501 0 0 1 8.0641496,4.0516488 c 0.6505021,0 1.3136194,0.090045 1.9259593,0.2570468 1.4669011,-1.0023252 2.1174031,-0.7966877 2.1174031,-0.7966877 0.421052,1.0665079 0.152967,1.8633533 0.07648,2.0560597 0.497535,0.539641 0.790853,1.2335096 0.790853,2.0816063 0,2.9812711 -1.798381,3.6365041 -3.5204379,3.8293681 0.2807011,0.244116 0.5229254,0.706642 0.5229254,1.439147 0,1.040804 -0.012621,1.876127 -0.012621,2.133016 0,0.205637 0.1403505,0.449911 0.5229245,0.372798 3.061224,-1.028189 5.267885,-3.932187 5.267885,-7.363054 0.01262,-4.292052 -3.443952,-7.7613964 -7.6913753,-7.7613964 z" />'
				}
			}
		];

		const configService = {
			getValueAsPath() { }
		};

		const httpService = {
			async get() { }
		};

		beforeEach(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});
		afterEach(() => {
			$injector.reset();
		});

		it('fetches a chips configuration', async () => {
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(`${backendUrl}/chips`).and.resolveTo(new Response(
				JSON.stringify(mockResponse))
			);

			const chipsConfiguration = await loadBvvChipConfiguration();

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(chipsConfiguration).toEqual(mockResponse);
		});

		it('throws an error when backend request cannot be fulfilled', async () => {

			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(`${backendUrl}/chips`).and.resolveTo(
				new Response(JSON.stringify({}), { status: 500 })
			);

			await expectAsync(loadBvvChipConfiguration()).toBeRejectedWithError('Chips configuration could not be fetched: Http-Status 500');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});
