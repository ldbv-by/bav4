/**
 * @module services/provider/iconUrl_provider
 */

import { $injector } from '../../injection/index';

/**
 * Bvv specific implementation of {@link module:services/IconService~iconUrlProvider}
 * @function
 * @type {module:services/IconService~iconUrlProvider}
 */
export const getBvvIconUrlFactory = (iconName) => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	return (color) => {
		try {
			const url = configService.getValueAsPath('BACKEND_URL') + 'icons';
			return `${url}/${color[0]},${color[1]},${color[2]}/${iconName}.png`;
		} catch (e) {
			console.warn('No backend-information available.');
		}
		return null;
	};
};
