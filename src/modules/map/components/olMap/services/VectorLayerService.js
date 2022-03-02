import { VectorSourceType } from '../../../../../services/domain/geoResources';
import VectorSource from 'ol/source/Vector';
import { $injector } from '../../../../../injection';
import { load as featureLoader } from '../utils/feature.provider';
import { KML, GPX, GeoJSON } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';



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
 * Service that creates an ol VectorLayer from a VectorGeoResource
 * and applies specific stylings if required.
 * @class
 * @author taulinger
 */
export class VectorLayerService {

	_updateStyle(olFeature, olLayer, olMap) {
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
			this._updateStyle(event.feature, olLayer, olMap);
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
	 * If needed, adds specific stylings (and overlays) for this vector layer
	 * @param {ol.layer.Vector} olVectorLayer
	 * @param {ol.Map} olMap
	 * @returns olVectorLayer
	 */
	_applyStyles(olVectorLayer, olMap) {

		/**
		 * We check if an currently present and possible future features needs a specific styling.
		 * If so, we apply the style and register an event listeners in order to keep the style (and overlays)
		 * up-to-date with the layer.
		 */
		const { StyleService: styleService } = $injector.inject('StyleService');
		const olVectorSource = olVectorLayer.getSource();
		if (olVectorSource.getFeatures().filter(feature => styleService.isStyleRequired(feature)).length > 0) {
			// if we have at least one style requiring feature, we register the styleEvent listener once
			// and apply the style for all currently present features
			this._registerStyleEventListeners(olVectorSource, olVectorLayer, olMap);
			olVectorSource.getFeatures().forEach(feature => {
				if (styleService.isStyleRequired(feature)) {
					styleService.addStyle(feature, olMap);
					this._updateStyle(feature, olVectorLayer, olMap);
				}
			});
		}

		return olVectorLayer;
	}

	/**
	 * Builds an ol VectorLayer from an VectorGeoResource
	 * @param {VectorGeoResource} vectorGeoResource
	 * @param {OlMap} olMap
	 * @returns olVectorLayer
	 */
	createVectorLayer(vectorGeoResource, olMap) {
		const { id, minZoom, maxZoom, opacity } = vectorGeoResource;
		const vectorLayer = new VectorLayer({
			id: id,
			opacity: opacity,
			minZoom: minZoom ?? undefined,
			maxZoom: maxZoom ?? undefined
		});
		const vectorSource = vectorGeoResource.url
			? this._vectorSourceForUrl(vectorGeoResource)
			: this._vectorSourceForData(vectorGeoResource);
		vectorLayer.setSource(vectorSource);
		return this._applyStyles(vectorLayer, olMap);
	}

	/**
	 * Builds an ol VectorSource from an VectorGeoResource
	 * @param {VectorGeoResource} vectorGeoResource
	 * @param {ol.Map} map
	 * @returns olVectorSource
	 */
	_vectorSourceForData(geoResource) {

		const {
			MapService: mapService
		} = $injector.inject('MapService');

		const destinationSrid = mapService.getSrid();
		const vectorSource = new VectorSource();

		const data = geoResource.data;
		const format = mapVectorSourceTypeToFormat(geoResource.sourceType);
		const features = format.readFeatures(data);

		// If we know a better name for the geoResource now, we update the label
		switch (geoResource.sourceType) {
			case VectorSourceType.KML:
				geoResource.setLabel(format.readName(data) ?? geoResource.label);
				break;
		}
		features.forEach(f => {
			f.getGeometry().transform('EPSG:' + geoResource.srid, 'EPSG:' + destinationSrid);
			f.set('srid', destinationSrid, true);
		});
		vectorSource.addFeatures(features);
		return vectorSource;
	}

	/**
	 *
	 * Builds an ol VectorSource from an  VectorGeoResource
	 * @param {VectorGeoResource} vectorGeoResource
	 * @param {ol.Map} map
	 * @returns olVectorSource
	 */
	_vectorSourceForUrl(geoResource) {
		const { UrlService: urlService } = $injector.inject('UrlService');
		const source = new VectorSource({
			url: urlService.proxifyInstant(geoResource.url),
			loader: featureLoader,
			format: mapVectorSourceTypeToFormat(geoResource.sourceType)
		});
		return source;
	}
}
