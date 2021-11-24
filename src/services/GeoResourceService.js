
/**
 * An async function that provides an array of
 * {@link GeoResource}s.
 *
 * @async
 * @typedef {function():(Array<geoResource>)} georesourceProvider
 */

import { $injector } from '../injection';
import { WMTSGeoResource } from './domain/geoResources';
import { loadBvvGeoResources } from './provider/geoResource.provider';

export const FALLBACK_GEORESOURCE_ID_0 = 'atkis';
export const FALLBACK_GEORESOURCE_ID_1 = 'atkis_sw';
export const FALLBACK_GEORESOURCE_LABEL_0 = 'Base Layer 1';
export const FALLBACK_GEORESOURCE_LABEL_1 = 'Base Layer 2';

/**
 * Service for managing {@link GeoResource}s.
 *
 * @class
 * @author taulinger
 */
export class GeoResourceService {

	/**
	 *
	 * @param {georesourceProvider} [georesourceProvider=loadBvvGeoResources]
	 */
	constructor(provider = loadBvvGeoResources) {
		this._provider = provider;
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
	 * Adds a {@link GeoResource} to the internal cache.
	 * An existing GeoResource will be replaced by the new one.
	 * The replacement is done based on the id of the GeoResoure.
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
			new WMTSGeoResource(FALLBACK_GEORESOURCE_ID_0, FALLBACK_GEORESOURCE_LABEL_0, 'https://intergeo{31-37}.bayernwolke.de/betty/g_atkis/{z}/{x}/{y}'),
			new WMTSGeoResource(FALLBACK_GEORESOURCE_ID_1, FALLBACK_GEORESOURCE_LABEL_1, 'https://intergeo{31-37}.bayernwolke.de/betty/g_atkisgray/{z}/{x}/{y}')
		].map(gr => {
			gr.attribution = 'Bayerische Vermessungsverwaltung';
			return gr;
		});
	}
}
