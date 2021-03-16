import { $injector } from '../../injection';

export const shortenBvvUrls = async (url) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const shortenGetRequestUrl = `${configService.getValueAsPath('SHORTENING_SERVICE_URL')}?createcode=${encodeURIComponent(url)}`;
	const response = await httpService.fetch(shortenGetRequestUrl);

	if (response.ok) {
		const result = await response.json();
		return result.shorturl;
	}
	throw new Error('A short url could not be retrieved');
};