import { $injector } from '../../../injection';
import { GeoResourceAuthenticationType, GeoResourceTypes } from '../../../services/domain/geoResources';
import { Image as ImageLayer, Group as LayerGroup, Layer } from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';
import { getBvvBaaImageLoadFunction } from '../utils/baaImageLoadFunction.provider';

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
				return new Layer({ id: id, render: () => { }, properties: { placeholder: true } });
			}

			case GeoResourceTypes.WMS: {

				const imageWmsSource = new ImageWMS({
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

				return new ImageLayer({
					id: id,
					source: imageWmsSource,
					opacity: opacity,
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined
				});
			}

			case GeoResourceTypes.WMTS: {

				const xyZsource = new XYZSource({
					url: geoResource.url
				});

				return new TileLayer({
					id: id,
					source: xyZsource,
					opacity: opacity,
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined,
					preload: 3
				});
			}

			case GeoResourceTypes.VECTOR: {

				return vectorLayerService.createVectorLayer(id, geoResource, olMap);
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
