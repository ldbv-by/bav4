import { $injector } from '../../../../../injection';
import { GeoResourceTypes } from '../../../../../services/domain/geoResources';
import { Image as ImageLayer, Vector as VectorLayer, Group as LayerGroup } from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';

/**
 * Converts a geoResource to an ol layer.
 * Caching will be implemented in the future. 
 * @class
 * @author taulinger
 */
export class LayerService {

	toOlLayer(geoResource) {

		const {
			GeoResourceService: georesourceService,
			VectorImportService: vectorImportService
		} = $injector.inject('GeoResourceService', 'VectorImportService');

		const createVectorSource = (geoResource) => {
			return geoResource.url
				? vectorImportService.vectorSourceFromExternalData(geoResource)
				: vectorImportService.vectorSourceFromInternalData(geoResource);
		};


		switch (geoResource.getType()) {
			case GeoResourceTypes.WMS:
				return new ImageLayer({
					id: geoResource.id,
					source: new ImageWMS({
						url: geoResource.url,
						crossOrigin: 'anonymous',
						params: {
							'LAYERS': geoResource.layers,
							'FORMAT': geoResource.format,
							'VERSION': '1.1.1'
						}
					}),
				});

			case GeoResourceTypes.WMTS:
				return new TileLayer({
					id: geoResource.id,
					source: new XYZSource({
						url: geoResource.url,
					})
				});

			case GeoResourceTypes.VECTOR: {

				const vgr = new VectorLayer({
					id: geoResource.id,
					source: createVectorSource(geoResource)
				});

				return vgr;
			}

			case GeoResourceTypes.AGGREGATE: {
				return new LayerGroup({
					id: geoResource.id,
					layers: geoResource.geoResourceIds.map(id => this.toOlLayer(georesourceService.byId(id)))
				});
			}
		}
		throw new Error(geoResource.getType() + ' currently not supported');
	}
}
