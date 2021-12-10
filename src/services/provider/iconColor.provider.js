/**
  * A function that returns a rgb-color as Array of numbers from a icon-url.
  *
  * @typedef {Function} iconColorProvider
  * @param {string} iconUrl the url for a valid icon
  * @returns {<Array<number>} the rgb-color as array
  */

/**
 * Provides BVV specific implementation to read color-information from the icon-url.
 * @param {string} iconUrl
 * @returns {<Array<number>|null} the rgb-color as array
 */
export const getBvvIconColor = (iconUrl) => {
	const regEx = /([0-9]{0,3}),([0-9]{0,3}),([0-9]{0,3})+/g;
	const colorComponents = iconUrl.match(regEx);
	if (colorComponents) {
		return colorComponents[0].split(',').map(c => parseInt(c));
	}
	return null;
};
