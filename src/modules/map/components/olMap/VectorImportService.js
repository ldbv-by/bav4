import { VectorSourceType } from '../../../../services/domain/geoResources';
import VectorSource from 'ol/source/Vector';
import { $injector } from '../../../../injection';
import { load as featureLoader } from './utils/feature.provider';
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


	// needed soon
	// isMeasureFeature(olFeature) {
	// 	const regex = /^measure/;
	// 	return (olFeature && regex.test(olFeature.getId()));
	// }

	/**
     * Ensures that feature specific stylings and overlays are set for this source
     * @param {VectorSource} olVectorSource
     * @param {Map} olMap
     * @returns object containing the addListenerKey and clearListenerKey
     */
	// eslint-disable-next-line no-unused-vars
	applyStyling(vectorSource, map) {
		//Todo: here we will apply stylings and overlays
		//probably we will need a map instance for the overlays
		const addListenerKey = vectorSource.on('addfeature', () => {
		});
		const clearListenerKey = vectorSource.on('clear', () => {
		});
		return { addListenerKey, clearListenerKey };
	}

	/**
     * Builds an ol VectorSource from an internal VectorGeoResource
     * @param {VectorGeoResource} vectorGeoResource 
     * @returns olVectorSource
     */
	vectorSourceFromInternalData(geoResource) {

		const {
			MapService: mapService
		} = $injector.inject('MapService');

		const destinationSrid = mapService.getSrid();
		const vectorSource = new VectorSource();
		this.applyStyling(vectorSource);

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
     * @returns olVectorSource
     */
	vectorSourceFromExternalData(geoResource) {
		const { UrlService: urlService } = $injector.inject('UrlService');
		const source = new VectorSource({
			url: urlService.proxifyInstant(geoResource.url),
			loader: featureLoader,
			format: mapVectorSourceTypeToFormat(geoResource.sourceType)
		});
		this.applyStyling(source);
		return source;
	}
}
