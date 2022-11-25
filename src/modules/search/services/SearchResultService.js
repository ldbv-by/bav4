import { $injector } from '../../../injection';
import { SourceTypeName, SourceTypeResultStatus } from '../../../domain/sourceType';
import { isHttpUrl } from '../../../utils/checks';
import { GeoResourceSearchResult, LocationSearchResult } from './domain/searchResult';
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

		const { EnvironmentService: environmentService, SourceTypeService: sourceTypeService,
			ImportVectorDataService: importVectorDataService, ImportWmsService: importWmsService }
			= $injector.inject('EnvironmentService', 'SourceTypeService', 'ImportVectorDataService', 'ImportWmsService');
		this._environmentService = environmentService;
		this._sourceTypeService = sourceTypeService;
		this._importVectorDataService = importVectorDataService;
		this._importWmsService = importWmsService;
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
				case SourceTypeName.EWKT:
					return 'EWKT Import';
			}
		}
		return null;
	}

	async _getGeoResourcesForUrl(url) {
		const { status, sourceType } = await this._sourceTypeService.forUrl(url);
		if (status === SourceTypeResultStatus.OK || status === SourceTypeResultStatus.BAA_AUTHENTICATED) {
			switch (sourceType.name) {
				case SourceTypeName.GEOJSON:
				case SourceTypeName.GPX:
				case SourceTypeName.KML:
				case SourceTypeName.EWKT: {
					const geoResource = this._importVectorDataService.forUrl(url, { sourceType: sourceType });
					// in this case the geoResourceId is a random number provided by the importVectorDataService.
					return geoResource ? [new GeoResourceSearchResult(geoResource.id, this._mapSourceTypeToLabel(sourceType))] : [];
				}
				case SourceTypeName.WMS: {
					const geoResources = await this._importWmsService.forUrl(url, { sourceType: sourceType, isAuthenticated: status === SourceTypeResultStatus.BAA_AUTHENTICATED });
					// in this case the geoResourceId is a random number provided by the importWmsService.
					return geoResources.length
						? geoResources.map(gr => new GeoResourceSearchResult(gr.id, gr.label))
						: [];
				}
			}
		}
		return [];
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
			return this._getGeoResourcesForUrl(term);
		}
		else {
			const { status, sourceType } = this._sourceTypeService.forData(term);
			if (status === SourceTypeResultStatus.OK) {
				const geoResource = this._importVectorDataService.forData(term, { sourceType: sourceType }); {
					if (geoResource) {
						// in this case the geoResourceId is a random number provided by the importVectorDataService.
						return [new GeoResourceSearchResult(geoResource.id, this._mapSourceTypeToLabel(sourceType))];
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
		else if (!isHttpUrl(term) && term.length < MAX_QUERY_TERM_LENGTH) {
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
		else if (!isHttpUrl(term) && term.length < MAX_QUERY_TERM_LENGTH) {
			return this._cadastralParcelResultProvider(term);
		}
		return [];
	}

	_newFallbackGeoResourceSearchResults() {
		return [
			new GeoResourceSearchResult('atkis', 'Base Map 1'),
			new GeoResourceSearchResult('atkis_sw', 'Base Map 2')
		];
	}

	_newFallbackLocationSearchResults() {
		return [
			new LocationSearchResult('Landeshauptstadt München', 'Landeshauptstadt <b>München</b>', [1284841.153957037, 6132811.135477452], [1265550.466246523, 6117691.209423095, 1304131.841667551, 6147931.061531809]),
			new LocationSearchResult('Alexandrastraße 4 80538 München, Altstadt-Lehel', '<b>Alexandrastraße</b> <b>4</b> 80538 München , Altstadt-Lehel', [1290240.0895689954, 6130449.47786758])
		];
	}

	_newFallbackCadastralParcelSearchResults() {
		return [];
	}
}
