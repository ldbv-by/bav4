/**
 * Removes all undefined properties from an object.
 * @param {*} object
 * @returns The cleaned object
 */
export const removeUndefinedProperties = (object) => {
	return Object.entries(object)
		.filter(([, value]) => value !== undefined)
		.reduce((obj, [key, value]) => {
			obj[key] = value;
			return obj;
		}, {});
};
