
/**
 * An async function that provides an array of {@link GeoResource}s.
 *
 * @async
 * @typedef {function():(Array<GeoResource>)} geoResourceProvider
 */

/**
 * A function that returns a {@link GeoResourceFuture}.
 * @param {string} id Id of the requested GeoResource
 * @typedef {function(id) : (GeoResourceFuture|null)} geoResourceByIdProvider
 */

import { $injector } from '../injection';
import { WMTSGeoResource } from '../domain/geoResources';
import { loadBvvFileStorageResourceById } from './provider/fileStorage.provider';
import { loadBvvGeoResourceById, loadBvvGeoResources } from './provider/geoResource.provider';

export const FALLBACK_GEORESOURCE_ID_0 = 'tpo';
export const FALLBACK_GEORESOURCE_ID_1 = 'tpo_mono';
export const FALLBACK_GEORESOURCE_LABEL_0 = 'TopPlusOpen';
export const FALLBACK_GEORESOURCE_LABEL_1 = 'TopPlusOpen monochrome';

/**
 * Service for managing {@link GeoResource}s.
 *
 *
 * Georesources that should be available a startup time are loaded by the registered georesourceProvider.
 * GeoResources which should be loaded on-demand during runtime, are loaded by the registered georesourceByIdProviders.
 *
 * @class
 * @author taulinger
 */
export class GeoResourceService {

	/**
	 *
	 * @param {georesourceProvider} [georesourceProvider=loadBvvGeoResources]
	 * @param {georesourceByIdProvider} [georesourceByIdProvider=[loadBvvFileStorageResourceById, loadBvvGeoResourceById]]
	 */
	constructor(provider = loadBvvGeoResources, byIdProvider = [loadBvvFileStorageResourceById, loadBvvGeoResourceById]) {
		this._provider = provider;
		this._byIdProvider = byIdProvider;
		this._georesources = null;
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
	}

	/**
	 * Initializes this service, which means all available GeoResources are loaded and can be served in the future from the internal cache.
	 * If initialsation fails, a fallback is delivered.
	 * @public
	 * @async
	 * @returns {Promise<Array.<GeoResource>>}
	 */
	async init() {
		if (!this._georesources) {
			try {
				this._georesources = await this._provider();
			}
			catch (e) {
				this._georesources = [];
				if (this._environmentService.isStandalone()) {
					console.warn('GeoResources could not be fetched from backend. Using fallback geoResources ...');
					this._georesources.push(...this._newFallbackGeoResources());
				}
				else {
					console.error('GeoResources could not be fetched from backend.', e);
				}
			}
		}
		return this._georesources;
	}


	/**
	 * Returns all available {@link GeoResource}.
	 * @public
	 * @returns  {Array.<GeoResource>}
	 */
	all() {
		if (!this._georesources) {
			console.warn('GeoResourceService not yet initialized');
			return [];
		}
		return this._georesources;
	}

	/**
	 * Returns the corresponding  {@link GeoResource} for an id.
	 * @public
	 * @param {string} id Id of the desired {@link GeoResource}
	 * @returns {GeoResource | null}
	 */
	byId(id) {
		if (!this._georesources) {
			console.warn('GeoResourceService not yet initialized');
			return null;
		}
		const geoResource = this._georesources.find(georesource => georesource.id === id);
		return geoResource || null;
	}

	/**
	 * Returns a {@link GeoResourceFuture} by calling all registered {@link geoResourceByIdProvider} in the order of their registration
	 * without checking the internal cache.
	 *
	 *
	 * The GeoResourceFuture will be addded to the internal cache and can be replaced later
	 * by the resolved real GeoResource by calling {@link GeoResourceService#addOrReplace}.
	 * @param {string} id Id of the desired {@link GeoResource}
	 * @returns {GeoResourceFuture | null} returns a GeoResourceFuture or `null` when no byIdProvider could fulfill
	 */
	asyncById(id) {
		for (const byIdProvider of this._byIdProvider) {
			const geoResource = byIdProvider(id);
			if (geoResource?.id === id) {
				this.addOrReplace(geoResource);
				return geoResource;
			}
		}
		return null;
	}

	/**
	 * Adds a {@link GeoResource} to the internal cache.
	 * An existing GeoResource will be replaced by the new one.
	 * The replacement is done based on the id of the GeoResource.
	 * @param {GeoResource} georesource
	 */
	addOrReplace(georesource) {

		const existingGeoR = this._georesources.find(_georesource => _georesource.id === georesource.id);
		if (existingGeoR) {
			const index = this._georesources.indexOf(existingGeoR);
			this._georesources.splice(index, 1, georesource);
		}
		else {
			this._georesources.push(georesource);
		}
	}

	/**
	 * @private
	 */
	_newFallbackGeoResources() {
		return [
			new WMTSGeoResource(FALLBACK_GEORESOURCE_ID_0, FALLBACK_GEORESOURCE_LABEL_0, 'http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png'),
			new WMTSGeoResource(FALLBACK_GEORESOURCE_ID_1, FALLBACK_GEORESOURCE_LABEL_1, 'http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png')
		].map(gr => {
			return gr.setAttribution({
				description: 'TopPlusOpen',
				copyright: [
					{ label: 'Bundesamt für Kartographie und Geodäsie (2021)', url: 'http://www.bkg.bund.de/' },
					{ label: 'Datenquellen', url: 'https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf' }
				] }
			);
		});
	}
}
