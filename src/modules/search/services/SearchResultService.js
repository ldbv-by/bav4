import { $injector } from '../../../injection';
import { SourceTypeName, SourceTypeResultStatus } from '../../../services/domain/sourceType';
import { isHttpUrl } from '../../../utils/checks';
import { createUniqueId } from '../../../utils/numberUtils';
import { SearchResult, SearchResultTypes } from './domain/searchResult';
import { loadBvvGeoResourceSearchResults, loadBvvLocationSearchResults, loadBvvCadastralParcelSearchResults } from './provider/searchResult.provider';

/**
 * Max query length for calling providers. If a term is above this size, providers won't be called.
 */
export const MAX_QUERY_TERM_LENGTH = 140;

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

		const { EnvironmentService: environmentService, SourceTypeService: sourceTypeService, ImportVectorDataService: importVectorDataService }
			= $injector.inject('EnvironmentService', 'SourceTypeService', 'ImportVectorDataService');
		this._environmentService = environmentService;
		this._sourceTypeService = sourceTypeService;
		this._importVectorDataService = importVectorDataService;
	}

	_mapSourceTypeToLabel(sourceType) {
		if (sourceType) {
			switch (sourceType.name) {
				case SourceTypeName.GEOJSON:
					return 'GeoJSON Import';
				case SourceTypeName.GPX:
					return 'GPX Import';
				case SourceTypeName.KML:
					return 'KML Import';
			}
		}
		return null;
	}

	/**
	 * Provides search results for geoResources.
	 * Possible errors of the configured provider will be passed.
	 * @param {string} term
	 * @returns {Promise<Array.<SearchResult>>}
	 * @throws Error of the underlying provider
	 */
	async geoResourcesByTerm(term) {

		if (this._environmentService.isStandalone()) {
			return this._newFallbackGeoResourceSearchResults();
		}
		else if (isHttpUrl(term)) {
			const { status, sourceType } = await this._sourceTypeService.forUrl(term);
			if (status === SourceTypeResultStatus.OK) {
				const geoResource = this._importVectorDataService.forUrl(term, { sourceType: sourceType });
				if (geoResource) {
					// in this case the geoResourceId is a random number provided by the importVectorDataService. So we use it also as layerId
					return [new SearchResult(geoResource.id, this._mapSourceTypeToLabel(sourceType), this._mapSourceTypeToLabel(sourceType),
						SearchResultTypes.GEORESOURCE, null, null, geoResource.id)];
				}
			}
		}
		else {
			const { status, sourceType } = this._sourceTypeService.forData(term);
			if (status === SourceTypeResultStatus.OK) {
				const geoResource = this._importVectorDataService.forData(term, { sourceType: sourceType }); {
					if (geoResource) {
						// in this case the geoResourceId is a random number provided by the importVectorDataService. So we use it also as layerId
						return [new SearchResult(geoResource.id, this._mapSourceTypeToLabel(sourceType), this._mapSourceTypeToLabel(sourceType),
							SearchResultTypes.GEORESOURCE, null, null, geoResource.id)];
					}
				}
			}
			else if (term.length < MAX_QUERY_TERM_LENGTH) {
				return this._georesourceResultProvider(term);
			}
		}
		return [];
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
		else if (term.length < MAX_QUERY_TERM_LENGTH) {
			return this._locationResultProvider(term);
		}
		return [];
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
		else if (term.length < MAX_QUERY_TERM_LENGTH) {
			return this._cadastralParcelResultProvider(term);
		}
		return [];
	}

	_newFallbackGeoResourceSearchResults() {
		return [
			new SearchResult('atkis', 'Base Layer 1', 'Base Layer 1', SearchResultTypes.GEORESOURCE, null, null, `${'atkis'}_${createUniqueId()}`),
			new SearchResult('atkis_sw', 'Base Layer 2', 'Base Layer 2', SearchResultTypes.GEORESOURCE, null, null, `${'atkis_sw'}_${createUniqueId()}`)
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
