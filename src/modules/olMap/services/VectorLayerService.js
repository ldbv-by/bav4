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
import { getOriginAndPathname, getPathParams } from '../../../utils/urlUtils';
import { UnavailableGeoResourceError } from '../../../domain/errors';
import { isHttpUrl, isString } from '../../../utils/checks';
import { StyleHint } from '../../../domain/styles';
import { SourceTypeName } from '../../../domain/sourceType';

const getUrlService = () => {
	const { UrlService: urlService } = $injector.inject('UrlService');
	return urlService;
};

export const iconUrlFunction = (url) => getUrlService().proxifyInstant(url, false);

export const bvvIconUrlFunction = (url) => {
	if (isHttpUrl(url)) {
		const { UrlService: urlService, ConfigService: configService } = $injector.inject('UrlService', 'ConfigService');

		// legacy v3 backend icons should be mapped to v4
		if (getOriginAndPathname(url).startsWith('https://geoportal.bayern.de/ba-backend')) {
			const pathParams = getPathParams(url);
			// the legacy icon endpoint contains four path parameters
			if (pathParams.length === 4 && pathParams[1] === 'icons') {
				return `${configService.getValueAsPath('BACKEND_URL')}icons/${pathParams[pathParams.length - 2]}/${pathParams[pathParams.length - 1]}.png`;
			}
			// leave untouched for that case
			return url;
		} // icons from our backend do not need to be proxified
		else if (getOriginAndPathname(url).startsWith(configService.getValueAsPath('BACKEND_URL'))) {
			return url;
		}
		return urlService.proxifyInstant(url, false);
	}
	return url;
};

export const mapVectorSourceTypeToFormat = (geoResource) => {
	switch (geoResource.sourceType) {
		case VectorSourceType.KML:
			return new KML({ iconUrlFunction: bvvIconUrlFunction, showPointNames: geoResource.showPointNames });

		case VectorSourceType.GPX:
			return new GPX();

		case VectorSourceType.GEOJSON:
			return new GeoJSON();

		case VectorSourceType.EWKT:
			return new WKT();
	}
	throw new Error(geoResource?.sourceType + ' currently not supported');
};

