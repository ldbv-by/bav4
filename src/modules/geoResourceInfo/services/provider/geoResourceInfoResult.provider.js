import { $injector } from '../../../../injection';
import { GeoResourceInfoResult } from '../GeoResourceInfoService';
import { MediaType } from '../../../../services/HttpService';
import { GeoResourceAuthenticationType } from '../../../../domain/geoResources';

/**
 * Uses the BVV endpoint to load GeoResourceInfoResult.
 * @function
 * @returns {Promise<GeoResourceInfoResult>}
 */
export const loadBvvGeoResourceInfo = async (geoResourceId) => {
	const { HttpService: httpService,
		ConfigService: configService,
		GeoResourceService: geoResourceService,
		BaaCredentialService: baaCredentialService } = $injector.inject('HttpService', 'ConfigService', 'GeoResourceService', 'BaaCredentialService');

	const loadInternal = async (geoResource) => {
		const url = `${configService.getValueAsPath('BACKEND_URL')}georesource/info/${geoResource.id}`;
		return httpService.get(url);
	};

	const loadExternal = async (geoResource) => {
		const url = `${configService.getValueAsPath('BACKEND_URL')}georesource/info/external/wms`;

		const getPayload = geoResource => {

			const defaultPayload = {
				url: geoResource.url,
				layers: [...geoResource.layers.split(',')]
			};
			const extendWithCredential = (payload) => {
				const credential = baaCredentialService.get(geoResource.url);
				if (!credential) {
					throw new Error(`No credential available for GeoResource with id '${geoResource.id}' and url '${geoResource.url}'`);
				}
				return { ...payload, ...credential };
			};

			const payload = geoResource.authenticationType === GeoResourceAuthenticationType.BAA ? extendWithCredential(defaultPayload) : defaultPayload;
			return JSON.stringify(payload);
		};


		return httpService.post(url, getPayload(geoResource), MediaType.JSON);
	};

	const geoResource = geoResourceService.byId(geoResourceId);
	const loadGeoResourceInfo = geoResource.importedByUser ? loadExternal : loadInternal;

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

	throw new Error(`GeoResourceInfoResult for '${geoResourceId}' could not be loaded`);
};
