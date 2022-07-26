import { MfpService } from '../../src/services/MfpService';

describe('MfpService', () => {

	describe('init', () => {

		it('initializes the service', async () => {
			const instanceUnderTest = new MfpService();

			expect(instanceUnderTest._abortController).toBeNull();
		});
	});

	describe('getCapabilities', () => {

		it('provides an array of MfpCapabilities', async () => {

			const instanceUnderTest = new MfpService();

			const result = await instanceUnderTest.getCapabilities();

			expect(result).toHaveSize(4);
		});
	});

	describe('getCapabilitiesById', () => {

		it('provides a MfpCapabilities object by its id', () => {

			const instanceUnderTest = new MfpService();

			expect(instanceUnderTest.getCapabilitiesById('a4_landscape')).not.toBeNull();
			expect(instanceUnderTest.getCapabilitiesById('foo')).toBeNull();
		});
	});


	describe('createJob', () => {

		it('creates a new MFP job and returns a URL pointing to the generated resource', async () => {
			const instanceUnderTest = new MfpService();
			const mfpSpec = { foo: 'bar' };

			const promise = instanceUnderTest.createJob(mfpSpec);

			expectAsync(promise).toBeResolvedTo('http://www.africau.edu/images/default/sample.pdf');
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
