import { loadBvvGeoResourceSearchResults, loadBvvLocationSearchResults } from './provider/searchResult.provider';

export class SearchResultProviderService {
	
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