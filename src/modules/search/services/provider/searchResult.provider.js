import { SearchResult, SearchResultTypes } from '../../../../services/domain/searchResult';
import { $injector } from '../../../../injection';

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
 * @param  {string} term The query term
 * @async
 * @returns {Promise<SearchResult>} results
 */


export const loadBvvGeoResourceSearchResults = async (query) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'search/type/layers/searchText';


	const result = await httpService.get(`${url}/${query}`);

	if (result.ok) {
		const regex = /(<([^>]+)>)/ig;
		const raw = await result.json();
		const data = raw.results.map(o => {
			return new SearchResult(o.id, o.attrs.label.replace(regex, ''), o.attrs.label, SearchResultTypes.GEORESOURCE);
		});
		return data;
	}
	throw new Error('SearchResults for georesources could not be retrieved');
};

export const loadBvvLocationSearchResults = async (query) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');


	const api_key = configService.getValue('SEARCH_SERVICE_API_KEY');
	const regex = /(<([^>]+)>)/ig;
	const result = await httpService.get(`https://geoservices.bayern.de/services/ortssuche/v1/adressen/${query}?srid=4326&api_key=${api_key}`);

	if (result.ok) {
		const raw = await result.json();
		const data = raw.results.map(o => {
			return new SearchResult(null, o.attrs.label.replace(regex, ''), o.attrs.label, SearchResultTypes.LOCATION, [o.attrs.x, o.attrs.y]);
		});
		return data;
	}

	throw new Error('SearchResults for locations could not be retrieved');
};