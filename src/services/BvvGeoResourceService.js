import { AggregateGeoResource, VectorGeoResource, WmsGeoResource, WMTSGeoResource } from './domain/geoResources';
import { $injector } from '../injection';

/**
 * Provider for BVV {@link GeoResource}s.
 * 
 * @class
 * @author aul
 */
export class BvvGeoResourceService {

	constructor() {

		const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
		this._httpService = httpService;
		this._configService = configService;

		this._georesources = null;
	}

	/**
	 * Initializes this service, which means all available GeoResources are loaded and can be served in the future from the internal cache.
	 * @public
	 * @async
	 * @returns {Promise<Array.<GeoResource>> | Promise.reject}
	 */
	async init() {
		if (!this._georesources) {
			try {
				this._georesources = await this._load();
				return Promise.resolve(this._georesources);
			}
			catch (e) {
				return Promise.reject('GeoResourceService could not be initialized: ' + e.message);
			}
		}
		return Promise.resolve(this._georesources);
	}

	async _load() {
		const url = this._configService.getValue('BACKEND_URL') + 'georesources';

		const result = await this._httpService.fetch(url, {
			timeout: 2000,
			mode: 'cors'
		});

		if (result.ok) {
			const geoResources = [];
			const georesourceDefinitions = await result.json();
			georesourceDefinitions.forEach(definition => {
				let geoResource = null;
				switch (definition.type) {
					case 'wms':
						geoResource = new WmsGeoResource(definition.id, definition.label, definition.url, definition.layers, definition.format);
						break;
					case 'wmts':
						geoResource = new WMTSGeoResource(definition.id, definition.label, definition.url);
						break;
					case 'vector':
						geoResource = new VectorGeoResource(definition.id, definition.label, definition.url, Symbol.for(definition.sourceType));
						break;
					case 'aggregate':
						geoResource = new AggregateGeoResource(definition.id, definition.label, definition.geoResourceIds);
						break;

				}
				if(geoResource) {
					geoResource.background = definition.background;
					geoResource.opacity = definition.opacity;
					geoResources.push(geoResource);
				}
				else{
					console.warn('Could not create a GeoResource  for ' + definition.id);
				}
			});
			return Promise.resolve(geoResources);
		}
		return Promise.reject(new Error('GeoResources could not be loaded'));
	}

	/**
	 * Returns all available {@link GeoResource}.
	 * @public
	 * @returns  {Array.<GeoResource>}
	 */
	all() {
		if (!this._georesources) {
			throw new Error('GeoResourceService not yet initialized');
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
			throw new Error('GeoResourceService not yet initialized');
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
}
