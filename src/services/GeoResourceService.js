/**
 * @module services/GeoResourceService
 */
/**
 * An async function that provides an array of {@link GeoResource}s.
 *
 * @async
 * @typedef {function} geoResourceProvider
 * @return {GeoResource[]}
 */

/**
 * A function that returns a {@link GeoResourceFuture}.
 * @param {string} id Id of the requested GeoResource
 * @typedef {function} geoResourceByIdProvider
 * @returns {GeoResourceFuture|null}
 */

import { $injector } from '../injection';
import { AggregateGeoResource, observable, VTGeoResource, XyzGeoResource } from '../domain/geoResources';
import { loadBvvFileStorageResourceById } from './provider/fileStorage.provider';
import { loadBvvGeoResourceById, loadBvvGeoResources, loadExternalGeoResource } from './provider/geoResource.provider';
import { geoResourceChanged } from '../store/layers/layers.action';
import { bvvAuthResponseInterceptorProvider } from './provider/auth.provider';
import { isString } from '../utils/checks';

export const FALLBACK_GEORESOURCE_ID_0 = 'tpo';
export const FALLBACK_GEORESOURCE_ID_1 = 'tpo_mono';
export const FALLBACK_GEORESOURCE_ID_2 = 'bmde_vector';
export const FALLBACK_GEORESOURCE_ID_3 = 'bmde_vector_relief';
export const FALLBACK_GEORESOURCE_LABEL_0 = 'TopPlusOpen';
export const FALLBACK_GEORESOURCE_LABEL_1 = 'TopPlusOpen monochrome';
export const FALLBACK_GEORESOURCE_LABEL_2 = 'Web Vektor';
export const FALLBACK_GEORESOURCE_LABEL_3 = 'Web Vektor Relief';

/**
 * Service for managing {@link GeoResource}s.
 *
 *
 * GeoResources that should be available a startup time are loaded by the registered geoResourceProvider function.
 * GeoResources which should be loaded on-demand during runtime, are loaded by the registered geoResourceByIdProvider functions.
 *
 * @class
 * @author taulinger
 */
export class GeoResourceService {
	#authService;
	#environmentService;
	/**
	 *
	 * @param {module:services/GeoResourceService~geoResourceProvider} [provider=loadBvvGeoResources]
	 * @param {module:services/GeoResourceService~geoResourceByIdProvider[]} [byIdProvider=[loadBvvFileStorageResourceById, loadBvvGeoResourceById]]
	 * @param {module:services/AuthService~authResponseInterceptorProvider} [authResponseInterceptorProvider=bvvAuthResponseInterceptorProvider]
	 */
	constructor(
		provider = loadBvvGeoResources,
		byIdProvider = [loadExternalGeoResource, loadBvvFileStorageResourceById, loadBvvGeoResourceById],
		authResponseInterceptorProvider = bvvAuthResponseInterceptorProvider
	) {
		this._provider = provider;
		this._byIdProvider = byIdProvider;
		this._authResponseInterceptorProvider = authResponseInterceptorProvider;
		this._geoResources = null;
		const { EnvironmentService: environmentService, AuthService: authService } = $injector.inject('EnvironmentService', 'AuthService');
		this.#authService = authService;
		this.#environmentService = environmentService;
	}

	/**
	 * Initializes this service, which means all available GeoResources are loaded and can be served in the future from the internal cache.
	 * If initialization fails, a fallback is delivered.
	 * @async
	 * @returns {Promise<Array<GeoResource>>}
	 */
	async init() {
		if (!this._geoResources) {
			try {
				this._geoResources = (await this._provider()).map((gr) => this._proxify(gr));
			} catch (e) {
				this._geoResources = [];
				if (this.#environmentService.isStandalone()) {
					console.warn('GeoResources could not be fetched from backend. Using fallback geoResources ...');
					this._geoResources.push(...this._newFallbackGeoResources());
				} else {
					console.error('GeoResources could not be fetched from backend.', e);
				}
			}
		}
		return this._geoResources;
	}

	/**
	 * Returns all available {@link GeoResource}.
	 * @returns  {Array<GeoResource>}
	 */
	all() {
		if (!this._geoResources) {
			console.warn('GeoResourceService not yet initialized');
			return [];
		}
		return this._geoResources;
	}

	/**
	 * Returns the corresponding  {@link GeoResource} for an id.
	 * @param {string|null|undefined} id Id of the desired {@link GeoResource}
	 * @returns {GeoResource | null}
	 */
	byId(id) {
		if (!this._geoResources) {
			console.warn('GeoResourceService not yet initialized');
			return null;
		}
		if (!id) {
			return null;
		}
		const geoResource = this._geoResources.find((georesource) => georesource.id === id);
		return geoResource || null;
	}

