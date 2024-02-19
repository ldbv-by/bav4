/**
 * @module modules/olMap/services/LayerService
 */
import { $injector } from '../../../injection';
import { GeoResourceAuthenticationType, GeoResourceTypes } from '../../../domain/geoResources';
import { Image as ImageLayer, Group as LayerGroup, Layer } from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';
import { getBvvBaaImageLoadFunction } from '../utils/baaImageLoadFunction.provider';
import MapLibreLayer from '@geoblocks/ol-maplibre-layer';
import { AdvWmtsTileGrid } from '../ol/tileGrid/AdvWmtsTileGrid';
import { Projection } from 'ol/proj';
import ImageWMS from 'ol/source/ImageWMS.js';

/**
 * A function that returns a `ol.image.LoadFunction` for loading restricted images via basic access authentication
 * @typedef {Function} baaImageLoadFunctionProvider
 * @param {module:domain/credentialDef~Credential} credential The credential for basic access authentication
 * @param {number[]} maxSize Maximum width and height of the requested image in px
 * @returns {Function} ol.image.LoadFunction
 */

/**
 * Converts a GeoResource to a ol layer instance.
 * @class
 * @author taulinger
 */
export class LayerService {
	/**
	 * @param {module:modules/olMap/services/LayerService~baaImageLoadFunctionProvider} [baaImageLoadFunctionProvider=getBvvBaaImageLoadFunction]
	 */
	constructor(baaImageLoadFunctionProvider = getBvvBaaImageLoadFunction) {
		this._baaImageLoadFunctionProvider = baaImageLoadFunctionProvider;
	}

	/**
	 *
	 * @param {string} id layerId
	 * @param {GeoResourceTypes} geoResource
	 * @param {Map} olMap
	 * @returns ol layer
	 */
	toOlLayer(id, geoResource, olMap) {
		const {
			GeoResourceService: georesourceService,
			VectorLayerService: vectorLayerService,
			BaaCredentialService: baaCredentialService
		} = $injector.inject('GeoResourceService', 'VectorLayerService', 'BaaCredentialService');

		const { minZoom, maxZoom, opacity } = geoResource;

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
						const credential = baaCredentialService.get(geoResource.url);
						if (!credential) {
							throw new Error(`No credential available for GeoResource with id '${geoResource.id}' and url '${geoResource.url}'`);
						}
						imageWmsSource.setImageLoadFunction(this._baaImageLoadFunctionProvider(credential));
						break;
					}
					default: {
						imageWmsSource.setImageLoadFunction(this._baaImageLoadFunctionProvider());
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
				return layer;
			}

			case GeoResourceTypes.XYZ: {
				const xyzSource = () => {
					const config = {
						url: Array.isArray(geoResource.urls) ? undefined : geoResource.urls,
						urls: Array.isArray(geoResource.urls) ? geoResource.urls : undefined
					};
					switch (geoResource.tileGridId) {
						case 'adv_wmts':
							return new XYZSource({
								...config,
								tileGrid: new AdvWmtsTileGrid(),
								projection: new Projection({ code: 'EPSG:25832' }) // to make it testable we use a Projection instead of a ProjectionLike here
							});
						default:
							return new XYZSource({
								...config
							});
					}
				};

				return new TileLayer({
					id: id,
					geoResourceId: geoResource.id,
					source: xyzSource(),
					opacity: opacity,
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined,
					preload: 3
				});
			}

			case GeoResourceTypes.VECTOR: {
				return vectorLayerService.createVectorLayer(id, geoResource, olMap);
			}

			case GeoResourceTypes.VT: {
				return new MapLibreLayer({
					id: id,
					geoResourceId: geoResource.id,
					opacity: opacity,
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined,
					maplibreOptions: {
						style: geoResource.styleUrl
					}
				});
			}

			case GeoResourceTypes.AGGREGATE: {
				const layerGroup = new LayerGroup({
					id: id,
					opacity: opacity,
					layers: geoResource.geoResourceIds.map((id) => this.toOlLayer(id, georesourceService.byId(id))),
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
		throw new Error(geoResource.getType() + ' currently not supported');
	}
}
