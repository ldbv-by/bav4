/**
 * Helper function for delaying an execution. Primarily thought for simulating delayed responses, e.g. from of backend endpoints.
 * @param {number} milliseconds number of milliseconds
 * @returns {Promise}
 */
export const sleep = async (milliseconds) => {
	return await new Promise(resolve => setTimeout(resolve, milliseconds));
};
