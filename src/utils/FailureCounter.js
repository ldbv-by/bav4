/**
 * @module utils/FailureCounter
 */
import { isFunction, isNumber } from './checks';

/**
 * Helper class that tracks the number of successful and failed operations and calls a function when a specified threshold value of fails is exceeded.
 *
 * The re-calculation of the statistic is done every time a new attempt is indicated.
 * @class
 */
export class FailureCounter {
	#failureCount = [];
	#successCount = [];
	#statsFailureThreshold;
	#statsIntervalInMs;
	#statsSampleSize;
	#onFailureFn;
	#ok = true;

	/**
	 *
	 * @param {number} interval The interval in seconds used for the calculation of the statistics (now - interval). This is the observation period.
	 * @param {number} threshold The threshold ratio (failure / success)
	 * @param {Function} [onFailureFn] The callback fn called when the threshold is exceeded
	 * @param {number} [minSampleSize = 20] The min sample size (failure + success) before the calculation begins
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
		this.#onFailureFn = onFailureFn;
		if (!isNumber(minSampleSize) || minSampleSize <= 0) {
			throw new Error(`"minSampleSize" must be a number and > 0`);
		}
		this.#statsSampleSize = minSampleSize;
	}

	/**
	 * Indicates a successful attempt and initializes a re-calculation of the statistics.
	 */
	indicateFailure() {
		this.#failureCount.push(new Date().getTime());
		this.#check();
	}

	/**
	 *  Indicates a failed attempt and initializes a re-calculation of the statistics.
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
					this.#onFailureFn();
					this.#ok = false;
				}
			} else {
				this.#ok = true;
			}
		}
	}

	get interval() {
		return this.#statsIntervalInMs / 1000;
	}

	get threshold() {
		return this.#statsFailureThreshold;
	}

	get minSampleSize() {
		return this.#statsSampleSize;
	}

	get onFailureFn() {
		return this.#onFailureFn;
	}
}
