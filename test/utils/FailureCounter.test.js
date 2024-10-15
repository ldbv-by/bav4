import { FailureCounter } from '../../src/utils/FailureCounter';
import { TestUtils } from '../test-utils';

describe('FailureCounter', () => {
	describe('constructor', () => {
		it('validates its parameters', async () => {
			expect(() => new FailureCounter()).toThrowError(`"interval" must be a number and > 0`);
			expect(() => new FailureCounter(0)).toThrowError(`"interval" must be a number and > 0`);

			expect(() => new FailureCounter(1, 'foo')).toThrowError(`"threshold" must be a number between 0 - 1`);
			expect(() => new FailureCounter(1, 1.1)).toThrowError(`"threshold" must be a number between 0 - 1`);
			expect(() => new FailureCounter(1, -0.1)).toThrowError(`"threshold" must be a number between 0 - 1`);

			expect(() => new FailureCounter(1, 0.5, 'foo')).toThrowError(`"onFailureFn" must be a function`);

			expect(() => new FailureCounter(1, 0.5, () => {}, 'foo')).toThrowError(`"minSampleSize" must be a number and > 0`);
			expect(() => new FailureCounter(1, 0.5, () => {}, -1)).toThrowError(`"minSampleSize" must be a number and > 0`);
		});
	});

	describe('properties', () => {
		it('provides getters', () => {
			const failureFn = () => {};
			const failureCounter = new FailureCounter(1, 0.5, failureFn, 42);

			expect(failureCounter.onFailureFn).toEqual(failureFn);
			expect(failureCounter.interval).toEqual(1);
			expect(failureCounter.threshold).toEqual(0.5);
			expect(failureCounter.minSampleSize).toEqual(42);
		});
	});

	describe('calculate the threshold', () => {
		/**
		 * Threshold is 0.5, sample size = 20
		 */
		describe('calculated value is greater than the exact threshold', () => {
			it('calls the callback fn when given ratio is reached for default sample size', async () => {
				const spy = jasmine.createSpy();
				const instanceUnderTest = new FailureCounter(10, 0.5, spy);

				for (let index = 0; index < 9; index++) {
					instanceUnderTest.indicateSuccess();
					instanceUnderTest.indicateFailure();
				}
				instanceUnderTest.indicateSuccess();

				expect(spy).not.toHaveBeenCalled();

				instanceUnderTest.indicateFailure();

				expect(spy).toHaveBeenCalled();
			});
		});

		describe('we have a custom sample size', () => {
			/**
			 * Threshold is 0.5, sample size = 40
			 */
			it('calls the callback fn', async () => {
				const spy = jasmine.createSpy();
				const instanceUnderTest = new FailureCounter(10, 0.5, spy, 40);

				for (let index = 0; index < 19; index++) {
					instanceUnderTest.indicateSuccess();
					instanceUnderTest.indicateFailure();
				}
				instanceUnderTest.indicateSuccess();

				expect(spy).not.toHaveBeenCalled();

				instanceUnderTest.indicateFailure();

				expect(spy).toHaveBeenCalled();
			});
		});

		describe('calculated value meets the exact threshold', () => {
			it('calls the callback fn', async () => {
				const spy = jasmine.createSpy();
				const instanceUnderTest = new FailureCounter(10, 0.5, spy);

				/**
				 * Exactly 0.5
				 */
				for (let index = 0; index < 10; index++) {
					instanceUnderTest.indicateSuccess();
					instanceUnderTest.indicateFailure();
				}

				expect(spy).toHaveBeenCalled();
			});
		});

		describe('calculated value does NOT meet the exact threshold', () => {
			it('does NOT call the callback fn', async () => {
				const spy = jasmine.createSpy();
				const instanceUnderTest = new FailureCounter(10, 0.5, spy);

				for (let index = 0; index < 9; index++) {
					instanceUnderTest.indicateSuccess();
					instanceUnderTest.indicateFailure();
				}
				instanceUnderTest.indicateSuccess();
				instanceUnderTest.indicateSuccess();

				expect(spy).not.toHaveBeenCalled();
			});
		});

		describe('calculated value meets the exact threshold', () => {
			it('calls the callback fn exactly once', async () => {
				const spy = jasmine.createSpy();
				const instanceUnderTest = new FailureCounter(10, 0.5, spy);

				// 25 bad one, callback is called
				for (let index = 0; index < 24; index++) {
					instanceUnderTest.indicateFailure();
				}
				expect(spy).toHaveBeenCalled();
				// 25 bad again one
				for (let index = 0; index < 24; index++) {
					instanceUnderTest.indicateFailure();
				}

				expect(spy).toHaveBeenCalledTimes(1);
			});

			it('calls the callback fn again after the configured interval has passed and the threshold felt below in the meantime', async () => {
				const spy = jasmine.createSpy();
				const instanceUnderTest = new FailureCounter(0.1, 0.5, spy);

				for (let index = 0; index < 24; index++) {
					instanceUnderTest.indicateFailure();
				}
				await TestUtils.timeout(200);
				for (let index = 0; index < 24; index++) {
					instanceUnderTest.indicateSuccess();
				}
				await TestUtils.timeout(200);
				for (let index = 0; index < 24; index++) {
					instanceUnderTest.indicateFailure();
				}

				expect(spy).toHaveBeenCalledTimes(2);
			});
		});
	});
});
