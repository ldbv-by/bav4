import { $injector } from '../../src/injection';
import { BvvMfpService } from '../../src/services/MfpService';
import { deleteMfpJob, getMfpCapabilities, postMpfSpec } from '../../src/services/provider/mfp.provider';

describe('BvvMfpService', () => {

	const environmentService = {
		isStandalone: () => { }
	};
	const abortControllerMock = {
		abort: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('EnvironmentService', environmentService);
	});

	const scales = [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500];
	const dpis = [125, 200];
	const bvvMockCapabilities = {
		urlId: '0',
		layouts: [
			{ id: 'a4_portrait', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 539, height: 722 } },
			{ id: 'a4_landscape', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 785, height: 475 } },
			{ id: 'a3_portrait', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 786, height: 1041 } },
			{ id: 'a3_landscape', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 1132, height: 692 } }
		] };

	const setup = (capabilitiesProvider = getMfpCapabilities, postMfpSpecProvider = postMpfSpec, cancelJobProvider = deleteMfpJob) => {
		return new BvvMfpService(capabilitiesProvider, postMfpSpecProvider, cancelJobProvider);
	};

	describe('constructor', () => {

		it('instantiates the service with default providers', async () => {
			const instanceUnderTest = new BvvMfpService();

			expect(instanceUnderTest._abortController).toBeNull();
			expect(instanceUnderTest._mfpCapabilitiesProvider).toEqual(getMfpCapabilities);
			expect(instanceUnderTest._createMpfSpecProvider).toEqual(postMpfSpec);
			expect(instanceUnderTest._cancelJobProvider).toEqual(deleteMfpJob);
			expect(instanceUnderTest._urlId).toBe('0');
			expect(instanceUnderTest._jobId).toBeNull();
		});

		it('instantiates the service with custom providers', async () => {
			const customCapabilitiesProvider = async () => { };
			const customPostMfpSpecProvider = async () => { };
			const customCancelMfpProvider = async () => { };

			const instanceUnderTest = setup(customCapabilitiesProvider, customPostMfpSpecProvider, customCancelMfpProvider);

			expect(instanceUnderTest._mfpCapabilitiesProvider).toEqual(customCapabilitiesProvider);
			expect(instanceUnderTest._createMpfSpecProvider).toEqual(customPostMfpSpecProvider);
			expect(instanceUnderTest._cancelJobProvider).toEqual(customCancelMfpProvider);
			expect(instanceUnderTest._urlId).toBe('0');
			expect(instanceUnderTest._jobId).toBeNull();
		});
	});

	describe('init', () => {

		it('initializes the service', async () => {
			const instanceUnderTest = setup(async () => bvvMockCapabilities);
			expect(instanceUnderTest._mfpCapabilities).toBeNull();

			const mfpCapabilities = await instanceUnderTest.init();

			expect(mfpCapabilities.length).toBe(4);
		});

		it('just provides the capabilities when already initialized', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._mfpCapabilities = bvvMockCapabilities.layouts;

			const mfpCapabilities = await instanceUnderTest.init();

			expect(mfpCapabilities.length).toBe(4);
		});

		describe('provider cannot fulfill', () => {

			it('loads fallback capabilities when we are in standalone mode', async () => {

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
			const provider = jasmine.createSpy().and.resolveTo(bvvMockCapabilities.layouts);
			const instanceUnderTest = setup(provider);

			expect(instanceUnderTest.getCapabilities()).toHaveSize(0);
		});

		it('returns an array of MfpCapabilities', async () => {
			const provider = jasmine.createSpy().and.resolveTo(bvvMockCapabilities);
			const instanceUnderTest = setup(provider);
			await instanceUnderTest.init();

			// first call served from provider
			expect(instanceUnderTest.getCapabilities()).toEqual(bvvMockCapabilities.layouts);
			// second from cache
			expect(instanceUnderTest.getCapabilities()).toEqual(bvvMockCapabilities.layouts);
			expect(provider).toHaveBeenCalledTimes(1);
		});
	});

	describe('getCapabilitiesById', () => {

		it('returns NULL when not initialized', async () => {
			const instanceUnderTest = setup(async () => bvvMockCapabilities);

			expect(instanceUnderTest.getCapabilitiesById('a4_landscape')).toBeNull();
		});

		it('returns a MfpCapabilities object by its id', async () => {
			const instanceUnderTest = setup(async () => bvvMockCapabilities);
			await instanceUnderTest.init();

			expect(instanceUnderTest.getCapabilitiesById('a4_landscape')).not.toBeNull();
			expect(instanceUnderTest.getCapabilitiesById('foo')).toBeNull();
		});
	});

	describe('createJob', () => {

		it('creates a new MFP job and returns a URL pointing to the generated resource', async () => {
			const bvvMfpJob = {
				downloadURL: 'http://foo.bar',
				id: 'id'
			};
			const postMfpSpecProvider = jasmine.createSpy().and.resolveTo(bvvMfpJob);
			const instanceUnderTest = setup(null, postMfpSpecProvider);
			const mfpSpec = { foo: 'bar' };

			const promise = instanceUnderTest.createJob(mfpSpec);

			expect(instanceUnderTest._abortController).not.toBeNull();
			expect(instanceUnderTest._jobId).toBeNull();
			expect(postMfpSpecProvider).toHaveBeenCalledWith(mfpSpec, instanceUnderTest._urlId, instanceUnderTest._abortController);
			await expectAsync(promise).toBeResolvedTo(bvvMfpJob.downloadURL);
			expect(instanceUnderTest._abortController).toBeNull();
			expect(instanceUnderTest._jobId).toBe(bvvMfpJob.id);
		});

		describe('provider returns NULL (fetch request was aborted)', () => {

			it('returns NULL', async () => {
				const postMfpSpecProvider = jasmine.createSpy().and.resolveTo(null);
				const instanceUnderTest = setup(null, postMfpSpecProvider);
				const mfpSpec = { foo: 'bar' };

				const promise = instanceUnderTest.createJob(mfpSpec);

				expect(instanceUnderTest._abortController).not.toBeNull();
				expect(instanceUnderTest._jobId).toBeNull();
				expect(postMfpSpecProvider).toHaveBeenCalledWith(mfpSpec, instanceUnderTest._urlId, instanceUnderTest._abortController);
				await expectAsync(promise).toBeResolvedTo(null);
				expect(instanceUnderTest._abortController).toBeNull();
				expect(instanceUnderTest._jobId).toBeNull();
			});
		});

		describe('provider cannot fulfill', () => {

			it('it simultates creating the Mfp job when we are in standalone mode', async () => {
				const mfpSpec = { foo: 'bar' };
				spyOn(environmentService, 'isStandalone').and.returnValue(true);
				const instanceUnderTest = setup(null, async () => {
					throw new Error('MFP spec could not be posted');
				});
				const warnSpy = spyOn(console, 'warn');

				const result = await instanceUnderTest.createJob(mfpSpec);

				expect(result).toBe('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
				expect(warnSpy).toHaveBeenCalledWith('No backend available, simulating Pdf request...');
				expect(instanceUnderTest._abortController).toBeNull();
			});

			it('logs an error when we are NOT in standalone mode', async () => {
				const mfpSpec = { foo: 'bar' };
				spyOn(environmentService, 'isStandalone').and.returnValue(false);
				const instanceUnderTest = setup(null, async () => {
					throw new Error('MFP spec could not be posted');
				});

				const promise = instanceUnderTest.createJob(mfpSpec);

				await expectAsync(promise).toBeRejectedWithError('Pdf request was not successful: Error: MFP spec could not be posted');
				expect(instanceUnderTest._abortController).toBeNull();
			});
		});
	});

	describe('cancelJob', () => {

		it('cancels a running MFP job by its id', async () => {
			const id = 'id';
			const cancelJobProvider = jasmine.createSpy().and.resolveTo();
			const instanceUnderTest = setup(null, null, cancelJobProvider);
			instanceUnderTest._jobId = 'id';
			instanceUnderTest._abortController = abortControllerMock;
			const abortControllerSpy = spyOn(abortControllerMock, 'abort');

			instanceUnderTest.cancelJob();

			expect(cancelJobProvider).toHaveBeenCalledWith(id, instanceUnderTest._urlId);
			expect(abortControllerSpy).toHaveBeenCalled();
			expect(instanceUnderTest._jobId).toBeNull();
		});

		it('does nothing when jobId is NULL', async () => {
			const cancelJobProvider = jasmine.createSpy();
			const instanceUnderTest = setup(null, null, cancelJobProvider);

			instanceUnderTest.cancelJob();

			expect(cancelJobProvider).not.toHaveBeenCalled();
			expect(instanceUnderTest._jobId).toBeNull();
		});
	});

	describe('_newFallbackCapabilities', () => {

		it('cancels a running MFP job', async () => {
			const expected = [
				{ id: 'a4_landscape', urlId: 0, mapSize: { width: 785, height: 475 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] },
				{ id: 'a4_portrait', urlId: 0, mapSize: { width: 539, height: 722 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }
			];
			const instanceUnderTest = new BvvMfpService();

			expect(instanceUnderTest._newFallbackCapabilities()).toEqual(expected);
		});
	});
});
