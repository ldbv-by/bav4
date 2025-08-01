/**
 * @module modules/olMap/services/LayerService
 */
import { $injector } from '../../../injection';
import { GeoResourceAuthenticationType, GeoResourceTypes } from '../../../domain/geoResources';
import { Image as ImageLayer, Group as LayerGroup, Layer } from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import { getBvvBaaImageLoadFunction, getBvvTileLoadFunction } from '../utils/olLoadFunction.provider';
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';
import { AdvWmtsTileGrid } from '../ol/tileGrid/AdvWmtsTileGrid';
import { Projection } from 'ol/proj';
import ImageWMS from 'ol/source/ImageWMS.js';
import { UnavailableGeoResourceError } from '../../../domain/errors';
import { BvvGk4WmtsTileGrid } from '../ol/tileGrid/BvvGk4WmtsTileGrid';
import { RefreshableXYZ } from '../ol/source/RefreshableXYZ';
import { Eu25832WmtsTileGrid } from '../ol/tileGrid/Eu25832WmtsTileGrid';
import { asInternalProperty } from '../../../utils/propertyUtils';
import { getLayerById, getLayerGroup } from '../utils/olMapUtils';
import { DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS } from '../../../domain/layer';

/**
 * A function that returns a `ol.image.LoadFunction` for loading also restricted images via basic access authentication
 * @typedef {Function} imageLoadFunctionProvider
 * @param {string} geoResourceId The id of the corresponding GeoResource
 * @param {module:domain/credentialDef~Credential|null} [credential] The credential for basic access authentication (when BAA is requested) or `null` or `undefined`
 * @param {number[]|null} [maxSize] Maximum width and height of the requested image in px or `null` or `undefined`
 * @returns {Function} ol.image.LoadFunction
 */

/**
 * A function that returns a `ol.tile.LoadFunction`.
 * @typedef {Function} tileLoadFunctionProvider
 * @param {string} geoResourceId The id of the corresponding GeoResource
 * @param {ol.layer.Layer} olLayer The the corresponding ol layer
 * @returns {Function} ol.tile.LoadFunction
 */

/**
 * Converts a GeoResource to a ol layer instance.
 * @class
 * @author taulinger
 */
export class LayerService {
	/**
	 * @param {module:modules/olMap/services/LayerService~imageLoadFunctionProvider} [imageLoadFunctionProvider=getBvvBaaImageLoadFunction]
	 */
	constructor(imageLoadFunctionProvider = getBvvBaaImageLoadFunction, tileLoadFunctionProvider = getBvvTileLoadFunction) {
		this._imageLoadFunctionProvider = imageLoadFunctionProvider;
		this._tileLoadFunctionProvider = tileLoadFunctionProvider;
	}

	_registerUpdateIntervalHandler(olLayer, geoResource, olMap) {
		const refreshSource = () => {
			if (!getLayerById(olMap, olLayer.get('id')) && !getLayerGroup(olMap, olLayer)) {
				//if the layer is not attached to the map anymore we remove the interval
				clearInterval(olLayer.getSource().get(asInternalProperty('updateIntervalId')));
			} else {
				/**
				 * Switch over currently supported GeoResources
				 */
				switch (geoResource.getType()) {
					case GeoResourceTypes.WMS: {
						const params = olLayer.getSource().getParams();
						olLayer.getSource().updateParams(params);
						break;
					}
					case GeoResourceTypes.VECTOR:
					case GeoResourceTypes.OAF: {
						olLayer.getSource().refresh();
						break;
					}
				}
			}
		};

		const setUpdateIntervalForLayer = (intervalInSeconds) => {
			if (intervalInSeconds >= DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS) {
				const intervalId = setInterval(refreshSource, intervalInSeconds * 1_000);
				olLayer.getSource().set(asInternalProperty('updateIntervalId'), intervalId);
			}
		};

		// handle update interval on ba-Layer level
		olLayer.on('propertychange', (event) => {
			const property = event.key;
			if (property === 'updateInterval' && olLayer.get('updateInterval') && olLayer.get('updateInterval') !== event.oldValue) {
				// we remove an possible existing interval
				clearInterval(olLayer.getSource().get(asInternalProperty('updateIntervalId')));
				// and register a new one
				setUpdateIntervalForLayer(olLayer.get('updateInterval'));
			}
		});

		// handle update interval on ba-GeoResource level
		if (geoResource.hasUpdateInterval()) {
			setUpdateIntervalForLayer(geoResource.updateInterval);
		}
		return olLayer;
	}

