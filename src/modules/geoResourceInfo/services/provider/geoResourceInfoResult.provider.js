/**
 * @module modules/geoResourceInfo/services/provider/geoResourceInfoResult_provider
 */
import { $injector } from '../../../../injection';
import { GeoResourceInfoResult } from '../GeoResourceInfoService';
import { MediaType } from '../../../../domain/mediaTypes';
import { GeoResourceAuthenticationType, GeoResourceTypes } from '../../../../domain/geoResources';

/**
 * BVV specific implementation of {@link module:modules/geoResourceInfo/services/GeoResourceInfoService~geoResourceInfoProvider}.
 * @function
 * @type {module:modules/geoResourceInfo/services/GeoResourceInfoService~geoResourceInfoProvider}
 */
export const loadBvvGeoResourceInfo = async (geoResourceId) => {
	const {
		HttpService: httpService,
		ConfigService: configService,
		GeoResourceService: geoResourceService,
		BaaCredentialService: baaCredentialService
	} = $injector.inject('HttpService', 'ConfigService', 'GeoResourceService', 'BaaCredentialService');

	const throwError = (reason) => {
		throw new Error(`GeoResourceInfoResult for '${geoResourceId}' could not be loaded: ${reason}`);
	};

	const loadInternal = async (geoResource) => {
		const url = `${configService.getValueAsPath('BACKEND_URL')}georesource/info/${geoResource.id}`;
		return httpService.get(url);
	};

	const loadExternal = async (geoResource) => {
		const getUrl = (geoResource) => {
			switch (geoResource.getType()) {
				case GeoResourceTypes.OAF: {
					return `${configService.getValueAsPath('BACKEND_URL')}georesource/info/external/oaf`;
				}
				case GeoResourceTypes.WMS: {
					return `${configService.getValueAsPath('BACKEND_URL')}georesource/info/external/wms`;
				}
			}
		};

		const getPayload = (geoResource) => {
			const getDefaultPayload = (geoResource) => {
				switch (geoResource.getType()) {
					case GeoResourceTypes.OAF: {
						return {
							url: geoResource.url,
							collectionId: geoResource.collectionId
						};
					}
					case GeoResourceTypes.WMS: {
						return {
							url: geoResource.url,
							layers: [...geoResource.layers.split(',')]
						};
					}
				}
			};

			const defaultPayload = getDefaultPayload(geoResource);
			const extendWithCredential = (payload) => {
				const credential = baaCredentialService.get(geoResource.url);
				if (!credential) {
					throwError(`No credential available`);
				}
				return { ...payload, ...credential };
			};

			const payload = geoResource.authenticationType === GeoResourceAuthenticationType.BAA ? extendWithCredential(defaultPayload) : defaultPayload;
			return JSON.stringify(payload);
		};

		return httpService.post(getUrl(geoResource), getPayload(geoResource), MediaType.JSON, {
			response:
				geoResource.authenticationType === GeoResourceAuthenticationType.BAA
					? []
					: [geoResourceService.getAuthResponseInterceptorForGeoResource(geoResourceId)]
		});
	};

	const geoResource = geoResourceService.byId(geoResourceId);
	// only OafGeoResources and WmsGeoResources are currently supported as external GeoResources
	if (geoResource.isExternal() && ![GeoResourceTypes.OAF, GeoResourceTypes.WMS].includes(geoResource.getType())) {
		return null;
	}
	const loadGeoResourceInfo = geoResource.isExternal() ? loadExternal : loadInternal;

	const result = await loadGeoResourceInfo(geoResource);
	switch (result.status) {
		case 200: {
			const htmlContent = await result.text();
			return new GeoResourceInfoResult(htmlContent);
		}
		case 204: {
			return null;
		}
	}

	throwError(`Http-Status ${result.status}`);
};
