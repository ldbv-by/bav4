/* eslint-disable promise/prefer-await-to-then */

/**
 * Helper class to execute a number of asynchronous operations in order, one after another.
 * See https://dev.to/doctolib/using-promises-as-a-queue-co5 for more information.
 */
export class PromiseQueue {

	constructor() {
		this._queue = Promise.resolve(true);
	}

	/**
     * Puts the function to the internal queue.
     * @param {Function} fn
     * @async
     * @returns a Promise
     */
	async add(fn) {
		return new Promise((resolve, reject) => {
			this._queue = this._queue
				.then(fn)
				.then(resolve)
				.catch(reject);
		});
	}
}
