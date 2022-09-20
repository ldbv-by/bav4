import { $injector } from '../../src/injection';
import { MfpService } from '../../src/services/MfpService';
import { loadMfpCapabilities } from '../../src/services/provider/mfp.provider';

describe('MfpService', () => {

	const environmentService = {
		isStandalone: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('EnvironmentService', environmentService);
	});

	const scales = [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500];
	const dpis = [125, 200];
	const mockCapabilities = [
		{ id: 'a4_portrait', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 539, height: 722 } },
		{ id: 'a4_landscape', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 785, height: 475 } },
		{ id: 'a3_portrait', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 786, height: 1041 } },
		{ id: 'a3_landscape', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 1132, height: 692 } }
	];

	const setup = (provider = loadMfpCapabilities) => {
		return new MfpService(provider);
	};

	describe('constructor', () => {

		it('instantiates the service with default providers', async () => {
			const instanceUnderTest = new MfpService();

			expect(instanceUnderTest._abortController).toBeNull();
			expect(instanceUnderTest._mfpCapabilitiesProvider).toEqual(loadMfpCapabilities);
		});

		it('instantiates the service with custom providers', async () => {
			const customProvider = async () => { };
			const instanceUnderTest = setup(customProvider);
			expect(instanceUnderTest._mfpCapabilitiesProvider).toEqual(customProvider);
		});
	});

	describe('init', () => {

		it('initializes the service', async () => {
			const instanceUnderTest = setup(async () => mockCapabilities);
			expect(instanceUnderTest._mfpCapabilities).toBeNull();

			const mfpCapabilities = await instanceUnderTest.init();

			expect(mfpCapabilities.length).toBe(4);
		});

		it('just provides the topics when already initialized', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._mfpCapabilities = mockCapabilities;

			const mfpCapabilities = await instanceUnderTest.init();

			expect(mfpCapabilities.length).toBe(4);
		});

		describe('provider cannot fulfill', () => {

			it('loads two fallback topics when we are in standalone mode', async () => {

				spyOn(environmentService, 'isStandalone').and.returnValue(true);
				const instanceUnderTest = setup(async () => {
					throw new Error('MfpCapabilities could not be loaded');
				});
				const warnSpy = spyOn(console, 'warn');


				const mfpCapabilities = await instanceUnderTest.init();

				expect(mfpCapabilities.length).toBe(2);
				expect(warnSpy).toHaveBeenCalledWith('MfpCapabilities could not be fetched from backend. Using fallback capabilities ...');
			});

			it('logs an error when we are NOT in standalone mode', async () => {

				spyOn(environmentService, 'isStandalone').and.returnValue(false);
				const instanceUnderTest = setup(async () => {
					throw new Error('something got wrong');
				});
				const errorSpy = spyOn(console, 'error');


				const mfpCapabilities = await instanceUnderTest.init();

				expect(mfpCapabilities).toEqual([]);
				expect(errorSpy).toHaveBeenCalledWith('MfpCapabilities could not be fetched from backend.', jasmine.anything());
			});
		});
	});

	describe('getCapabilities', () => {

		it('returns an empty array of MfpCapabilities when not initialized', async () => {
			const provider = jasmine.createSpy().and.resolveTo(mockCapabilities);
			const instanceUnderTest = setup(provider);

			expect(instanceUnderTest.getCapabilities()).toHaveSize(0);
		});

		it('returns an array of MfpCapabilities', async () => {
			const provider = jasmine.createSpy().and.resolveTo(mockCapabilities);
			const instanceUnderTest = setup(provider);
			await instanceUnderTest.init();

			// first call served from provider
			expect(instanceUnderTest.getCapabilities()).toEqual(mockCapabilities);
			// second from cache
			expect(instanceUnderTest.getCapabilities()).toEqual(mockCapabilities);
			expect(provider).toHaveBeenCalledTimes(1);
		});
	});

	describe('getCapabilitiesById', () => {

		it('returns NULL when not initialized', async () => {
			const instanceUnderTest = setup(async () => mockCapabilities);

			expect(instanceUnderTest.getCapabilitiesById('a4_landscape')).toBeNull();
		});

		it('returns a MfpCapabilities object by its id', async () => {
			const instanceUnderTest = setup(async () => mockCapabilities);
			await instanceUnderTest.init();

			expect(instanceUnderTest.getCapabilitiesById('a4_landscape')).not.toBeNull();
			expect(instanceUnderTest.getCapabilitiesById('foo')).toBeNull();
		});
	});

	describe('createJob', () => {

		it('creates a new MFP job and returns a URL pointing to the generated resource', async () => {
			const instanceUnderTest = new MfpService();
			const mfpSpec = { foo: 'bar' };

			const promise = instanceUnderTest.createJob(mfpSpec);

			expect(instanceUnderTest._abortController).not.toBeNull();
			await expectAsync(promise).toBeResolvedTo('http://www.africau.edu/images/default/sample.pdf');
			expect(instanceUnderTest._abortController).toBeNull();
		});
	});

	describe('cancelJob', () => {

		it('cancels an running MFP job', async () => {
			const instanceUnderTest = new MfpService();
			const mfpSpec = { foo: 'bar' };
			instanceUnderTest.createJob(mfpSpec);
			const spy = spyOn(instanceUnderTest._abortController, 'abort');

			instanceUnderTest.cancelJob();

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('_newFallbackCapabilities', () => {

		it('cancels an running MFP job', async () => {
			const expected = [
				{ id: 'a4_landscape', urlId: 0, mapSize: { width: 785, height: 475 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] },
				{ id: 'a4_portrait', urlId: 0, mapSize: { width: 539, height: 722 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }
			];
			const instanceUnderTest = new MfpService();

			expect(instanceUnderTest._newFallbackCapabilities()).toEqual(expected);
		});
	});
});
