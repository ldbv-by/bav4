/**
 * @module utils/attributionUtils
 */
/**
 * Returns a unique array of Copyright object from an array of GeoResources.
 * @param {GeoResource} geoResources
 * @param {number} [zoomLevel=0] zoomLevel
 * @returns unique array of Copyright objects
 */
export const getUniqueCopyrights = (geoResources = [], zoomLevel = 0) => {
	const availableCopyrights = geoResources
		.map((g) =>
			g /* let's be defensive here*/
				?.getAttribution(zoomLevel)
		)
		//remove null/undefined
		.filter((attr) => !!attr)
		.flat()
		.reverse()
		.map((attr) => (Array.isArray(attr.copyright) ? attr.copyright : [attr?.copyright])) // copyright property may be an array or null
		.flat()
		//remove null/undefined
		.filter((copyr) => !!copyr);

	//make array unique by label
	const uniqueCopyrights = availableCopyrights.filter((copyr, index) => {
		return availableCopyrights.findIndex((item) => item.label === copyr.label) === index;
	});

	return uniqueCopyrights;
};
