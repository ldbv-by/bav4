
/**
 * An async function that that provides an array of
 * {@link GeoResource}s.
 *
 * @async
 * @typedef {function():(Array<geoResource>)} georesourceProvider
 */

import { WMTSGeoResource } from './domain/geoResources';
import { loadBvvGeoResources } from './provider/geoResource.provider';


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
				console.warn('GeoResources could not be fetched from backend. Using fallback geoResources ...');
			}
			//we add the fallback geoResources in any case
			this._georesources.push(...this._newFallbackGeoResources());
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
			new WMTSGeoResource('atkis', 'Base Layer 1', 'https://intergeo{31-37}.bayernwolke.de/betty/g_atkis/{z}/{x}/{y}'),
			new WMTSGeoResource('atkis_sw', 'Base Layer 2', 'https://intergeo{31-37}.bayernwolke.de/betty/g_atkisgray/{z}/{x}/{y}')
		].map(gr => {
			gr.attribution = 'Bayerische Vermessungsverwaltung';
			return gr;
		});
	}
}
