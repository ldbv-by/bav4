import { $injector } from '../../../injection';

/**
 * Returns a BVV specific image load function loading restricted images via basic access authentication.
 * @param {Credential} credential
 * @returns ol.image.LoadFunction
 */
export const getBvvBaaImageLoadFunction = credential => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	return async (image, src) => {

		const url = `${configService.getValueAsPath('BACKEND_URL')}proxy/basicAuth/wms/map/?url=${encodeURIComponent(src)}`;
		const { username, password } = credential;

		try {
			const response = await httpService.get(url, {
				timeout: 10000,
				headers: new Headers({
					'Authorization': `Basic ${btoa(`${username}:${password}`)}`
				})
			});

			if (response.status !== 200) {
				throw new Error(`Unexpected network status ${response.status}`);
			}
			image.getImage().src = URL.createObjectURL(await response.blob());
		}
		catch (error) {
			console.error('Image could not be fetched', error);
		}
	};
};
