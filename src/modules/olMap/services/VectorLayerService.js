/**
 * @module modules/olMap/services/VectorLayerService
 */
import { VectorSourceType } from '../../../domain/geoResources';
import VectorSource from 'ol/source/Vector';
import { $injector } from '../../../injection';
import { KML, GPX, GeoJSON, WKT } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import { parse } from '../../../utils/ewkt';
import { Cluster } from 'ol/source';

const getUrlService = () => {
	const { UrlService: urlService } = $injector.inject('UrlService');
	return urlService;
};

export const iconUrlFunction = (url) => getUrlService().proxifyInstant(url, false);

export const bvvIconUrlFunction = (url) => {
	const { UrlService: urlService, ConfigService: configService } = $injector.inject('UrlService', 'ConfigService');

	// legacy v3 backend icons should be mapped to v4
	if (urlService.originAndPathname(url).startsWith('https://geoportal.bayern.de/ba-backend')) {
		const pathParams = urlService.pathParams(url);
		// the legacy icon endpoint contains four path parameters
		if (pathParams.length === 4 && pathParams[1] === 'icons') {
			return `${configService.getValueAsPath('BACKEND_URL')}icons/${pathParams[pathParams.length - 2]}/${pathParams[pathParams.length - 1]}.png`;
		}
		// leave untouched for that case
		return url;
	} // icons from our backend do not need to be proxified
	else if (urlService.originAndPathname(url).startsWith(configService.getValueAsPath('BACKEND_URL'))) {
		return url;
	}
	return urlService.proxifyInstant(url, false);
};

export const mapVectorSourceTypeToFormat = (sourceType) => {
	switch (sourceType) {
		case VectorSourceType.KML:
			return new KML({ iconUrlFunction: bvvIconUrlFunction });

		case VectorSourceType.GPX:
			return new GPX();

		case VectorSourceType.GEOJSON:
			return new GeoJSON();

		case VectorSourceType.EWKT:
			return new WKT();
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
		const { StyleService: styleService, StoreService: storeService } = $injector.inject('StyleService', 'StoreService');
		const {
			layers: { active }
		} = storeService.getStore().getState();
		styleService.updateStyle(olFeature, olMap, {
			visible: olLayer.getVisible(),
			// we check if the layer representing this olLayer is the topmost layer of all unhidden layers
			top: active.filter(({ constraints: { hidden } }) => !hidden).pop().id === olLayer.get('id'),
			opacity: olLayer.getOpacity()
		});
	}

	_registerStyleEventListeners(olVectorSource, olLayer, olMap) {
		const { StyleService: styleService } = $injector.inject('StyleService');

		const addFeatureListenerKey = olVectorSource.on('addfeature', (event) => {
			styleService.addStyle(event.feature, olMap, olLayer);
			this._updateStyle(event.feature, olLayer, olMap);
		});
		const removeFeatureListenerKey = olVectorSource.on('removefeature', (event) => {
			styleService.removeStyle(event.feature, olMap);
		});
		const clearFeaturesListenerKey = olVectorSource.on('clear', () => {
			olVectorSource.getFeatures().forEach((f) => styleService.removeStyle(f, olMap));
		});

		/**
		 * Changes of visibility, opacity and index always go along with removing and re-adding the olLayer to the map
		 * therefore it's sufficient to listen just to the 'add' event of the layers collection
		 */
		const addLayerListenerKey = olMap.getLayers().on('add', (event) => {
			if (event.element === olLayer) {
				olVectorSource.getFeatures().forEach((f) => this._updateStyle(f, olLayer, olMap));
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
		if (olVectorSource.getFeatures().some((feature) => styleService.isStyleRequired(feature))) {
			// if we have at least one style requiring feature, we register the styleEvent listener once
			// and apply the style for all currently present features
			this._registerStyleEventListeners(olVectorSource, olVectorLayer, olMap);
			olVectorSource.getFeatures().forEach((feature) => {
				if (styleService.isStyleRequired(feature)) {
					styleService.addStyle(feature, olMap, olVectorLayer);
					this._updateStyle(feature, olVectorLayer, olMap);
				}
			});
		}

		return olVectorLayer;
	}

	/**
	 * Adds a specific or a default cluster styling for this vector layer
	 * @param {ol.layer.Vector} olVectorLayer
	 * @returns olVectorLayer
	 */
	_applyClusterStyle(olVectorLayer) {
		const { StyleService: styleService } = $injector.inject('StyleService');
		styleService.addClusterStyle(olVectorLayer);

		return olVectorLayer;
	}

	/**
	 * Builds an ol VectorLayer from an VectorGeoResource
	 * @param {string} id layerId
	 * @param {VectorGeoResource} vectorGeoResource
	 * @param {OlMap} olMap
	 * @returns olVectorLayer
	 */
	createVectorLayer(id, vectorGeoResource, olMap) {
		const { minZoom, maxZoom, opacity } = vectorGeoResource;
		const vectorLayer = new VectorLayer({
			id: id,
			geoResourceId: vectorGeoResource.id,
			opacity: opacity,
			minZoom: minZoom ?? undefined,
			maxZoom: maxZoom ?? undefined
		});
		const vectorSource = this._vectorSourceForData(vectorGeoResource);
		vectorLayer.setSource(vectorSource);
		return vectorGeoResource.isClustered() ? this._applyClusterStyle(vectorLayer) : this._applyStyles(vectorLayer, olMap);
	}

	/**
	 * Builds an ol VectorSource from an VectorGeoResource
	 * @param {VectorGeoResource} vectorGeoResource
	 * @param {ol.Map} map
	 * @returns olVectorSource
	 */
	_vectorSourceForData(geoResource) {
		const { MapService: mapService } = $injector.inject('MapService');

		const destinationSrid = mapService.getSrid();
		const vectorSource = new VectorSource();

		const data = geoResource.sourceType === VectorSourceType.EWKT ? parse(geoResource.data).wkt : geoResource.data;
		const format = mapVectorSourceTypeToFormat(geoResource.sourceType);
		const features = format
			.readFeatures(data)
			.filter((f) => !!f.getGeometry()) // filter out features without a geometry. Todo: let's inform the user
			.map((f) => {
				f.getGeometry().transform('EPSG:' + geoResource.srid, 'EPSG:' + destinationSrid); //Todo: check for unsupported destinationSrid
				return f;
			});
		vectorSource.addFeatures(features);

		/**
		 * If we know a name for the GeoResource now, we update the geoResource's label.
		 * At this moment an olLayer and its source are about to be added to the map.
		 * To avoid conflicts, we have to delay the update of the GeoResource (and subsequent possible modifications of the connected layer).
		 */
		if (!geoResource.hasLabel()) {
			switch (geoResource.sourceType) {
				case VectorSourceType.KML:
					setTimeout(() => {
						geoResource.setLabel(format.readName(data));
					});
					break;
			}
		}
		return geoResource.isClustered()
			? new Cluster({
					source: vectorSource,
					distance: geoResource.clusterParams.distance,
					minDistance: geoResource.clusterParams.minDistance
				})
			: vectorSource;
	}
}
