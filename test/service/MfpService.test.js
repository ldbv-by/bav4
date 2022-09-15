import { MfpService } from '../../src/services/MfpService';
import { loadBvvMfpCapabilities } from '../../src/services/provider/mfp.provider';

describe('MfpService', () => {

	const scales = [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500];
	const dpis = [125, 200];
	const mockCapabilities = [
		{ id: 'a4_portrait', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 539, height: 722 } },
		{ id: 'a4_landscape', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 785, height: 475 } },
		{ id: 'a3_portrait', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 786, height: 1041 } },
		{ id: 'a3_landscape', urlId: 0, scales: scales, dpis: dpis, mapSize: { width: 1132, height: 692 } }
	];

	const setup = (provider = loadBvvMfpCapabilities) => {
		return new MfpService(provider);
	};

	describe('constructor', () => {

		it('initializes the with default providers', async () => {
			const instanceUnderTest = new MfpService();

			expect(instanceUnderTest._abortController).toBeNull();
			expect(instanceUnderTest._mfpCapabilitiesProvider).toEqual(loadBvvMfpCapabilities);
		});

		it('initializes the service with custom providers', async () => {
			const customProvider = async () => { };
			const instanceUnderTest = setup(customProvider);
			expect(instanceUnderTest._mfpCapabilitiesProvider).toEqual(customProvider);
		});
	});

	describe('getCapabilities', () => {

		it('provides an array of MfpCapabilities', async () => {
			const provider = jasmine.createSpy().and.resolveTo(mockCapabilities);
			const instanceUnderTest = setup(provider);

			// first call served from provider
			await expectAsync(instanceUnderTest.getCapabilities()).toBeResolvedTo(mockCapabilities);
			// second from cache
			await expectAsync(instanceUnderTest.getCapabilities()).toBeResolvedTo(mockCapabilities);
			expect(provider).toHaveBeenCalledTimes(1);
		});
	});

	describe('getCapabilitiesById', () => {

		it('provides a MfpCapabilities object by its id', async () => {
			const instanceUnderTest = setup(async () => mockCapabilities);
			// initially load capabilities
			await instanceUnderTest.getCapabilities();

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
});
