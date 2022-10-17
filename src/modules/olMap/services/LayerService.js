import { $injector } from '../../../injection';
import { GeoResourceAuthenticationType, GeoResourceTypes } from '../../../domain/geoResources';
import { Image as ImageLayer, Group as LayerGroup, Layer } from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';
import { getBvvBaaImageLoadFunction } from '../utils/baaImageLoadFunction.provider';
import { getPrerenderFunctionForImageLayer, LimitedImageWMS } from '../ol/source/LimitedImageWMS';
import MapLibreLayer from '@geoblocks/ol-maplibre-layer';
import { AdvWmtsTileGrid } from '../ol/tileGrid/AdvWmtsTileGrid';
import { Projection } from 'ol/proj';

/**
 * Converts a GeoResource to a ol layer instance.
 * @class
 * @author taulinger
 */
export class LayerService {

	/**
	 * @param {baaImageLoadFunctionProvider} [baaImageLoadFunctionProvider=getBvvBaaImageLoadFunction]
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
				return new Layer({ id: id, geoResourceId: geoResource.id, render: () => { }, properties: { placeholder: true } });
			}

			case GeoResourceTypes.WMS: {

				const imageWmsSource = new LimitedImageWMS({
					url: geoResource.url,
					crossOrigin: 'anonymous',
					ratio: 1,
					params: {
						'LAYERS': geoResource.layers,
						'FORMAT': geoResource.format,
						'VERSION': '1.1.1',
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
				const onPrerenderFunctionKey = layer.on('prerender', getPrerenderFunctionForImageLayer());
				layer.set('onPrerenderFunctionKey', onPrerenderFunctionKey);
				return layer;
			}

			case GeoResourceTypes.XYZ: {

				const xyzSource = () => {
					switch (geoResource.tileGridId) {

						case 'adv_wmts': return new XYZSource({
							url: geoResource.url,
							tileGrid: new AdvWmtsTileGrid(),
							projection: new Projection({ code: 'EPSG:25832' }) // to make it testable we use a Projection instead of a ProjectionLike here
						});
						default: return new XYZSource({
							url: geoResource.url
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
					opacity: opacity,
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined,
					maplibreOptions: {
						style: geoResource.styleUrl
					}
				});
			}

			case GeoResourceTypes.AGGREGATE: {
				return new LayerGroup({
					id: id,
					opacity: opacity,
					layers: geoResource.geoResourceIds.map(id => this.toOlLayer(id, georesourceService.byId(id))),
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined
				});
			}
		}
		throw new Error(geoResource.getType() + ' currently not supported');
	}
}
