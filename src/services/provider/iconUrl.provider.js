import { $injector } from '../../injection/index';
/**
 * A function that returns a factory to create a URL from a color.
 *
 * @typedef {function(): function} IconUrlProvider
 */

/**
 * Provides BVV specific implementation to create a icon url factory.
 * @param {string} iconName the icon name
 * @returns {function(Array<number>)} the function, which creates a icon url based on an Array of numbers, representing a rgb-color
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
