/**
 * @module modules/olMap/services/RtVectorLayerService
 */
import VectorLayer from '../../../../node_modules/ol/layer/Vector';
import VectorSource from '../../../../node_modules/ol/source/Vector';
import { UnavailableGeoResourceError } from '../../../domain/errors';
import { VectorSourceType } from '../../../domain/geoResources';
import { $injector } from '../../../injection/index';
import { mapVectorSourceTypeToFormat } from './VectorLayerService';
import { parse } from '../../../utils/ewkt';
import { changeCenter, fit } from '../../../store/position/position.action';
import { containsExtent, getCenter } from '../../../../node_modules/ol/extent';
import { observe } from '../../../utils/storeUtils';

export const WebSocket_Message_Keep_Alive = 'keep-alive';
export const WebSocket_Ports = [80, 443];

export const WebSocket_Layer_Property = 'websocket';

/**
 * Checks, whether a successor port is in the specified array of unique ports available or not.
 * @param {Array<number>} ports
 * @param {number} predecessorPort
 * @returns {boolean}
 */
export const isNextPortAvailable = (ports, predecessorPort) => (ports ? ports.indexOf(predecessorPort) < ports.length - 1 : false);

/**
 * Returns the next port from the specified array of unique ports.
 * @param {Array<number>} ports
 * @param {number} current
 * @returns {number}
 */
export const getNextPort = (ports, current = 80) => {
	const nextPort = ports[ports.indexOf(current) + 1];
	return nextPort === 80 ? undefined : nextPort;
};

/**
 * Service that creates an ol layer from a {@link RtVectorGeoResource} (Websocket)
 * and applies specific stylings if required.
 * @class
 * @author thiloSchlemmer
 */
