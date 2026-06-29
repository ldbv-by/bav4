/**
 * @module services/provider/geoResourceLegend_provider
 */
import { $injector } from '@src/injection';
import { Legend, LegendEntry } from '../GeoResourceLegendService';

/**
 * BVV specific implementation of {@link module:services/GeoResourceLegendService~geoResourceLegendProvider}.
 * @function
 * @type {module:services/GeoResourceLegendService~geoResourceLegendProvider}
 */
export const bvvGeoResourceLegendProvider = async (geoResourceId, label = '') => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const throwError = (reason) => {
		throw new Error(`GeoResourceInfoResult for '${geoResourceId}' could not be loaded: ${reason}`);
	};

	const loadInternal = async (geoResourceId) => {
		const url = `${configService.getValueAsPath('BACKEND_URL')}georesource/legend/${geoResourceId}`;
		return httpService.get(url);
	};

	const convertJsonEntries = (entries) => {
		if (!entries) {
			return [[]];
		}

		return entries.map((group) => group.map((entryObj) => new LegendEntry(entryObj.type, entryObj.urlOrData)));
	};

	const result = await loadInternal(geoResourceId);

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
