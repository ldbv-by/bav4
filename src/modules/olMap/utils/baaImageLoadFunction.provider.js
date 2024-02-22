/**
 * @module modules/olMap/utils/baaImageLoadFunction_provider
 */
import { $injector } from '../../../injection';
import { LevelTypes, emitNotification } from '../../../store/notifications/notifications.action';

/**
 * Returns a BVV specific image load function loading restricted images via basic access authentication.
 * The requested maximum width and height of the image is limited to a configurable size (default is 2000x2000).
 * If width and/or height exceed the configured maximum size, the image will be scaled.
 * @function
 * @type {module:modules/olMap/services/LayerService~baaImageLoadFunctionProvider}
 */
export const getBvvBaaImageLoadFunction = (geoResourceId, credential = null, maxSize = [2000, 2000]) => {
	const {
		HttpService: httpService,
		ConfigService: configService,
		TranslationService: translationService,
		GeoResourceService: geoResourceService
	} = $injector.inject('HttpService', 'ConfigService', 'TranslationService', 'GeoResourceService');
	const translate = (key, params = []) => translationService.translate(key, params);

	return async (image, src) => {
		const timeout = 10_000;
		const handleUnexpectedStatusCode = (response) => {
			switch (response.status) {
				case 401:
					emitNotification(
						`${translate('global_geoResource_not_available', [geoResourceId, translate('global_geoResource_unauthorized')])}`,
						LevelTypes.WARN
					);
					break;
				case 403:
					emitNotification(
						`${translate('global_geoResource_not_available', [geoResourceId, translate('global_geoResource_forbidden')])}`,
						LevelTypes.WARN
					);
					break;
				default:
					emitNotification(`${translate('global_geoResource_not_available', [geoResourceId])}`, LevelTypes.WARN);
					break;
			}
			throw new Error(`Unexpected network status ${response.status}`);
		};

		const getObjectUrlForBaa = async (url) => {
			const { username, password } = credential;
			try {
				const response = await httpService.get(url, {
					timeout,
					headers: new Headers({
						Authorization: `Basic ${btoa(`${username}:${password}`)}`
					})
				});

				if (response.status !== 200) {
					handleUnexpectedStatusCode(response);
				}
				return URL.createObjectURL(await response.blob());
			} catch (error) {
				console.error('Image could not be fetched', error);
			}
		};

		const getObjectUrlWithAuthInterceptor = async (url) => {
			try {
				const response = await httpService.get(
					url,
					{
						timeout
					},
					{ response: geoResourceService.getAuthResponseInterceptorForGeoResource(geoResourceId) }
				);

				if (response.status !== 200) {
					handleUnexpectedStatusCode(response);
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
			image.getImage().src = credential ? await getObjectUrlForBaa(url) : await getObjectUrlWithAuthInterceptor(src);
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
				? await getObjectUrlForBaa(`${configService.getValueAsPath('BACKEND_URL')}proxy/basicAuth/wms/map/?url=${encodeURIComponent(adjustedWmsUrl)}`)
				: await getObjectUrlWithAuthInterceptor(adjustedWmsUrl);
		}
	};
};
