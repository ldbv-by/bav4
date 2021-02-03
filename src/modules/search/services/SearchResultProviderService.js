export class SearchResultProviderService {

	constructor(locationResultProvider, georesourceResultProvider) {
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