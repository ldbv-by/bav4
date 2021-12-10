import { $injector } from '../../../injection';
import { SearchResult, SearchResultTypes } from './domain/searchResult';
import { loadBvvGeoResourceSearchResults, loadBvvLocationSearchResults, loadBvvCadastralParcelSearchResults } from './provider/searchResult.provider';

/**
 * Service that offers search results for different types.
 * @class
 * @author taulinger
 */
export class SearchResultService {

	/**
	 *
	 * @param {LocationResultProvider} [locationResultProvider=loadBvvLocationSearchResults]
	 * @param {GeoresourceResultProvider} [georesourceResultProvider=loadBvvGeoResourceSearchResults]
	 * @param {CadastralParcelResultProvider} [cadastralParcelResultProvider=loadBvvCadastralParcelSearchResults]
	 */
	constructor(
		locationResultProvider = loadBvvLocationSearchResults,
		georesourceResultProvider = loadBvvGeoResourceSearchResults,
		cadastralParcelResultProvider = loadBvvCadastralParcelSearchResults
	) {
		this._locationResultProvider = locationResultProvider;
		this._georesourceResultProvider = georesourceResultProvider;
		this._cadastralParcelResultProvider = cadastralParcelResultProvider;

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
	}


	/**
	 * Provides search results for geoResouces.
	 * Possible errors of the configured provider will be passed.
	 * @param {string} term
	 * @returns {Promise<Array.<SearchResult>>}
	 * @throws Error of the underlying provider
	 */
	async geoResourcesByTerm(term) {
		if (this._environmentService.isStandalone()) {
			return this._newFallbackGeoResouceSearchResults();
		}
		return this._georesourceResultProvider(term);
	}

	/**
	 * Provides search results for locations.
	 * Possible errors of the configured provider will be passed.
	 * @param {string} term query term
	 * @returns {Promise<Array.<SearchResult>>}
	 * @throws Error of the underlying provider
	 */
	async locationsByTerm(term) {
		if (this._environmentService.isStandalone()) {
			return this._newFallbackLocationSearchResults();
		}
		return this._locationResultProvider(term);
	}

	/**
	 * Provides search results for cadastral parcels.
	 * Possible errors of the configured provider will be passed.
	 * @param {string} term query term
	 * @returns {Promise<Array.<SearchResult>>}
	 * @throws Error of the underlying provider
	 */
	async cadastralParcelsByTerm(term) {
		if (this._environmentService.isStandalone()) {
			return this._newFallbackCadastralParcelSearchResults();
		}
		return this._cadastralParcelResultProvider(term);
	}

	_newFallbackGeoResouceSearchResults() {
		return [
			new SearchResult('atkis', 'Base Layer 1', 'Base Layer 1', SearchResultTypes.GEORESOURCE),
			new SearchResult('atkis_sw', 'Base Layer 2', 'Base Layer 1', SearchResultTypes.GEORESOURCE)
		];
	}

	_newFallbackLocationSearchResults() {
		return [
			new SearchResult(undefined, 'Landeshauptstadt München', 'Landeshauptstadt <b>München</b>', SearchResultTypes.LOCATION, [1284841.153957037, 6132811.135477452], [1265550.466246523, 6117691.209423095, 1304131.841667551, 6147931.061531809]),
			new SearchResult(undefined, 'Alexandrastraße 4 80538 München, Altstadt-Lehel', '<b>Alexandrastraße</b> <b>4</b> 80538 München , Altstadt-Lehel', SearchResultTypes.LOCATION, [1290240.0895689954, 6130449.47786758])
		];
	}

	_newFallbackCadastralParcelSearchResults() {
		return [];
	}
}