	/**
	 * Returns a {@link GeoResourceFuture} by calling all registered {@link geoResourceByIdProvider} in the order of their registration
	 * without checking the internal cache.
	 *
	 *
	 * The GeoResourceFuture will be added to the internal cache and can be replaced later
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
	 * Note:  It's recommended to use the return value for further handling,
	 * which guarantees all necessary synchronization between the GeoResource and the layers slice-of-state
	 * @param {GeoResource} geoResource
	 * @returns the added or replaced  and observed GeoResource
	 */
	addOrReplace(geoResource) {
		const observedGeoResource = this._proxify(geoResource);
		const existingGeoR = this._geoResources.find((_georesource) => _georesource.id === geoResource.id);
		if (existingGeoR) {
			const index = this._geoResources.indexOf(existingGeoR);
			this._geoResources.splice(index, 1, observedGeoResource);
		} else {
			this._geoResources.push(observedGeoResource);
		}
		// update  slice-of-state 'layers'
		geoResourceChanged(observedGeoResource);
		return observedGeoResource;
	}

	/**
	 * Checks if the current auth roles allow to access a certain GeoResource.
	 *
	 * Returns `true` if the GeoResource does not exist.
	 * For AggregateGeoResources it checks its roles or if empty the roles of the referenced GeoResources.
	 * @param {string} id The id of a GeoResource
	 * @returns {boolean} `true` if a GeoResource is allowed to access
	 */
	isAllowed(id) {
		const gr = this.byId(id);
		if (gr) {
			if (gr instanceof AggregateGeoResource && gr.authRoles.length === 0) {
				return !gr.geoResourceIds.some((id) => !this.isAllowed(id));
			}
			return gr.authRoles.length === 0 ? true : gr.authRoles.filter((role) => this.#authService.getRoles().includes(role)).length > 0;
		}
		return true;
	}

	/**
	 * Returns keywords for a GeoResource.
	 *
	 * Returns an empty array if the GeoResource does not exist.
	 * For AggregateGeoResources it takes its keywords or if not present it aggregates the keywords of the referenced GeoResources.
	 * @param {string} id The id of a GeoResource
	 * @returns {Array<String>} the keywords for a GeoResource
	 */
	getKeywords(id) {
		// Todo: use a provider fn for keyword detection
		const gr = this.byId(id);
		if (gr) {
			if (gr instanceof AggregateGeoResource && gr.authRoles.length === 0) {
				return [...new Set(gr.geoResourceIds.map((id) => this.getKeywords(id)).flat())];
			}
			return [...gr.authRoles];
		}
		return [];
	}

	/**
	 * Returns an uniform identifier for both normal and URL-based ids
	 * @param {String} raw a string that denotes a possible GeoResource id
	 * @returns the uniformed id for a possible GeoResource
	 * @throws `TypeError` if the id is not valid
	 */
	parseId(raw) {
		if (isString(raw)) {
			return raw.split('||')[0];
		}
		throw new TypeError(`${raw} is not a valid identifier for a GeoResource`);
	}

	/**
	 * Returns a {@link module:services/HttpService~responseInterceptor} suitable authenticating for a given GeoResource.
	 * @param {string} geoResourceId The id of a GeoResource
	 * @returns {module:services/HttpService~responseInterceptor}
	 */
	getAuthResponseInterceptorForGeoResource(geoResourceId) {
		const roles = this.byId(geoResourceId)?.authRoles ?? [];
		return this._authResponseInterceptorProvider(roles, geoResourceId);
	}

	_newFallbackGeoResources() {
		const topPlusOpenGeoResources = [
			new XyzGeoResource(
				FALLBACK_GEORESOURCE_ID_0,
				FALLBACK_GEORESOURCE_LABEL_0,
				'https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png'
			),
			new XyzGeoResource(
				FALLBACK_GEORESOURCE_ID_1,
				FALLBACK_GEORESOURCE_LABEL_1,
				'https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png'
			)
		].map((gr) => {
			return gr.setAttribution({
				description: 'TopPlusOpen',
				copyright: [
					{ label: 'Bundesamt für Kartographie und Geodäsie (2024)', url: 'https://www.bkg.bund.de/' },
					{ label: 'Datenquellen', url: 'https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf' }
				]
			});
		});

		const baseMapDeVectorGeoResources = [
			new VTGeoResource(
				FALLBACK_GEORESOURCE_ID_2,
				FALLBACK_GEORESOURCE_LABEL_2,
				'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json'
			),
			new VTGeoResource(
				FALLBACK_GEORESOURCE_ID_3,
				FALLBACK_GEORESOURCE_LABEL_3,
				'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json'
			)
		].map((gr) => {
			return gr.setAttribution({
				description: 'basemap.de Web Vektor',
				copyright: { label: 'basemap.de / BKG 08/2022', url: 'https://basemap.de/web-vektor/' }
			});
		});

		return [...topPlusOpenGeoResources, ...baseMapDeVectorGeoResources].map((gr) => this._proxify(gr));
	}

	_proxify(geoResource) {
		return geoResource[GeoResourceService.proxyIdentifier]
			? geoResource // already proxified
			: observable(
					geoResource,
					(key) => {
						if (key === '_label') {
							geoResourceChanged(geoResource.id);
						}
					},
					GeoResourceService.proxyIdentifier
				);
	}

	static get proxyIdentifier() {
		return '__geoResourceServiceProxy';
	}
}
