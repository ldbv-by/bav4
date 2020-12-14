/**
 * @class
 * @author aul
 */
export class HttpService {

	/**
	   * Wraps a Fetch API fetch call, so that a custom timeout can be set. Default is 1000ms.<br>
	   * If a timeout occurs, the request is cancelled by an <code>AbortController</code>.<br>
	   * In that case, a promise with an <code>AbortError</code> is returned.<br>
	   * Additionally, the request can be made cancelable by an custom <code>AbortController</code>.<br>
	   * @param {String} resource url
	   * @param {Object} [options] fetch api options, set timeout via timeout property, default is 1000ms
	   * @param {AbortController} [controller] controller which can be used to cancel the request 
	   * @returns Fetch API Response
	   * @see credits: https://dmitripavlutin.com/timeout-fetch-request/
	   */
	async fetch(resource, options = {}, controller = new AbortController()) {
		const { timeout = 1000 } = options;

		const id = setTimeout(() => controller.abort(), timeout);

		const response = await fetch(resource, {
			...options,
			signal: controller.signal
		});
		clearTimeout(id);

		return response;
	}
}