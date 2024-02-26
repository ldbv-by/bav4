/**
 * @module services/provider/featureInfo_provider
 */
import { $injector } from '../../injection';
import { GeoResourceAuthenticationType } from '../../domain/geoResources';
import { FeatureInfoResult } from '../FeatureInfoService';
import { MediaType } from '../../domain/mediaTypes';
import { isHttpUrl } from '../../utils/checks';

/**
 * Bvv specific implementation of {@link module:services/FeatureInfoService~featureInfoProvider}.
 * @function
 * @type {module:services/FeatureInfoService~featureInfoProvider}
 */
export const loadBvvFeatureInfo = async (geoResourceId, coordinate3857, mapResolution) => {
	const {
		HttpService: httpService,
		ConfigService: configService,
		GeoResourceService: geoResourceService,
		BaaCredentialService: baaCredentialService
	} = $injector.inject('HttpService', 'ConfigService', 'GeoResourceService', 'BaaCredentialService');

	const geoResource = geoResourceService.byId(geoResourceId);

	const throwError = (reason) => {
		throw new Error(`FeatureInfoResult for '${geoResourceId}' could not be loaded: ${reason}`);
	};

	if (geoResource) {
		const determineCredential = (geoResource) => {
			return geoResource.authenticationType === GeoResourceAuthenticationType.BAA
				? baaCredentialService.get(geoResource.url) ?? throwError('No credentials available')
				: {};
		};

		const requestPayload = {
			...{
				urlOrId: geoResource.id,
				easting: coordinate3857[0],
				northing: coordinate3857[1],
				srid: 3857,
				resolution: mapResolution
			},
			...determineCredential(geoResource)
		};

		const url =
			configService.getValueAsPath('BACKEND_URL') +
			`getFeature/${isHttpUrl(geoResourceId) ? 'url' /**just a placeholder in that case */ : geoResourceId}`;

		const result = await httpService.post(
			url,
			JSON.stringify(requestPayload),
			MediaType.JSON,
			{
				timeout: 10000
			},
			{
				response:
					geoResource.authenticationType === GeoResourceAuthenticationType.BAA || isHttpUrl(geoResourceId)
						? []
						: [geoResourceService.getAuthResponseInterceptorForGeoResource(geoResourceId)]
			}
		);

		switch (result.status) {
			case 200: {
				const { title, content } = await result.json();
				return new FeatureInfoResult(content, title);
			}
			case 204: {
				return null;
			}
		}
		throwError(`Http-Status ${result.status}`);
	}
	throwError(`No GeoResource found with id "${geoResourceId}"`);
};
