/**
 * @module utils/FailureCounter
 */
import { isFunction, isNumber } from './checks';

/**
 * Helper class that tracks the number of successful and failed operations and calls a fn when a threshold value is exceeded.
 */
export class FailureCounter {
	#failureCount = [];
	#successCount = [];
	#statsFailureThreshold;
	#statsIntervalInMs;
	#statsSampleSize;
	#onThresholdFn;
	#ok = true;

	/**
	 *
	 * @param {number} interval The interval in seconds used for the calculation of the statistics (now - interval)
	 * @param {number} threshold The threshold ratio (failure / success)
	 * @param {Function} onFailureFn The callback fn
	 * @param {number} [minSampleSize = 20] The min sample size (failure + success)
	 */
	constructor(interval, threshold, onFailureFn, minSampleSize = 20) {
		if (!isNumber(interval) || interval <= 0) {
			throw new Error(`"interval" must be a number and > 0`);
		}
		this.#statsIntervalInMs = interval * 1000;
		if (!isNumber(threshold) || threshold > 1 || threshold < 0) {
			throw new Error(`"threshold" must be a number between 0 - 1`);
		}
		this.#statsFailureThreshold = threshold;
		if (!isFunction(onFailureFn)) {
			throw new Error(`"onFailureFn" must be a function`);
		}
		this.#onThresholdFn = onFailureFn;
		if (!isNumber(minSampleSize) || minSampleSize <= 0) {
			throw new Error(`"minSampleSize" must be a number and > 0`);
		}
		this.#statsSampleSize = minSampleSize;
	}

	/**
	 * Indicates a successful attempt
	 */
	indicateFailure() {
		this.#failureCount.push(new Date().getTime());
		this.#check();
	}

	/**
	 *  Indicates a failed attempt
	 */
	indicateSuccess() {
		this.#successCount.push(new Date().getTime());
		this.#check();
	}

	#check() {
		const tsThreshold = new Date().getTime() - this.#statsIntervalInMs;
		this.#failureCount = this.#failureCount.filter((ts) => ts > tsThreshold);
		this.#successCount = this.#successCount.filter((ts) => ts > tsThreshold);

		if (this.#failureCount.length + this.#successCount.length >= this.#statsSampleSize) {
			const currentRatio = this.#failureCount.length / (this.#failureCount.length + this.#successCount.length);
			if (currentRatio >= this.#statsFailureThreshold) {
				if (this.#ok) {
					this.#onThresholdFn();
					this.#ok = false;
				}
			} else {
				this.#ok = true;
			}
		}
	}
}
