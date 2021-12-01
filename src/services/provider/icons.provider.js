import { $injector } from '../../injection';
import { IconResult } from '../IconService';

/**
  * A function that returns a promise with a Array of IconResults.
  *
  * @typedef {Function} iconProvider
  * @returns {(Promise<Array<IconResult>>)}
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

		const matcher = (id) => {
			return (idOrUrl) => idOrUrl === id || idOrUrl.endsWith(id);
		};

		const urlFactoryFunction = (id) => {
			return (color) => `${url}/${color[0]},${color[1]},${color[2]}/${id}`;
		};

		payload.forEach(bvvIcon => {
			const { id, svg } = bvvIcon;
			icons.push(new IconResult(id, svg, matcher(id), urlFactoryFunction(id)));

		});

		if (icons.length === 0) {
			console.warn('The backend provides no icons');
		}
		return icons;
	}
	throw new Error('Icons could not be retrieved');
};
