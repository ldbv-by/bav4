import { loadBvvGeoResourceSearchResults, loadBvvLocationSearchResults } from './provider/searchResult.provider';

/**
 * Service that offers search result provider for different types.
 * @class
 * @author taulinger
 * @deprecated
 */
export class SearchResultProviderService {

	/**
	 *
	 * @param {LocationResultProvider} [locationResultProvider=loadBvvLocationSearchResults]
	 * @param {GeoresourceResultProvider} [georesourceResultProvider=loadBvvGeoResourceSearchResults]
	 */
	constructor(locationResultProvider = loadBvvLocationSearchResults,
		georesourceResultProvider = loadBvvGeoResourceSearchResults) {
		this._locationResultProvider = locationResultProvider;
		this._georesourceResultProvider = georesourceResultProvider;
	}

	getGeoresourceSearchResultProvider() {
		return this._georesourceResultProvider;
	}

	getLocationSearchResultProvider() {
		return this._locationResultProvider;
	}
}
