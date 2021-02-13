
/**
 * Map related meta data
 * @typedef {Object} MapDefinitions
 * @property {Extent} defaultExtent
 */

/**
 * Provider for map releated meta data
 * @returns {MapDefinitions} meta data 
 */
export const getBvvMapDefinitions = () => {
	return {
		defaultExtent : [995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462]
	};
};