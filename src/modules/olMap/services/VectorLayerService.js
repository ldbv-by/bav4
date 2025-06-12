/**
 * @module modules/olMap/services/VectorLayerService
 */
import { GeoResourceAuthenticationType, VectorGeoResource, VectorSourceType } from '../../../domain/geoResources';
import VectorSource from 'ol/source/Vector';
import { $injector } from '../../../injection';
import { KML, GPX, GeoJSON, WKT } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import { parse } from '../../../utils/ewkt';
import { Cluster } from 'ol/source';
import { getOriginAndPathname, getPathParams } from '../../../utils/urlUtils';
import { UnavailableGeoResourceError } from '../../../domain/errors';
import { isHttpUrl, isString } from '../../../utils/checks';
import { SourceTypeName } from '../../../domain/sourceType';
import { bbox } from 'ol/loadingstrategy.js';
import { getBvvOafLoadFunction } from '../utils/olLoadFunction.provider';
import { unByKey } from '../../../../node_modules/ol/Observable';
import { asInternalProperty } from '../../../utils/propertyUtils';

/**
 * A function that returns a `ol.featureloader.FeatureLoader` for OGC API Features service.
 * @typedef {Function} oafLoadFunctionProvider
 * @param {string} geoResourceId The id of the corresponding GeoResource
 * @param {ol.layer.Layer} olLayer The the corresponding ol layer
 * @param {module:domain/credentialDef~Credential|null} [credential] The credential for basic access authentication (when BAA is requested) or `null` or `undefined`
 * @returns {Function} ol.featureloader.FeatureLoader
 */

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
	#baaCredentialService;
	constructor(oafLoadFunctionProvider = getBvvOafLoadFunction) {
		this._oafLoadFunctionProvider = oafLoadFunctionProvider;

		const { BaaCredentialService: baaCredentialService } = $injector.inject('BaaCredentialService');
		this.#baaCredentialService = baaCredentialService;
	}

	/**
	 * Builds an ol VectorLayer from an VectorGeoResource
	 * @param {string} id layerId
	 * @param {VectorGeoResource|OafGeoResource} vectorGeoResource
	 * @param {OlMap} olMap
	 * @throws UnavailableGeoResourceError
	 * @returns olVectorLayer
	 */
	createLayer(id, vectorGeoResource, olMap) {
		const { StyleService: styleService } = $injector.inject('StyleService');
		const { minZoom, maxZoom, opacity } = vectorGeoResource;
		const vectorLayer = new VectorLayer({
			id: id,
			geoResourceId: vectorGeoResource.id,
			opacity: opacity,
			minZoom: minZoom ?? undefined,
			maxZoom: maxZoom ?? undefined
		});
		const vectorSource =
			vectorGeoResource instanceof VectorGeoResource
				? this._vectorSourceForData(vectorGeoResource)
				: this._vectorSourceForOaf(vectorGeoResource, vectorLayer, olMap);

		/**
		 * Features that are added later must also be styled
		 */
		vectorSource.on('featuresloadend', () => {
			styleService.applyStyle(vectorLayer, olMap, vectorGeoResource);
		});
		vectorLayer.setSource(vectorSource);

		vectorLayer.on('propertychange', (event) => {
			const property = event.key;
			if (property === 'style' && vectorLayer.get('style') !== event.oldValue) {
				styleService.applyStyle(vectorLayer, olMap, vectorGeoResource);
			}
		});

		return styleService.applyStyle(vectorLayer, olMap, vectorGeoResource);
	}

	/**
	 * Builds an ol.VectorSource from a OafGeoResource
	 * @param {OafGeoResource} geoResource
	 * @param {ol.layer.Vector} olVectorLayer
	 * @returns olVectorSource
	 */
	_vectorSourceForOaf(geoResource, olVectorLayer, olMap) {
		const vs = new VectorSource({
			strategy: bbox
		});
		switch (geoResource.authenticationType) {
			case GeoResourceAuthenticationType.BAA: {
				const credential = this.#baaCredentialService.get(geoResource.url);
				vs.setLoader(this._oafLoadFunctionProvider(geoResource.id, olVectorLayer, credential));
				break;
			}
			default: {
				vs.setLoader(this._oafLoadFunctionProvider(geoResource.id, olVectorLayer));
			}
		}

		olVectorLayer.on('propertychange', (event) => {
			const property = event.key;
			if (property === 'filter' && olVectorLayer.get('filter') !== event.oldValue) {
				vs.refresh();
			}
		});

		/**
		 * The bbox strategy prevents the loading of an extent that lies within the previously loaded extent when a higher resolution is requested.
		 * If not all possible features have been loaded yet, a reload of the features is forced.
		 */
		const key = olMap.getView().on('change:resolution', () => {
			if (olMap.getLayers().getArray().includes(olVectorLayer)) {
				if (vs.get('incomplete_data')) {
					vs.refresh();
				}
			} else {
				this._unregisterOlListener(key);
			}
		});

		return vs;
	}

	_unregisterOlListener(key) {
		unByKey(key);
	}

	/**
	 * Builds an ol.VectorSource from a VectorGeoResource
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
						f.set(asInternalProperty('showPointNames'), geoResource.showPointNames);
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
						olFeatures[0].set('style', baFeature.style ?? null);
						for (const [key, value] of Object.entries(baFeature.getProperties())) {
							olFeatures[0].set(key, value);
						}
					}
					vectorSource.addFeatures(olFeatures);
				});
			}
			return geoResource.isClustered?.()
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