export const mapSourceTypeToFormat = (sourceType, showPointNames = true) => {
	switch (sourceType.name) {
		case SourceTypeName.KML:
			return new KML({ iconUrlFunction: bvvIconUrlFunction, showPointNames });

		case SourceTypeName.GPX:
			return new GPX();

		case SourceTypeName.GEOJSON:
			return new GeoJSON();

		case SourceTypeName.EWKT:
			return new WKT();
	}
	throw new Error(sourceType?.name + ' currently not supported');
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
			top: active.filter(({ constraints: { hidden } }) => !hidden).pop()?.id === olLayer.get('id'),
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
		 * Changes in the list of layers, should have impact on style properties of the vectorLayer (e.g. related overlays),
		 * which are not tracked by OpenLayers
		 */
		const layerListChangedListenerKey = olMap.getLayers().on(['add', 'remove'], () => {
			olVectorSource.getFeatures().forEach((f) => this._updateStyle(f, olLayer, olMap));
		});

		/**
		 * Track layer changes of visibility, opacity and z-index
		 */
		const layerChangeListenerKey = olLayer.on(['change:zIndex', 'change:visible', 'change:opacity'], () => {
			olVectorSource.getFeatures().forEach((f) => this._updateStyle(f, olLayer, olMap));
		});

		return { addFeatureListenerKey, removeFeatureListenerKey, clearFeaturesListenerKey, layerChangeListenerKey, layerListChangedListenerKey };
	}

	_applyFeatureSpecificStyles(olVectorLayer, olMap) {
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
	 * Sanitizes the style of the present features of the vector layer.
	 * The sanitizing prepares features with incompatible styling for the rendering in the
	 * ol context.
	 * @param {ol.layer.Vector} olVectorLayer
	 */
	_sanitizeStyles(olVectorLayer) {
		const { StyleService: styleService } = $injector.inject('StyleService');
		const olVectorSource = olVectorLayer.getSource();
		olVectorSource.getFeatures().forEach((feature) => styleService.sanitizeStyle(feature));
	}

	/**
	 * Adds specific stylings (and overlays) for a vector layer.
	 * The effective styling is determined in the following order;
	 * 1. If the GeoResource is clustered we set the cluster style
	 * 2. If the GeoResource has a style hint we set its corresponding style
	 * 3. Otherwise we take the style information of the features
	 * @param {ol.layer.Vector} olVectorLayer
	 * @param {ol.Map} olMap
	 * @param {VectorGeoResource|RtVectorGeoResource} vectorGeoResource
	 * @returns {ol.layer.Vector}
	 */
	applyStyle(olVectorLayer, olMap, vectorGeoResource) {
		const { StyleService: styleService } = $injector.inject('StyleService');
		this._sanitizeStyles(olVectorLayer);
		if (vectorGeoResource.isClustered()) {
			return styleService.applyStyleHint(StyleHint.CLUSTER, olVectorLayer);
		} else if (vectorGeoResource.hasStyleHint()) {
			return styleService.applyStyleHint(vectorGeoResource.styleHint, olVectorLayer);
		}
		return this._applyFeatureSpecificStyles(olVectorLayer, olMap);
	}

	/**
	 * Builds an ol VectorLayer from an VectorGeoResource
	 * @param {string} id layerId
	 * @param {VectorGeoResource|VTGeoResource} vectorGeoResource
	 * @param {OlMap} olMap
	 * @throws UnavailableGeoResourceError
	 * @returns olVectorLayer
	 */
	createLayer(id, vectorGeoResource, olMap) {
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

		return this.applyStyle(vectorLayer, olMap, vectorGeoResource);
	}

	/**
	 * Builds an ol VectorSource from an VectorGeoResource
	 * @param {VectorGeoResource} geoResource
	 * @returns olVectorSource
	 */
	_vectorSourceForData(geoResource) {
		try {
			const { MapService: mapService } = $injector.inject('MapService');

			const destinationSrid = mapService.getSrid();
			const vectorSource = new VectorSource();

			const prepareFeatures = (olFormat, data, sourceSrid) => {
				return olFormat
					.readFeatures(data)
					.filter((f) => !!f.getGeometry()) // filter out features without a geometry. Todo: let's inform the user
					.map((f) => {
						// avoid ol displaying only one feature if ids are an empty string
						if (isString(f.getId()) && f.getId().trim() === '') {
							f.setId(undefined);
						}
						f.set('showPointNames', geoResource.showPointNames);
						f.getGeometry().transform('EPSG:' + sourceSrid, 'EPSG:' + destinationSrid); //Todo: check for unsupported destinationSrid
						return f;
					});
			};

			if (!geoResource.hasFeatures()) {
				const data = geoResource.sourceType === VectorSourceType.EWKT ? parse(geoResource.data).wkt : geoResource.data;
				const olFormat = mapVectorSourceTypeToFormat(geoResource);
				vectorSource.addFeatures(prepareFeatures(olFormat, data, geoResource.srid));

				/**
				 * If we know a name for the GeoResource now, we update the geoResource's label.
				 * At this moment an olLayer and its source are about to be added to the map.
				 * To avoid conflicts, we have to delay the update of the GeoResource (and subsequent possible modifications of the connected layer).
				 */
				if (!geoResource.hasLabel()) {
					switch (geoResource.sourceType) {
						case VectorSourceType.KML:
							setTimeout(() => {
								geoResource.setLabel(olFormat.readName(data));
							});
							break;
					}
				}
			} else {
				geoResource.features.forEach((baFeature) => {
					const data = baFeature.geometry.sourceType.name === SourceTypeName.EWKT ? parse(baFeature.geometry.data).wkt : baFeature.geometry.data;
					const olFeatures = prepareFeatures(
						mapSourceTypeToFormat(baFeature.geometry.sourceType, geoResource.showPointNames),
						data,
						baFeature.geometry.sourceType.srid
					);
					if (olFeatures.length === 1) {
						olFeatures[0].setId(baFeature.id);
						olFeatures[0].set('styleHint', baFeature.styleHint ?? null);
						for (const [key, value] of Object.entries(baFeature.getProperties())) {
							olFeatures[0].set(key, value);
						}
					}
					vectorSource.addFeatures(olFeatures);
				});
			}
			return geoResource.isClustered()
				? new Cluster({
						source: vectorSource,
						distance: geoResource.clusterParams.distance,
						minDistance: geoResource.clusterParams.minDistance
					})
				: vectorSource;
		} catch (error) {
			throw new UnavailableGeoResourceError(`Data of VectorGeoResource could not be parsed`, geoResource.id, null, { cause: error });
		}
	}
}
