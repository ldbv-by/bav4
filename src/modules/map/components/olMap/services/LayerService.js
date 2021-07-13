import { $injector } from '../../../../../injection';
import { GeoResourceTypes } from '../../../../../services/domain/geoResources';
import { Image as ImageLayer, Vector as VectorLayer, Group as LayerGroup } from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';
import { setFetching } from '../../../../../store/network/network.action';

/**
 * Converts a geoResource to an ol layer.
 * Caching will be implemented in the future. 
 * @class
 * @author taulinger
 */
export class LayerService {

	toOlLayer(geoResource, olMap) {

		const {
			GeoResourceService: georesourceService,
			VectorImportService: vectorImportService
		} = $injector.inject('GeoResourceService', 'VectorImportService');

		switch (geoResource.getType()) {

			case GeoResourceTypes.WMS: {

				const imageWmsSource = new ImageWMS({
					url: geoResource.url,
					crossOrigin: 'anonymous',
					params: {
						'LAYERS': geoResource.layers,
						'FORMAT': geoResource.format,
						'VERSION': '1.1.1'
					}
				});
				imageWmsSource.on('imageloadstart', () => setFetching(true));
				imageWmsSource.on(['imageloadend', 'imageloaderror'], () => setFetching(false));

				return new ImageLayer({
					id: geoResource.id,
					source: imageWmsSource
				});
			}

			case GeoResourceTypes.WMTS: {

				const xyZsource = new XYZSource({
					url: geoResource.url
				});
				xyZsource.on('tileloadstart', () => setFetching(true));
				xyZsource.on(['tileloadend', 'tileloaderror'], () => setFetching(false));

				return new TileLayer({
					id: geoResource.id,
					source: xyZsource
				});
			}

			case GeoResourceTypes.VECTOR: {

				const vectorLayer = new VectorLayer({
					id: geoResource.id,
				});
				let vectorSource;
				if (geoResource.url) {
					vectorSource = vectorImportService.vectorSourceFromExternalData(geoResource);
				}
				else {
					vectorSource = vectorImportService.vectorSourceFromInternalData(geoResource);
				}
				vectorLayer.setSource(vectorSource);
				return vectorImportService.applyStyles(vectorLayer, olMap);
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
