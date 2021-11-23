import { $injector } from '../../injection';
import { IconResult } from '../IconService';

/**
  * A function that returns a promise with a Array of IconResult.
  *
  * @typedef {(Promise<IconResult>)} iconProvider
  */

/**
 *  Uses the BVV services to load icons
 * @returns {Array<IconResult>} with icons loaded from backend
 */
export const loadBvvIcons = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'icons';
	const result = await httpService.get(`${url}/available`);
	if (result.ok) {
		const icons = [];
		const payload = await result.json();


		payload.forEach(bvvIcon => {
			const { id, svg } = bvvIcon;
			icons.push(new IconResult(id, svg));

		});

		if (icons.length === 0) {
			console.warn('The retrieved Icons are invalid');
		}
		return icons;
	}
	throw new Error('Icons could not be retrieved');
};

/**
 * creates a URL based on Image-Resources from BVV services
 * @param {string} id the id of a specific icon
 * @param {Array<number>} color the rgb-color
 * @returns {string} the url to the icon
 */
export const getBvvIconsUrl = (id, color) => {
	const { ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'icons';

	return `${url}/${color[0]},${color[1]},${color[2]}/${id}`;
};
