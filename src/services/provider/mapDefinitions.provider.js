
/**
 * Map related meta data
 * @typedef {Object} MapDefinitions
 * @property {Extent} defaultExtent
 */

/**
 * Meta data for a srid
 * @typedef {Object} SridDefinition
 * @property {string} label label
 * @property {number} code srid
 */

/**
 * Provider for map releated meta data
 * @returns {MapDefinitions} meta data 
 */
export const getBvvMapDefinitions = () => {
	return {
		defaultExtent: [995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462],
		srid: 3857,
		defaultSridForView: 25832,
		sridDefinitionsForView: [{ label: 'UTM', code: 25832 }, { label: 'WGS84', code: 4326 }],
		defaultGeodeticSrid: 25832
	};
};