import { $injector } from '../../injection';
/**
  * A function that returns a url-string for the specified icon-id and color.
  *
  * @typedef {Function} iconUrlProvider
  * @param {string} id the id of a specific icon
  * @param {Array<number>} color the rgb-color
  * @returns {string} the url to the icon
  */

/**
 * creates a URL based on Image-Resources from BVV services
 * @param {string} id the id of a specific icon
 * @param {Array<number>} color the rgb-color
 * @returns {string} the url to the icon
 */
export const getBvvIconsUrl = (id, color) => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'icons';

	return `${url}/${color[0]},${color[1]},${color[2]}/${id}`;
};