export class RtVectorLayerService {
	_addPortToUrl(url, port) {
		// todo: possible refactoring to a general network util method (UrlService)
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

	_getFeatureReader(rtVectorGeoResource) {
		const { MapService: mapService } = $injector.inject('MapService');
		const destinationSrid = mapService.getSrid();

		const format = mapVectorSourceTypeToFormat(rtVectorGeoResource.sourceType);

		/**
		 * Only eWKT needs a 'per-data'-check for the srid. All other (currently) supported
		 * formats have 4326 as srid per definition
		 */
		return rtVectorGeoResource.sourceType === VectorSourceType.EWKT
			? (data) => {
					const eWkt = parse(data);
					return format
						.readFeatures(eWkt.wkt)
						.filter((f) => !!f.getGeometry())
						.map((f) => {
							f.getGeometry().transform('EPSG:' + eWkt.srid, 'EPSG:' + destinationSrid);
							return f;
						});
				}
			: (data) => {
					return format
						.readFeatures(data)
						.filter((f) => !!f.getGeometry())
						.map((f) => {
							f.getGeometry().transform('EPSG:4326', 'EPSG:' + destinationSrid);
							return f;
						});
				};
	}

	_processMessage(messageData, olVectorLayer, featureReader) {
		const olVectorSource = olVectorLayer.getSource();
		olVectorSource.clear();
		const features = featureReader(messageData);
		olVectorSource.addFeatures(features);
	}

	_centerViewOptionally(olVectorLayer, olMap, useFit) {
		const olVectorSource = olVectorLayer.getSource();
		const mapExtent = olMap.getView().calculateExtent();
		const vectorExtent = olVectorSource.getExtent();

		const action = useFit ? fit : (extent) => changeCenter(getCenter(extent));

		/**
		 * No need to do anything, when the content is visible inside the mapExtent.
		 * Because, we cannot decide, whether the current zoom level and centering is affordable
		 * for the specific use case of the user or not.
		 */
		if (!containsExtent(mapExtent, vectorExtent)) {
			action(vectorExtent);
		}
	}

	_startWebSocket(rtVectorGeoResource, olVectorLayer, olMap, port) {
		const { VectorLayerService: vectorLayerService } = $injector.inject('VectorLayerService');

		const featureReader = this._getFeatureReader(rtVectorGeoResource);

		const webSocket = new WebSocket(port ? this._addPortToUrl(rtVectorGeoResource.url, port) : rtVectorGeoResource.url);
		olVectorLayer.set(WebSocket_Layer_Property, webSocket);
		const isUpdateNeeded = (data) => data !== WebSocket_Message_Keep_Alive;

		let useFit = true;
		webSocket.onmessage = (event) => {
			const { data: messageData } = event;
			if (isUpdateNeeded(messageData)) {
				this._processMessage(messageData, olVectorLayer, featureReader);

				vectorLayerService.sanitizeStyles(olVectorLayer);
				if (rtVectorGeoResource.isClustered()) {
					vectorLayerService.applyClusterStyle(olVectorLayer);
				} else {
					vectorLayerService.applyStyles(olVectorLayer, olMap);
				}

				/**
				 * We use the fit only with the first call, to leave the control over the zoom level by the user
				 * and to help the user in the special case, that the data of the layer is outside the view, at the beginning.
				 */
				this._centerViewOptionally(olVectorLayer, olMap, useFit);
				useFit = false;
			}
		};

		const nextPortCallback = (nextPort) => {
			webSocket.onmessage = undefined;
			olVectorLayer.unset(WebSocket_Layer_Property);
			this._startWebSocket(rtVectorGeoResource, olVectorLayer, olMap, nextPort);
		};

		webSocket.onclose = (event) => {
			if (event.code === 1006) {
				this._cascadingPorts(port, nextPortCallback, rtVectorGeoResource.id);
			}
		};
	}

	_closeWebSocket(olVectorLayer) {
		const websocket = olVectorLayer.get(WebSocket_Layer_Property);

		const vectorSource = olVectorLayer.getSource();
		vectorSource.clear();
		websocket.close();
		olVectorLayer.unset(WebSocket_Layer_Property);
	}

	_cascadingPorts(failedPort, nextPortCallback, geoResourceId) {
		/**
		 * Cascading ports in case of a connection failure.
		 * Whether a next port is available, the nextPortCallback is called, otherwise a
		 * UnavailableGeoResourceError is thrown.
		 */
		const tryNextPort = () => {
			nextPortCallback(getNextPort(WebSocket_Ports, failedPort));
		};

		const failure = () => {
			throw new UnavailableGeoResourceError('Realtime-data cannot be displayed for technical reasons.', geoResourceId);
		};

		const eventAction = isNextPortAvailable(WebSocket_Ports, failedPort ?? 80) ? tryNextPort : failure;
		eventAction();
	}

	/**
	 * Builds an ol VectorLayer from a {@link RtVectorGeoResource}
	 * @param {string} id layerId
	 * @param {RtVectorGeoResource} rtVectorGeoResource the geoResource
	 * @param {ol.map} olMap the map
	 * @throws UnavailableGeoResourceError
	 * @returns {ol.layer} the vectorLayer
	 */
	createLayer(id, rtVectorGeoResource, olMap) {
		const { StoreService: storeService } = $injector.inject('StoreService');
		const { minZoom, maxZoom, opacity } = rtVectorGeoResource;

		const vectorLayer = new VectorLayer({
			id: id,
			opacity: opacity,
			minZoom: minZoom ?? undefined,
			maxZoom: maxZoom ?? undefined
		});

		const getLayerStoreProperties = (activeLayers, layerId) => activeLayers.find((l) => l.id === layerId);

		const onActiveChange = (active) => {
			const layer = getLayerStoreProperties(active, id);

			const getChangedVisibilityAction = (layer) => {
				if (layer.visible && !vectorLayer.get(WebSocket_Layer_Property)) {
					return () => this._startWebSocket(rtVectorGeoResource, vectorLayer, olMap);
				}

				if (!layer.visible && vectorLayer.get(WebSocket_Layer_Property)) {
					return () => this._closeWebSocket(vectorLayer);
				}

				return () => {};
			};

			const removeAction = () => {
				this._closeWebSocket(vectorLayer);
				unsubscribeFn();
			};

			const getChangeAction = (layer) => {
				return layer ? getChangedVisibilityAction(layer) : removeAction;
			};

			const changeAction = getChangeAction(layer);

			changeAction();
		};

		const unsubscribeFn = observe(storeService.getStore(), (store) => store.layers.active, onActiveChange);
		const vectorSource = new VectorSource();
		vectorLayer.setSource(vectorSource);

		const layerProperties = getLayerStoreProperties(storeService.getStore().getState().layers.active, id);
		if (layerProperties?.visible) {
			this._startWebSocket(rtVectorGeoResource, vectorLayer, olMap);
		}

		return vectorLayer;
	}
}
