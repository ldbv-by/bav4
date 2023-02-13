/**
 * Helpers to reduce event trigger rate.
 * @see: https://codeburst.io/throttling-and-debouncing-in-javascript-646d076d0a44
*/

/**
 * Throttling is a straightforward reduction of the trigger rate.
 * It will cause the event listener to ignore some portion of the events
 * while still firing the listeners at a constant (but reduced) rate.
 * <br>
 * Usage:
 * <pre>
 *  const myHandler = (event) => // do something with the event
 *  const tHandler = throttled(200, myHandler);
 *  tHandler(event)
 * </pre>
 * @param {number} delay Delay in ms
 * @param {Function} fn The wrapped function
 * @returns {Function} A function that throttles the wrapped function when called
 }}
 */
export function throttled(delay, fn) {
	let lastCall = 0;
	return function (...args) {
		const now = (new Date).getTime();
		if (now - lastCall < delay) {
			return;
		}
		lastCall = now;
		return fn(...args);
	};
}

/**
 * Debouncing is a technique of keeping the trigger rate at exactly 0 until a period of calm,
 * and then triggering the listener exactly once.
 * <br>
 * Usage:
 * <pre>
 *  const myHandler = (event) => // do something with the event
 *  const dHandler = debounced(200, myHandler);
 *  dHandler(event)
 * </pre>
 * @param {number} delay Delay in ms
 * @param {Function} fn The wrapped function
 * @returns {Function} A function that debounces the wrapped function when called
 */
export function debounced(delay, fn) {
	let timerId;
	return function (...args) {
		if (timerId) {
			clearTimeout(timerId);
		}
		timerId = setTimeout(() => {
			fn(...args);
			timerId = null;
		}, delay);
	};
}

/**
 * Helper function for delaying an execution. Primarily thought for simulating delayed responses, e.g. from of backend endpoints.
 * @param {number} milliseconds number of milliseconds
 * @returns {Promise}
 */
export const sleep = async (milliseconds) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
};


