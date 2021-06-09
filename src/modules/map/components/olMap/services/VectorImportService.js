import { VectorSourceType } from '../../../../../services/domain/geoResources';
import VectorSource from 'ol/source/Vector';
import { $injector } from '../../../../../injection';
import { load as featureLoader } from '../utils/feature.provider';
import { KML, GPX, GeoJSON } from 'ol/format';
import { unByKey } from 'ol/Observable';



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
 * Specific stylings will be applied if required.
 * @class
 * @author taulinger
 */
export class VectorImportService {

	_updateStyle(olFeature, olLayer, olMap)  {
		const { StyleService: styleService } = $injector.inject('StyleService');
		styleService.updateStyle(olFeature, olMap, {
			visible: olLayer.getVisible(),
			top: olMap.getLayers().item(olMap.getLayers().getLength() - 1) === olLayer,
			opacity: olLayer.getOpacity()
		});
	}


	_registerStyleEventListeners(olVectorSource, olLayer, olMap) {

		const { StyleService: styleService } = $injector.inject('StyleService');

		
		const addFeatureListenerKey = olVectorSource.on('addfeature', event => {
			styleService.addStyle(event.feature, olMap);
			// //if we are already attached to map, we update also the style
			// if (olLayer) {
			this._updateStyle(event.feature, olLayer, olMap);
			// }
		});
		const removeFeatureListenerKey = olVectorSource.on('removefeature', event => {
			styleService.removeStyle(event.feature, olMap);
		});
		const clearFeaturesListenerKey = olVectorSource.on('clear', () => {
			olVectorSource.getFeatures().forEach(f => styleService.removeStyle(f, olMap));
		});

		/**
		 * Changes of visibility, opacity and index always go along with removing and re-adding the olLayer to the map
		 * therefore it's sufficient to listen just to the 'add' event of the layers collection
		*/
		const addLayerListenerKey = olMap.getLayers().on('add', event => {
			if (event.element === olLayer) {
				olVectorSource.getFeatures().forEach(f => this._updateStyle(f, olLayer, olMap));
			}
		});

		return { addFeatureListenerKey, removeFeatureListenerKey, clearFeaturesListenerKey, addLayerListenerKey };

	}


	/**
	 * Ensures that specific stylings (and overlays) are set for this source
	 * @param {ol.VectorSource} olVectorSource
	 * @param {ol.Map} olMap
	 * @returns object containing the addListenerKey and clearListenerKey
	 */
	_applyStyles(olVectorSource, olLayer, olMap) {

		/**
		 * We check if an added features needs a specifig styling,
		 * apply the style and register the necessary event listeners in order to keep the style (and overlays)
		 * up-to-date with the layer.
		 */
		const { StyleService: styleService } = $injector.inject('StyleService');

		const key = olVectorSource.on('addfeature', event => {

			if (styleService._detectStyleType(event.feature)) {
				styleService.addStyle(event.feature, olMap);
				this._updateStyle(event.feature, olLayer, olMap);
				this._registerStyleEventListeners(olVectorSource, olLayer, olMap);
				unByKey(key);
			}

		});
	}

	/**
	 * Builds an ol VectorSource from an internal VectorGeoResource
	 * @param {VectorGeoResource} vectorGeoResource 
	 * @param {ol.Map} map
	 * @returns olVectorSource
	 */
	vectorSourceFromInternalData(geoResource, olLayer, olMap) {

		const {
			MapService: mapService
		} = $injector.inject('MapService');

		const destinationSrid = mapService.getSrid();
		const vectorSource = new VectorSource();
		this._applyStyles(vectorSource, olLayer, olMap);

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
	vectorSourceFromExternalData(geoResource, olLayer, olMap) {
		const { UrlService: urlService } = $injector.inject('UrlService');
		const source = new VectorSource({
			url: urlService.proxifyInstant(geoResource.url),
			loader: featureLoader,
			format: mapVectorSourceTypeToFormat(geoResource.sourceType)
		});
		this._applyStyles(source, olLayer, olMap);
		return source;
	}
}
