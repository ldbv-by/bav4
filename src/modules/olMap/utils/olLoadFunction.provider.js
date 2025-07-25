/**
 * @module modules/olMap/utils/olLoadFunction_provider
 */
import { $injector } from '../../../injection';
import TileState from 'ol/TileState.js';
import { UnavailableGeoResourceError } from '../../../domain/errors';
import { FailureCounter } from '../../../utils/FailureCounter';
import { isNumber, isString } from '../../../utils/checks';
import GeoJSON from 'ol/format/GeoJSON';
import { setFetching } from '../../../store/network/network.action';
import { LayerState, modifyLayer, modifyLayerProps } from '../../../store/layers/layers.action';
import { queryParamsToString } from '../../../utils/urlUtils';

const handleUnexpectedStatusCode = (geoResourceId, response) => {
	// we have to throw the UnavailableGeoResourceError in a asynchronous manner, otherwise it would be caught by ol and not be  propagated to the window (see GlobalErrorPlugin)
	return Promise.reject(new UnavailableGeoResourceError(`Unexpected network status`, geoResourceId, response?.status));
};

/**
 * Returns a BVV specific image load function loading either unrestricted images, restricted images via basic access authentication or application restricted images (via backend).
 * <br>
 * The requested maximum width and height of the image is limited to a configurable size (default is 2000x2000).
 * If width and/or height exceed the configured maximum size, the image will be scaled.
 * @function
 * @type {module:modules/olMap/services/LayerService~imageLoadFunctionProvider}
 */
