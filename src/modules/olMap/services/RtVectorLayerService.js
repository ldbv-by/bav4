/**
 * @module modules/olMap/services/RtVectorLayerService
 */
import VectorLayer from '../../../../node_modules/ol/layer/Vector';
import VectorSource from '../../../../node_modules/ol/source/Vector';
import { UnavailableGeoResourceError } from '../../../domain/errors';
import { $injector } from '../../../injection/index';
import { mapVectorSourceTypeToFormat } from './VectorLayerService';

export const WebSocket_Message_Keep_Alive = 'keep-alive';
export const WebSocket_Ports = [80, 443];

export const isNextPortAvailable = (port, ports) => (ports ? ports.indexOf(port) < ports.length - 1 : false);
export const getNextPort = (ports, current = 80) => {
	const nextPort = ports[ports.indexOf(current) + 1];
	return nextPort === 80 ? undefined : nextPort;
};
/**
 * Service that creates an ol VectorLayer from a RtVectorGeoResource (Websocket)
 * and applies specific stylings if required.
 * @class
 * @author thiloSchlemmer
 */
export class RtVectorLayerService {
	_addPortToUrl(url, port) {
		const pathArray = url.split('.');
		const applyOnLastElement = (pathElements, port) => {
			const lastElement = pathElements[pathElements.length - 1];
			if (lastElement.indexOf('/') !== -1) {
				const lastElementSegments = lastElement.split('/');
				lastElementSegments[0] = lastElementSegments[0] + ':' + port;
				return lastElementSegments.join('/');
			} else {
				return pathArray[pathArray.length - 1] + ':' + port;
			}
		};
		pathArray[pathArray.length - 1] = applyOnLastElement(pathArray, port);
		return pathArray.join('.');
	}

	/**
	 * Sanitizes the style of the present features of the vector layer.
	 * The sanitizing prepares features with incompatible styling for the rendering in the
	 * ol context.
	 *
	 * TODO: resolve duplication from VectorLayerService
	 * @param {ol.layer.Vector} olVectorLayer
	 */
	_sanitizeStyles(olVectorLayer) {
		const { StyleService: styleService } = $injector.inject('StyleService');
		const olVectorSource = olVectorLayer.getSource();
		olVectorSource.getFeatures().forEach((feature) => styleService.sanitizeStyle(feature));
	}

	// TODO: resolve duplication from VectorLayerService
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

	//TODO: resolve duplication from VectorLayerService
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
	 *
	 * TODO: resolve duplication from VectorLayerService
	 * @param {ol.layer.Vector} olVectorLayer
	 * @param {ol.Map} olMap
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
	}

	_getFeatureReader(rtVectorGeoResource) {
		const { MapService: mapService } = $injector.inject('MapService');
		const destinationSrid = mapService.getSrid();

		// TODO: resolve/ check usage of VectorLayerService.mapVectorSourceTypeToFormat
		const format = mapVectorSourceTypeToFormat(rtVectorGeoResource.sourceType);
		return (data) =>
			format
				.readFeatures(data)
				.filter((f) => !!f.getGeometry())
				.map((f) => {
					f.getGeometry().transform('EPSG:' + rtVectorGeoResource.srid, 'EPSG:' + destinationSrid);
					return f;
				});
	}

	/**
	 * processes the messages from a websocket and updates the specified olVectorSource
	 *
	 * TODO: check, if behavior for changed featureExtent is needed
	 * @param {MessageEvent} socketEvent
	 * @param {ol.source.Vector} olVectorSource
	 * @param {function (string): Array<ol.Feature>} featureReader
	 */
	_processMessage(socketEvent, olVectorSource, featureReader) {
		const { data } = socketEvent;
		if (data === WebSocket_Message_Keep_Alive) {
			return;
		}

		olVectorSource.clear();
		const features = featureReader(data);
		olVectorSource.addFeatures(features);
	}

	_startWebSocket(rtVectorGeoResource, olVectorLayer, olMap, port) {
		const featureReader = this._getFeatureReader(rtVectorGeoResource);
		const olVectorSource = olVectorLayer.getSource();
		const webSocket = new WebSocket(port ? this._addPortToUrl(rtVectorGeoResource.url) : rtVectorGeoResource.url);

		webSocket.onmessage = (event) => {
			this._processMessage(event, olVectorSource, featureReader);
			this._sanitizeStyles(olVectorLayer);
			this._applyStyles(olVectorLayer, olMap);
		};

		const tryNextPort = (port = 80) => {
			webSocket.onmessage = undefined;
			this._startWebSocket(rtVectorGeoResource, olVectorLayer, olMap, getNextPort(WebSocket_Ports, port));
		};

		const failure = () => {
			throw new UnavailableGeoResourceError('Realtime-data cannot be displayed for technical reasons.', rtVectorGeoResource.id);
		};

		webSocket.onclose = (event) => {
			if (event.code === 1006) {
				// cascading ports in case of a connection failure
				const eventAction = isNextPortAvailable(port ?? 80, WebSocket_Ports) ? () => tryNextPort(port) : failure;
				eventAction();
			}
		};
	}

	/**
	 * Builds an ol VectorLayer from an VectorGeoResource
	 * @param {string} id layerId
	 * @param {RtVectorGeoResource} rtVectorGeoResource
	 * @param {OlMap} olMap
	 * @returns olVectorLayer
	 */
	createVectorLayer(id, rtVectorGeoResource, olMap) {
		const { minZoom, maxZoom, opacity } = rtVectorGeoResource;

		const vectorLayer = new VectorLayer({
			id: id,
			geoResourceId: rtVectorGeoResource.id,
			opacity: opacity,
			minZoom: minZoom ?? undefined,
			maxZoom: maxZoom ?? undefined
		});
		const vectorSource = new VectorSource();
		vectorLayer.setSource(vectorSource);

		this._startWebSocket(rtVectorGeoResource, vectorLayer, olMap);

		// HINT: currently is no support for clustered realtime vector data needed or planned for future releases
		return vectorLayer;
	}
}