	/**
	 *
	 * @param {string} id layerId
	 * @param {GeoResource} geoResource
	 * @param {Map} olMap
	 * @throws UnavailableGeoResourceError
	 * @returns ol layer
	 */
	toOlLayer(id, geoResource, olMap) {
		const {
			GeoResourceService: geoResourceService,
			VectorLayerService: vectorLayerService,
			RtVectorLayerService: rtVectorLayerService,
			BaaCredentialService: baaCredentialService
		} = $injector.inject('GeoResourceService', 'VectorLayerService', 'BaaCredentialService', 'RtVectorLayerService');

		const { minZoom, maxZoom, opacity } = geoResource;

		/**
		 * Here we just check if a BA-authenticated GeoResource can access its credentials.
		 * Note: This does not mean that the concrete loader of the GeoResource actually supports BAA.
		 */
		if (geoResource.authenticationType === GeoResourceAuthenticationType.BAA && geoResource.url) {
			const credential = baaCredentialService.get(geoResource.url);
			if (!credential) {
				throw new UnavailableGeoResourceError(
					`No credential available for GeoResource with id '${geoResource.id}' and url '${geoResource.url}'`,
					geoResource.id
				);
			}
		}

		switch (geoResource.getType()) {
			case GeoResourceTypes.FUTURE: {
				// in that case we return a placeholder layer
				return new Layer({ id: id, geoResourceId: geoResource.id, render: () => {}, properties: { placeholder: true } });
			}

			case GeoResourceTypes.WMS: {
				const imageWmsSource = new ImageWMS({
					url: geoResource.url,
					crossOrigin: 'anonymous',
					ratio: 1,
					params: {
						LAYERS: geoResource.layers,
						FORMAT: geoResource.format,
						VERSION: '1.1.1',
						...geoResource.extraParams
					}
				});

				switch (geoResource.authenticationType) {
					case GeoResourceAuthenticationType.BAA: {
						imageWmsSource.setImageLoadFunction(
							this._imageLoadFunctionProvider(geoResource.id, baaCredentialService.get(geoResource.url), geoResource.maxSize)
						);
						break;
					}
					default: {
						imageWmsSource.setImageLoadFunction(this._imageLoadFunctionProvider(geoResource.id, null, geoResource.maxSize));
					}
				}

				const layer = new ImageLayer({
					id: id,
					geoResourceId: geoResource.id,
					source: imageWmsSource,
					opacity: opacity,
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined
				});
				return this._registerUpdateIntervalHandler(layer, geoResource, olMap);
			}

			case GeoResourceTypes.XYZ: {
				const tileLayer = new TileLayer({
					id: id,
					geoResourceId: geoResource.id,
					opacity: opacity,
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined,
					/** Note currently we disable a preload for layers with timestamps in order to reduce GK4 transformation costs */
					preload: geoResource.timestamps.length > 0 ? 0 : 1
				});
				const xyzSource = () => {
					const config = {
						url: Array.isArray(geoResource.urls) ? undefined : geoResource.urls,
						urls: Array.isArray(geoResource.urls) ? geoResource.urls : undefined,
						tileLoadFunction: this._tileLoadFunctionProvider(geoResource.id, tileLayer)
					};
					switch (geoResource.tileGridId) {
						case 'adv_utm':
							return new RefreshableXYZ({
								...config,
								tileGrid: new AdvWmtsTileGrid(),
								projection: new Projection({ code: 'EPSG:25832' }) // to make it testable we use a Projection instead of a ProjectionLike here
							});
						case 'eu25832':
							return new RefreshableXYZ({
								...config,
								tileGrid: new Eu25832WmtsTileGrid(),
								projection: new Projection({ code: 'EPSG:25832' }) // to make it testable we use a Projection instead of a ProjectionLike here
							});
						case 'bvv_gk4':
							return new RefreshableXYZ({
								...config,
								tileGrid: new BvvGk4WmtsTileGrid(),
								projection: new Projection({ code: 'EPSG:31468' }) // to make it testable we use a Projection instead of a ProjectionLike here
							});
						default:
							return new RefreshableXYZ({
								...config
							});
					}
				};
				tileLayer.setSource(xyzSource());
				// Trigger a refresh of the source when layers property changed
				tileLayer.on('propertychange', (event) => {
					const property = event.key;
					if (property === 'timestamp' && tileLayer.get('timestamp') !== event.oldValue) {
						tileLayer.getSource().smoothRefresh(tileLayer.get('timestamp'));
					}
				});
				return tileLayer;
			}

			case GeoResourceTypes.VECTOR:
			case GeoResourceTypes.OAF: {
				const vectorLayer = vectorLayerService.createLayer(id, geoResource, olMap);
				return this._registerUpdateIntervalHandler(vectorLayer, geoResource, olMap);
			}
			case GeoResourceTypes.RT_VECTOR: {
				return rtVectorLayerService.createLayer(id, geoResource, olMap);
			}

			case GeoResourceTypes.VT: {
				return new MapLibreLayer({
					id: id,
					geoResourceId: geoResource.id,
					opacity: opacity,
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined,
					mapLibreOptions: {
						style: geoResource.styleUrl
					}
				});
			}

			case GeoResourceTypes.AGGREGATE: {
				const layerGroup = new LayerGroup({
					id: id,
					opacity: opacity,
					layers: geoResource.geoResourceIds.map((id) => this.toOlLayer(id, geoResourceService.byId(id), olMap)),
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined
				});

				// synchronizes the MapLibre layers's opacity with the layer group's one
				layerGroup.on('change:opacity', (evt) =>
					evt.target.getLayers().forEach((el) => {
						if (el instanceof MapLibreLayer) {
							el.setOpacity(evt.target.getOpacity());
						}
					})
				);
				return layerGroup;
			}
		}
		throw new Error(`GeoResource type "${geoResource.getType().description}" currently not supported`);
	}
}