export const getBvvBaaImageLoadFunction = (geoResourceId, credential = null, maxSize) => {
	maxSize = maxSize ?? [2000, 2000];
	const {
		HttpService: httpService,
		ConfigService: configService,
		GeoResourceService: geoResourceService
	} = $injector.inject('HttpService', 'ConfigService', 'GeoResourceService');

	return async (image, src) => {
		const timeout = 30_000;

		const getObjectUrlForBaa = async (url) => {
			try {
				const { username, password } = credential;
				const response = await httpService.get(url, {
					timeout,
					headers: new Headers({
						Authorization: `Basic ${btoa(`${username}:${password}`)}`
					})
				});

				if (response.status !== 200) {
					return handleUnexpectedStatusCode(geoResourceId, response);
				}
				return URL.createObjectURL(await response.blob());
			} catch (error) {
				throw new UnavailableGeoResourceError(error.message, geoResourceId);
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
					return handleUnexpectedStatusCode(geoResourceId, response);
				}
				return URL.createObjectURL(await response.blob());
			} catch (error) {
				throw new UnavailableGeoResourceError(error.message, geoResourceId);
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

export const bvvTileLoadFailureCounterProvider = (geoResourceId) => {
	const onFailure = async () => {
		throw new UnavailableGeoResourceError(`Unexpected network status`, geoResourceId);
	};

	return new FailureCounter(10, 0.5, onFailure);
};
/**
 * BVV specific implementation of {@link module:modules/olMap/services/LayerService~tileLoadFunctionProvider}.
 * @function
 * @type {module:modules/olMap/services/LayerService~tileLoadFunctionProvider}
 */
export const getBvvTileLoadFunction = (geoResourceId, olLayer, failureCounterProvider = bvvTileLoadFailureCounterProvider) => {
	const { HttpService: httpService, GeoResourceService: geoResourceService } = $injector.inject('HttpService', 'GeoResourceService');

	const failureCounter = failureCounterProvider(geoResourceId);

	return async (tile, src) => {
		src = olLayer.get('timestamp') ? src + '?t=' + olLayer.get('timestamp') : src;
		const timeout = 10_000;
		try {
			const getObjectUrlWithAuthInterceptor = async (url) => {
				const response = await httpService.get(
					url,
					{
						timeout
					},
					{ response: [geoResourceService.getAuthResponseInterceptorForGeoResource(geoResourceId)] }
				);
				switch (response.status) {
					case 200:
						failureCounter.indicateSuccess();
						return URL.createObjectURL(await response.blob());
					case 400 /** expected status code when zoom-level is not supported > client-side zooming*/:
						tile.setState(TileState.ERROR);
						break;
					default:
						return Promise.reject();
				}
			};
			const source = await getObjectUrlWithAuthInterceptor(src);
			if (source) {
				tile.getImage().src = source;
				tile.getImage().onload = () => {
					URL.revokeObjectURL(source);
				};
			}
		} catch (error) {
			tile.setState(TileState.ERROR);
			failureCounter.indicateFailure();
		}
	};
};

/**
 * BVV specific implementation of {@link module:modules/olMap/services/VectorLayerService~oafLoadFunctionProvider}.
 * @function
 * @type {module:modules/olMap/services/VectorLayerService~oafLoadFunctionProvider}
 */
export const getBvvOafLoadFunction = (geoResourceId, olLayer, credential = null) => {
	const { HttpService: httpService, GeoResourceService: geoResourceService } = $injector.inject('HttpService', 'GeoResourceService');

	// see https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html
	return async function (extent, resolution, projection, success, failure) {
		const timeout = 15_000;
		const srid = projection.getCode().split(':')[1];
		const crs = `http://www.opengis.net/def/crs/EPSG/0/${srid}`;
		try {
			const oafGeoResource = geoResourceService.byId(geoResourceId);

			const options = {};
			options['f'] = 'json';
			options['crs'] = crs;
			if (oafGeoResource.limit) {
				options['limit'] = oafGeoResource.limit;
			}

			/**
			 * If we have set a filter, we do not request a BoundingBox so that the filter is applied to all data
			 */
			if (!oafGeoResource.hasFilter() && !olLayer.get('filter')) {
				options['bbox'] = `${extent.join(',')}`;
				options['bbox-crs'] = crs;
			} else {
				if (oafGeoResource.hasFilter()) {
					options['filter'] = oafGeoResource.filter;
				}
				// should overwrite the filter of the OafGeoResource
				if (olLayer.get('filter')) {
					options['filter'] = olLayer.get('filter');
				}
			}

			const url = `${oafGeoResource.url}${oafGeoResource.url.endsWith('/') ? '' : '/'}collections/${oafGeoResource.collectionId}/items?${queryParamsToString(options)}`;
			const handleResponse = async (response, vectorSource) => {
				try {
					/**
					 * Loading a large feature collection in ol takes some time,
					 * in order to give some feedback to the user we "include" the processing of the features
					 * in the loading process and therefore manually set the fetching property
					 *
					 */
					setFetching(true);
					switch (response.status) {
						case 200: {
							const geoJson = await response.json();
							this.unset('incomplete_data', true);
							this.unset('possible_incomplete_data', true);
							if (isNumber(geoJson.numberReturned) && isNumber(geoJson.numberMatched)) {
								if (geoJson.numberReturned < geoJson.numberMatched) {
									modifyLayer(olLayer.get('id'), { state: LayerState.INCOMPLETE_DATA });
									this.set('incomplete_data', true);
								} else {
									modifyLayer(olLayer.get('id'), { state: LayerState.OK });
								}
							} else {
								this.set('possible_incomplete_data', true);
								modifyLayer(olLayer.get('id'), { state: LayerState.OK });
							}
							const features = new GeoJSON().readFeatures(geoJson).map((f) => {
								// avoid ol displaying only one feature if ids are an empty string
								if (isString(f.getId()) && f.getId().trim() === '') {
									f.setId(undefined);
								}
								f.getGeometry().transform('EPSG:' + oafGeoResource.srid, projection);
								return f;
							});
							vectorSource.addFeatures(features);
							const props = { featureCount: features.length };
							modifyLayerProps(olLayer.get('id'), props);
							success(features);
							break;
						}
						default: {
							modifyLayer(olLayer.get('id'), { state: LayerState.ERROR, props: {} });
							this.removeLoadedExtent(extent);
							failure();
							throw new UnavailableGeoResourceError(`Unexpected network status`, geoResourceId, response?.status);
						}
					}
				} finally {
					setFetching(false);
				}
			};

			const getFeatures = async (url) => {
				const response = credential
					? await httpService.get(url, {
							timeout,
							headers: new Headers({
								Authorization: `Basic ${btoa(`${credential.username}:${credential.password}`)}`
							})
						})
					: await httpService.get(
							url,
							{
								timeout
							},
							{ response: [geoResourceService.getAuthResponseInterceptorForGeoResource(geoResourceId)] }
						);

				return handleResponse(response, this);
			};
			modifyLayer(olLayer.get('id'), { state: LayerState.LOADING });
			return await getFeatures(url);
		} catch (error) {
			modifyLayer(olLayer.get('id'), { state: LayerState.ERROR });
			failure();
			throw new UnavailableGeoResourceError(error.message, geoResourceId);
		}
	};
};
