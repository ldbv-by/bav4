/**
 * @module modules/olMap/utils/olLoadFunction_provider
 */
import { $injector } from '../../../injection';
import { LevelTypes, emitNotification } from '../../../store/notifications/notifications.action';
import TileState from 'ol/TileState.js';
import { throttled } from '../../../utils/timer';

const handleUnexpectedStatusCode = (response, geoResourceId) => {
	const { TranslationService: translationService } = $injector.inject('TranslationService');

	const translate = (key, params = []) => translationService.translate(key, params);

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

const handleUnexpectedStatusCodeThrottled = throttled(3000, (response, geoResourceId) => handleUnexpectedStatusCode(response, geoResourceId));

/**
 * Returns a BVV specific image load function loading either unrestricted images, restricted images via basic access authentication or application restricted images (via backend).
 * <br>
 * The requested maximum width and height of the image is limited to a configurable size (default is 2000x2000).
 * If width and/or height exceed the configured maximum size, the image will be scaled.
 * @function
 * @type {module:modules/olMap/services/LayerService~imageLoadFunctionProvider}
 */
export const getBvvBaaImageLoadFunction = (geoResourceId, credential = null, maxSize = [2000, 2000]) => {
	const {
		HttpService: httpService,
		ConfigService: configService,
		GeoResourceService: geoResourceService
	} = $injector.inject('HttpService', 'ConfigService', 'GeoResourceService');

	return async (image, src) => {
		const timeout = 10_000;

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
					handleUnexpectedStatusCode(response, geoResourceId);
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
					{ response: [geoResourceService.getAuthResponseInterceptorForGeoResource(geoResourceId)] }
				);

				if (response.status !== 200) {
					handleUnexpectedStatusCode(response, geoResourceId);
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

/**
 * BVV specific implementation of {@link module:modules/olMap/services/LayerService~tileLoadFunctionProvider}.
 * @function
 * @type {module:modules/olMap/services/LayerService~tileLoadFunctionProvider}
 */
export const getBvvTileLoadFunction = (geoResourceId) => {
	const { HttpService: httpService, GeoResourceService: geoResourceService } = $injector.inject('HttpService', 'GeoResourceService');

	return async (tile, src) => {
		const timeout = 3_000;
		const getObjectUrlWithAuthInterceptor = async (url) => {
			try {
				const response = await httpService.get(
					url,
					{
						timeout
					},
					{ response: [geoResourceService.getAuthResponseInterceptorForGeoResource(geoResourceId)] }
				);
				switch (response.status) {
					case 200:
						return URL.createObjectURL(await response.blob());
					case 400 /** expected status code when zoom-level is not supported > client-side zooming*/:
						tile.setState(TileState.ERROR);
						break;
					default:
						handleUnexpectedStatusCodeThrottled(response, geoResourceId);
				}
			} catch (error) {
				tile.setState(TileState.ERROR);
				console.error('Tile could not be fetched', error);
			}
		};
		tile.getImage().src = await getObjectUrlWithAuthInterceptor(src);
	};
};
