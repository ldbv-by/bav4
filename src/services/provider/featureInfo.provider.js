/**
 * @module services/provider/featureInfo_provider
 */
import { $injector } from '../../injection';
import { GeoResourceAuthenticationType, WmsGeoResource } from '../../domain/geoResources';
import { MediaType } from '../../domain/mediaTypes';
import { isHttpUrl } from '../../utils/checks';
import { FeatureInfoGeometryTypes } from '../../domain/featureInfo';

const throwError = (geoResourceId, reason) => {
	throw new Error(`FeatureInfoResult for '${geoResourceId}' could not be loaded: ${reason}`);
};

const loadWmsFeatureInfo = async (geoResource, coordinate3857, mapResolution) => {
	const geoResourceId = geoResource.id;

	const {
		HttpService: httpService,
		ConfigService: configService,
		GeoResourceService: geoResourceService,
		BaaCredentialService: baaCredentialService
	} = $injector.inject('HttpService', 'ConfigService', 'GeoResourceService', 'BaaCredentialService');

	const determineCredential = (geoResource) => {
		return geoResource.authenticationType === GeoResourceAuthenticationType.BAA
			? (baaCredentialService.get(geoResource.url) ?? throwError(geoResourceId, 'No credentials available'))
			: {};
	};

	const requestPayload = {
		...{
			urlOrId: geoResourceId,
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
			return { content, title: title || geoResource.label };
		}
		case 204: {
			return null;
		}
	}
	throwError(geoResourceId, `Http-Status ${result.status}`);
};

const loadTimeTravelFeatureInfo = async (geoResource, coordinate3857, timestamp) => {
	const geoResourceId = geoResource.id;

	const {
		HttpService: httpService,
		ConfigService: configService,
		StoreService: storeService
	} = $injector.inject('HttpService', 'ConfigService', 'StoreService');

	const zoomLevel = storeService.getStore().getState().position.zoom;
	const requestPayload = {
		geoResourceId,
		easting: coordinate3857[0],
		northing: coordinate3857[1],
		zoom: Math.round(zoomLevel),
		// we take the latest timestamp of the corresponding GeoResource as fallback
		year: timestamp ?? geoResource.timestamps[0]
	};

	const url = configService.getValueAsPath('BACKEND_URL') + `timetravel`;

	const result = await httpService.post(url, JSON.stringify(requestPayload), MediaType.JSON, {
		timeout: 10000
	});

	switch (result.status) {
		case 200: {
			const { title, content, geometry: geoJson } = await result.json();
			const geometry = geoJson ? { data: geoJson, geometryType: FeatureInfoGeometryTypes.GEOJSON } : null;
			return { content, title, geometry };
		}
		case 204: {
			return null;
		}
	}
	throwError(geoResourceId, `Http-Status ${result.status}`);
};

/**
 * BVV specific implementation of {@link module:services/FeatureInfoService~featureInfoProvider}.
 * @function
 * @type {module:services/FeatureInfoService~featureInfoProvider}
 */
export const loadBvvFeatureInfo = async (geoResourceId, coordinate3857, mapResolution, timestamp) => {
	const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

	const geoResource = geoResourceService.byId(geoResourceId);
	if (geoResource) {
		if (geoResource instanceof WmsGeoResource) {
			return loadWmsFeatureInfo(geoResource, coordinate3857, mapResolution);
		} else if (geoResource.hasTimestamps()) {
			return loadTimeTravelFeatureInfo(geoResource, coordinate3857, timestamp);
		}
		// unsupported GeoResource
		return null;
	}
	throwError(geoResourceId, `No GeoResource found with id "${geoResourceId}"`);
};
