import { $injector } from '../../injection';
import { IconResult } from '../IconService';

/**
 * @returns {Array} with icons loaded from backend
 */
export const loadBvvIcons = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + '/icons';
	const result = await httpService.get(`${url}/svg`);

	if (result.ok) {
		const icons = [];
		const payload = await result.json();
		payload.forEach((id, svg) => {
			icons.push(new IconResult(id, svg));
		});
		return icons;
	}
	throw new Error('Icons could not be retrieved');
};
