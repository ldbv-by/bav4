/**
 * @module modules/olMap/services/RtVectorLayerService
 */
import VectorLayer from '../../../../node_modules/ol/layer/Vector';
import VectorSource from '../../../../node_modules/ol/source/Vector';
import { UnavailableGeoResourceError } from '../../../domain/errors';
import { VectorSourceType } from '../../../domain/geoResources';
import { SourceTypeResultStatus } from '../../../domain/sourceType';
import { $injector } from '../../../injection/index';
import { mapVectorSourceTypeToFormat } from './VectorLayerService';
import { parse } from '../../../utils/ewkt';

export const WebSocket_Message_Keep_Alive = 'keep-alive';
export const WebSocket_Ports = [80, 443];

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
 * Service that creates an ol layer from a RtVectorGeoResource (Websocket)
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

	_getFeatureReader(rtVectorGeoResource) {
		const { MapService: mapService } = $injector.inject('MapService');
		const destinationSrid = mapService.getSrid();

		const format = mapVectorSourceTypeToFormat(rtVectorGeoResource.sourceType);

		// only eWKT needs a 'per-data'-check for the srid. All other (currently) supported
		// formats have 4326 as srid per definition
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

	/**
	 * Processes the messages from a websocket and updates the specified olVectorSource
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
		const { VectorLayerService: vectorLayerService } = $injector.inject('VectorLayerService');
		const featureReader = this._getFeatureReader(rtVectorGeoResource);
		const olVectorSource = olVectorLayer.getSource();
		const webSocket = new WebSocket(port ? this._addPortToUrl(rtVectorGeoResource.url) : rtVectorGeoResource.url);

		webSocket.onmessage = (event) => {
			this._processMessage(event, olVectorSource, featureReader);
			vectorLayerService.sanitizeStyles(olVectorLayer);
			if (rtVectorGeoResource.isClustered()) {
				vectorLayerService.applyClusterStyle(olVectorLayer);
			} else {
				vectorLayerService.applyStyles(olVectorLayer, olMap);
			}
		};

		const nextPortCallback = (nextPort) => {
			webSocket.onmessage = undefined;
			this._startWebSocket(rtVectorGeoResource, olVectorLayer, olMap, nextPort);
		};

		webSocket.onclose = (event) => {
			if (event.code === 1006) {
				this._cascadingPorts(port, nextPortCallback, rtVectorGeoResource.id);
			}
		};
	}

	/**
	 * Cascading ports in case of a connection failure.
	 * Whether a next port is available, the nextPortCallback is called, otherwise a
	 * UnavailableGeoResourceError is thrown.
	 * @param {*} failedPort
	 * @param {*} nextPortCallback
	 * @param {*} geoResourceId
	 */
	_cascadingPorts(failedPort, nextPortCallback, geoResourceId) {
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
	 * Builds an ol VectorLayer from an VectorGeoResource
	 * @param {string} id layerId
	 * @param {RtVectorGeoResource} rtVectorGeoResource
	 * @param {OlMap} olMap
	 * @returns olVectorLayer
	 */
	createLayer(id, rtVectorGeoResource, olMap) {
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

		return vectorLayer;
	}
}
