import { $injector } from '../../injection';
/**
 * @returns {Array} with icons loaded from backend
 */
export const loadBvvIcons = async () => {
    const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
    const url = configService.getValueAsPath('BACKEND_URL') + '/icons';
    const result = await httpService.get(`${url}/available`);

    const defaultColor = '50,50,50';


    if (result.ok) {
        const icons = [];
        const payload = await result.json();
        payload.forEach(id => {
            const iconURLTemplate = {
                default: `${url}/${defaultColor}/${id}`,
                colored: (r, g, b) => `${url}/${r},${g},${b}/${id}`
            };
            icons.push(iconURLTemplate);
        });
        return icons;
    }
    throw new Error('Icons could not be retrieved');
};
