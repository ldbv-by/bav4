/**
 * @module modules/olMap/utils/baaImageLoadFunction_provider
 */
import { $injector } from '../../../injection';

/**
 * Returns a BVV specific image load function loading restricted images via basic access authentication.
 * The requested maximum width and height of the image is limited to a configurable size (default is 2000x2000).
 * If width and/or height exceed the configured maximum size, the image will be scaled.
 * @param {Credential} credential
 * @param {number[]} maxSize maximum width and height of the requested image in px. Default is 2000*2000.
 * @returns ol.image.LoadFunction
 */
export const getBvvBaaImageLoadFunction = (credential, maxSize = [2000, 2000]) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	return async (image, src) => {
		const getObjectUrl = async (url) => {
			const { username, password } = credential;
			try {
				const response = await httpService.get(url, {
					timeout: 10000,
					headers: new Headers({
						Authorization: `Basic ${btoa(`${username}:${password}`)}`
					})
				});

				if (response.status !== 200) {
					throw new Error(`Unexpected network status ${response.status}`);
				}
				return URL.createObjectURL(await response.blob());
			} catch (error) {
				console.error('Image could not be fetched', error);
			}
		};

		const params = new URLSearchParams(src.split('?')[1]);
		const width = parseInt(params.get('WIDTH'));
		const height = parseInt(params.get('HEIGHT'));
		const scalingWidth = maxSize[0] / width;
		const scalingHeight = maxSize[1] / height;
		if (scalingWidth >= 1 && scalingHeight >= 1) {
			const url = `${configService.getValueAsPath('BACKEND_URL')}proxy/basicAuth/wms/map/?url=${encodeURIComponent(src)}`;
			image.getImage().src = credential ? await getObjectUrl(url) : src;
		} else {
			params.set('WIDTH', `${scalingWidth >= 1 ? width : Math.round(width * scalingWidth)}`);
			params.set('HEIGHT', `${scalingHeight >= 1 ? height : Math.round(height * scalingHeight)}`);
			const adjustedWmsUrl = `${src.split('?')[0]}?${params.toString()}`;
			const tempImage = document.createElement('img');
			tempImage.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(tempImage, 0, 0, width, height);
				image.getImage().src = canvas.toDataURL();
				URL.revokeObjectURL(tempImage.src);
			};
			tempImage.crossOrigin = 'anonymous';
			tempImage.src = credential
				? await getObjectUrl(`${configService.getValueAsPath('BACKEND_URL')}proxy/basicAuth/wms/map/?url=${encodeURIComponent(adjustedWmsUrl)}`)
				: adjustedWmsUrl;
		}
	};
};
