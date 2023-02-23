/**
 * Loop through an objects own properties and execute an action.
 * Action function will be provided the current key and the property assign to that key.
 * @param  {object} obj    Object to loop through.
 * @param  {function} action Action to perform on each property.
 */
export const forEachPropertyDoAction = function (obj, action) {
	for (const key in obj) {
		// eslint-disable-next-line no-prototype-builtins
		if (obj.hasOwnProperty(key)) {
			action(key, obj[key]);
		}
	}
};
