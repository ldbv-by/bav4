
/**
 * An async function that that provides an array of
 * {@link GeoResource}s.
 *
 * @async
 * @typedef {function():(Array<geoResource>)} georesourceProvider
 */

import { VectorTileGeoResource } from './domain/geoResources';
import { loadBvvGeoResources } from './provider/geoResource.provider';


/**
 * Service for managing {@link GeoResource}s.
 * 
 * @class
 * @author aul
 */
export class GeoResourceService {

	/**
	 * 
	 * @param {georesourceProvider} provider 
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
				return this._georesources;
			}
			catch (e) {
				this._georesources = [this._newFallbackGeoResource()];
				console.warn('GeoResources could not be fetched from backend. Using fallback geoResources ...');
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
	 * Adds a GeoResoure to the internal cache.
	 * @param {GeoResource} georesource 
	 * @returns {boolean} true, when succesfully added
	 */
	add(georesource) {
		if (!this._georesources.find(_georesource => _georesource.id === georesource.id)) {
			this._georesources.push(georesource);
			return true;
		}
		return false;
	}

	/**
	 * @private
	 */
	_newFallbackGeoResource() {
		// const wmtsGeoResource = new WMTSGeoResource('fallback', 'Webkarte', 'https://intergeo{31-37}.bayernwolke.de/betty/g_atkis/{z}/{x}/{y}');
		// return wmtsGeoResource;

		const vectorTilesGeoResource = new VectorTileGeoResource('fallback', 'Webkarte');
		return vectorTilesGeoResource;
	}
}
