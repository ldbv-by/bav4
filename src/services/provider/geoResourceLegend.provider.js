/**
 * @module services/provider/geoResourceLegend_provider
 */
import { $injector } from '@src/injection';
import { Legend, LegendEntry } from '@src/services/GeoResourceLegendService';
import { GeoResourceAuthenticationType, GeoResourceTypes } from '@src/domain/geoResources';
import { MediaType } from '@src/domain/mediaTypes';

/**
 * BVV specific implementation of {@link module:services/GeoResourceLegendService~geoResourceLegendProvider}.
 * @function
 * @type {module:services/GeoResourceLegendService~geoResourceLegendProvider}
 */
export const bvvGeoResourceLegendProvider = async (geoResourceId, label = '') => {
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
		const url = `${configService.getValueAsPath('BACKEND_URL')}georesource/legend/${geoResource.id}`;
		return httpService.get(url);
	};

	const loadExternal = async (geoResource) => {
		const getUrl = (geoResource) => {
			switch (geoResource.getType()) {
				case GeoResourceTypes.WMS: {
					return `${configService.getValueAsPath('BACKEND_URL')}georesource/legend/external/wms`;
				}
			}
		};

		const getPayload = (geoResource) => {
			const getDefaultPayload = (geoResource) => {
				switch (geoResource.getType()) {
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
					: [geoResourceService.getAuthResponseInterceptorForGeoResource(geoResource.id)]
		});
	};

	const convertJsonEntries = (entries) => {
		if (!entries) {
			return [[]];
		}

		return entries.map((group) => group.map((entryObj) => new LegendEntry(entryObj.type, entryObj.urlOrData)));
	};

	const geoResource = geoResourceService.byId(geoResourceId);
	const loadGeoResourceInfo = geoResource.isExternal() ? loadExternal : loadInternal;
	const result = await loadGeoResourceInfo(geoResource);

	console.log(geoResource);

	switch (result.status) {
		case 200: {
			const content = await result.json();
			return new Legend(content.id, label, convertJsonEntries(content.entries));
		}
		case 204:
			return null;
		default:
			throwError(`Http-Status ${result.status}`);
	}
};
