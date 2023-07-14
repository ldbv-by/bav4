/**
 * @module services/provider/icons_provider
 */
import { $injector } from '../../injection';
import { IconResult } from '../IconService';

/**
 * Bvv specific implementation of {@link module:services/IconService~iconProvider}
 * @function
 * @type {module:services/IconService~iconProvider}
 */
export const loadBvvIcons = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'icons';
	const result = await httpService.get(`${url}/available`);
	if (result.ok) {
		const icons = [];
		const payload = await result.json();

		const matcher = (id) => {
			return (idOrUrl) => idOrUrl === id || !!idOrUrl?.endsWith(`/${id}.png`);
		};

		const urlFactoryFunction = (id) => {
			return (color) => `${url}/${color[0]},${color[1]},${color[2]}/${id}.png`;
		};

		payload.forEach((bvvIcon) => {
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
