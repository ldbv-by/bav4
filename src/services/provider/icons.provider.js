import { $injector } from '../../injection';
import { IconResult } from '../IconService';

/**
 * @returns {Array} with icons loaded from backend
 */
export const loadBvvIcons = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + '/icons';
	const result = await httpService.get(`${url}/available`);

	if (result.ok) {
		const icons = [];
		const payload = await result.json();
		const isValidSvg = (svg) => {
			if (typeof (svg) === 'string') {
				return svg.startsWith('<svg>') && svg.endsWith('</svg>');
			}
			return false;
		};
		payload.forEach(bvvIcon => {
			const { id, svg } = bvvIcon;
			if (isValidSvg(svg)) {
				icons.push(new IconResult(id, svg));
			}
		});

		if (icons.length === 0) {
			console.warn('The retrieved Icons are invalid');
		}
		return icons;
	}
	throw new Error('Icons could not be retrieved');
};

/**
 *
 * @param {string} id the id of a specific icon
 * @returns {string} the url to the icon
 */
export const getBvvIconsUrl = async (id, color) => {
	const { ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + '/icons';

	return `${url}/${color[0]},${color[1]},${color[2]}/${id}`;
};
