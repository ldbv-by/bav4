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
export const bvvGeoResourceLegendProvider = async (geoResourceId) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const throwError = (reason) => {
		throw new Error(`GeoResourceInfoResult for '${geoResourceId}' could not be loaded: ${reason}`);
	};

	const loadInternal = async (geoResourceId) => {
		const url = `${configService.getValueAsPath('BACKEND_URL')}georesource/legend/${geoResourceId}`;
		return httpService.get(url);
	};

	const parseEntries = (entries) => {
		if (!entries) return [];
		if (entries.length === 1) {
			return entries[0].map((entry) => new LegendEntry(entry.type, entry.urlOrData));
		}
		return entries.map((row) => row.map((entry) => new LegendEntry(entry.type, entry.urlOrData)));
	};

	const result = await loadInternal(geoResourceId);

	switch (result.status) {
		case 200: {
			const content = await result.json();
			return new Legend(content.geoResourceId, parseEntries(content.entries));
		}
		case 204:
			return null;
		default:
			throwError(`Http-Status ${result.status}`);
	}
};
