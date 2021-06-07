import { VectorSourceType } from '../../../../../services/domain/geoResources';
import VectorSource from 'ol/source/Vector';
import { $injector } from '../../../../../injection';
import { load as featureLoader } from '../utils/feature.provider';
import { KML, GPX, GeoJSON } from 'ol/format';



const getUrlService = () => {

	const { UrlService: urlService } = $injector.inject('UrlService');
	return urlService;
};

export const iconUrlFunction = (url) => getUrlService().proxifyInstant(url);

export const mapVectorSourceTypeToFormat = (sourceType) => {

	switch (sourceType) {
		case VectorSourceType.KML:
			return new KML({ iconUrlFunction: iconUrlFunction });

		case VectorSourceType.GPX:
			return new GPX();

		case VectorSourceType.GEOJSON:
			return new GeoJSON();
	}
	throw new Error(sourceType + ' currently not supported');
};


/**
 * Service that imports vector data from internal and external geoResources.
 * @class
 * @author taulinger
 */
export class VectorImportService {


	/**
     * Ensures that feature specific stylings and overlays are set for this source
     * @param {ol.VectorSource} olVectorSource
     * @param {ol.Map} olMap
     * @returns object containing the addListenerKey and clearListenerKey
     */
	// eslint-disable-next-line no-unused-vars
	applyStyling(olVectorSource, olMap) {
		const {	StyleService: styleService } = $injector.inject('StyleService');
		
		const addListenerKey = olVectorSource.on('addfeature', event => {
			styleService.addStyle(event.feature, olMap);
		});
		const removeListenerKey = olVectorSource.on('removefeature', event => {
			styleService.removeStyle(event.feature, olMap);
		});
		const clearListenerKey = olVectorSource.on('clear', () => {
			olVectorSource.getFeatures().forEach(f => styleService.removeStyle(f, olMap));
		});
		return { addListenerKey, removeListenerKey, clearListenerKey };
	}

	/**
     * Builds an ol VectorSource from an internal VectorGeoResource
     * @param {VectorGeoResource} vectorGeoResource 
	 * @param {ol.Map} map
     * @returns olVectorSource
     */
	vectorSourceFromInternalData(geoResource, olMap) {

		const {
			MapService: mapService
		} = $injector.inject('MapService');

		const destinationSrid = mapService.getSrid();
		const vectorSource = new VectorSource();
		this.applyStyling(vectorSource, olMap);

		geoResource.getData().then(data => {
			const format = mapVectorSourceTypeToFormat(geoResource.sourceType);
			const features = format.readFeatures(data);

			// If we know a better name for the geoResource now, we update the label
			switch (geoResource.sourceType) {
				case VectorSourceType.KML:
					geoResource.label = format.readName(data) || geoResource.label;
					break;
			}
			features.forEach(f => {
				f.getGeometry().transform('EPSG:' + geoResource.srid, 'EPSG:' + destinationSrid);
				f.set('srid', destinationSrid, true);
			});
			vectorSource.addFeatures(features);
		}, reason => {
			console.warn(reason);
		});
		return vectorSource;
	}

	/**
     * 
     * Builds an ol VectorSource from an external VectorGeoResource
     * @param {VectorGeoResource} vectorGeoResource 
	 * @param {ol.Map} map
     * @returns olVectorSource
     */
	vectorSourceFromExternalData(geoResource, olMap) {
		const { UrlService: urlService } = $injector.inject('UrlService');
		const source = new VectorSource({
			url: urlService.proxifyInstant(geoResource.url),
			loader: featureLoader,
			format: mapVectorSourceTypeToFormat(geoResource.sourceType)
		});
		this.applyStyling(source, olMap);
		return source;
	}
}
