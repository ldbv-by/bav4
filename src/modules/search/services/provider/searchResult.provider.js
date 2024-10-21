/**
 * @module modules/search/services/provider/searchResult_provider
 */
import { CadastralParcelSearchResult, GeoResourceSearchResult, LocationSearchResult } from '../domain/searchResult';
import { $injector } from '../../../../injection';
import { MediaType } from '../../../../domain/mediaTypes';
import { SourceType, SourceTypeName } from '../../../../domain/sourceType';

/**
 *A async function that returns a promise with an array of SearchResults with type LOCATION.
 * @callback LocationResultProvider
 * @param  {string} term The query term
 * @async
 * @returns {Promise<SearchResult>} results
 */

/**
 *A async function that returns a promise with an array of SearchResults with type GEORESOURCE.
 * @callback GeoresourceResultProvider
 * @param  {string} htmlLabel The query term
 * @returns {Promise<SearchResult>} results
 */

const removeHtml = (htmlLabel) => {
	const regex = /(<([^>]+)>)/gi;
	return htmlLabel.replace(regex, '');
};

export const loadBvvGeoResourceSearchResults = async (query) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'search/type/layers/searchText';

	const result = await httpService.get(`${url}/${encodeURIComponent(query.replace(/\//g, ' '))}`);

	if (result.ok) {
		const raw = await result.json();
		const data = raw.map((o) => {
			return new GeoResourceSearchResult(o.id, removeHtml(o.attrs.label), o.attrs.label);
		});
		return data;
	}
	throw new Error('SearchResults for GeoResources could not be retrieved');
};

export const loadBvvLocationSearchResults = async (query) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'search/type/locations/searchText';

	const requestPayload = { term: query };

	const result = await httpService.post(url, JSON.stringify(requestPayload), MediaType.JSON);

	if (result.ok) {
		const raw = await result.json();
		const data = raw.map((o) => {
			return new LocationSearchResult(removeHtml(o.attrs.label), o.attrs.label, o.attrs.coordinate, o.attrs.extent ?? null);
		});
		return data;
	}
	throw new Error('SearchResults for locations could not be retrieved');
};

export const loadBvvCadastralParcelSearchResults = async (query) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'search/type/cp/searchText';

	const result = await httpService.get(`${url}/${encodeURIComponent(query.replace(/\//g, ' '))}`);

	if (result.ok) {
		const raw = await result.json();
		const data = raw.map((o) => {
			return new CadastralParcelSearchResult(
				removeHtml(o.attrs.label),
				o.attrs.label,
				o.attrs.coordinate,
				o.attrs.extent ? o.attrs.extent : null,
				o.attrs.ewkt ? { geometry: o.attrs.ewkt, geometryType: new SourceType(SourceTypeName.EWKT, null, 3857) } : null
			);
		});
		return data;
	}
	throw new Error('SearchResults for cadastral parcels could not be retrieved');
};
