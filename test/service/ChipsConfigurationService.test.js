import { $injector } from '../../src/injection';
import { ChipsConfigurationService } from '../../src/services/ChipsConfigurationService';
import { loadBvvChipConfiguration } from '../../src/services/provider/chipsConfiguration.provider';

describe('ChipsCofigurationService', () => {
	const environmentService = {
		isStandalone: () => {}
	};

	beforeAll(() => {
		$injector.registerSingleton('EnvironmentService', environmentService);
	});

	const chip0 = {
		id: 'foo',
		title: 'geoResources', // required
		href: 'https://geoportal.bayern.de/denkmalatlas/liste.html', // required
		permanent: false, // required
		target: 'external', // required ["modal", "external"]
		observer: {
			// required [object, null]
			geoResources: [
				// required
				'luftbild'
			],
			topics: [
				// required
			]
		},
		style: {
			// required
			colorLight: 'var(--primary-color)', // required
			backgroundColorLight: 'var(--primary-bg-color)', // required
			colorDark: 'var(--primary-color)', // required
			backgroundColorDark: 'var(--primary-bg-color)', // required
			icon: '<path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293V6.5z"/><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>'
		}
	};
	const chip1 = {
		id: 'bar',
		title: 'BR-Radeltour',
		href: 'https://www.geodaten.bayern.de/bayernatlas-info/grundsteuer-firststeps/index.html',
		permanent: true,
		target: 'modal',
		observer: null,
		style: {
			colorLight: 'var(--primary-color)', // required
			backgroundColorLight: 'var(--primary-bg-color)', // required
			colorDark: 'var(--primary-color)', // required
			backgroundColorDark: 'var(--primary-bg-color)', // required
			icon: '<path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>'
		}
	};

	const mockProvider = async () => [chip0, chip1];

	const setup = (provider = mockProvider) => {
		return new ChipsConfigurationService(provider);
	};

	describe('constructor', () => {
		it('initializes the service with a custom provider', async () => {
			const instanceUnderTest = setup();

			expect(instanceUnderTest._provider).toEqual(mockProvider);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new ChipsConfigurationService();

			expect(instanceUnderTest._provider).toEqual(loadBvvChipConfiguration);
		});
	});

	describe('all', () => {
		it('provides configurations from provider', async () => {
			const instanceUnderTest = setup();

			const configurations = await instanceUnderTest.all();

			expect(configurations.length).toBe(2);
		});

		it('provides all configurations from internal cache provider', async () => {
			const instanceUnderTest = setup(async () => null);
			instanceUnderTest._configurations = [chip0];

			const configurations = await instanceUnderTest.all();

			expect(configurations.length).toBe(1);
		});

		describe('provider cannot fulfill', () => {
			it('loads three fallback chips when we are in standalone mode', async () => {
				spyOn(environmentService, 'isStandalone').and.returnValue(true);
				const instanceUnderTest = setup(async () => {
					throw new Error('Chips configuration could not be loaded');
				});
				const warnSpy = spyOn(console, 'warn');

				const configurations = await instanceUnderTest.all();

				expect(configurations.length).toBe(3);
				expect(warnSpy).toHaveBeenCalledWith('Chips configuration could not be fetched from backend. Using fallback configuration ...');
			});

			it('logs an error when we are NOT in standalone mode', async () => {
				const message = 'something got wrong';
				spyOn(environmentService, 'isStandalone').and.returnValue(false);
				const instanceUnderTest = setup(async () => {
					throw message;
				});
				const errorSpy = spyOn(console, 'error');

				const configurations = await instanceUnderTest.all();

				expect(configurations).toEqual([]);
				expect(errorSpy).toHaveBeenCalledWith('Chips configuration could not be fetched from backend.', message);
			});
		});
	});
});
