/**
 * @module plugins/PublicWebComponentPlugin
 */
import { HighlightFeatureType } from '../domain/highlightFeature';
import { QueryParameters } from '../domain/queryParameters';
import { SourceType, SourceTypeName } from '../domain/sourceType';
import { WcEvents, WcMessageKeys } from '../domain/webComponent';
import { $injector } from '../injection/index';
import { abortOrReset } from '../store/featureInfo/featureInfo.action';
import { setAdminAndFileId } from '../store/fileStorage/fileStorage.action';
import { addHighlightFeatures, removeHighlightFeaturesByCategory, removeHighlightFeaturesById } from '../store/highlight/highlight.action';
import { addLayer, modifyLayer, removeLayer } from '../store/layers/layers.action';
import {
	changeCenter,
	changeCenterAndRotation,
	changeRotation,
	changeZoom,
	changeZoomAndCenter,
	changeZoomAndRotation,
	changeZoomCenterAndRotation,
	fit,
	fitLayer
} from '../store/position/position.action';
import { isCoordinate, isNumber } from '../utils/checks';
import { fromString, isWGS84Coordinate } from '../utils/coordinateUtils';
import { equals, observe } from '../utils/storeUtils';
import { debounced } from '../utils/timer';
import { BaPlugin } from './BaPlugin';

const WcUserMarkerCategory = 'WcUserMarker';

/**
 *
 *  This Plugin is the counterpart to the {@link PublicWebComponent}.
 *
 * - receives messages from the PublicWebComponent
 * - publishes dedicated s-o-s mutations to the PublicWebComponent
 *
 * @class
 * @author taulinger
 */
export class PublicWebComponentPlugin extends BaPlugin {
	#environmentService;
	#exportVectorDataService;
	#coordinateService;
	#mapService;
	#importVectorDataService;
	#fileStorageService;
	/**
	 * Serves as cache for values computed from the specific s-o-s
	 */
	#values = new Map();

	constructor() {
		super();
		const {
			EnvironmentService: environmentService,
			ExportVectorDataService: exportVectorDataService,
			CoordinateService: coordinateService,
			MapService: mapService,
			ImportVectorDataService: importVectorDataService,
			FileStorageService: fileStorageService
		} = $injector.inject(
			'EnvironmentService',
			'ExportVectorDataService',
			'CoordinateService',
			'MapService',
			'ImportVectorDataService',
			'FileStorageService'
		);
		this.#environmentService = environmentService;
		this.#exportVectorDataService = exportVectorDataService;
		this.#coordinateService = coordinateService;
		this.#mapService = mapService;
		this.#importVectorDataService = importVectorDataService;
		this.#fileStorageService = fileStorageService;
	}

	_getIframeId() {
		return this.#environmentService.getWindow().name;
	}

	_broadcast(payload, silent = false) {
		this.#environmentService.getWindow().parent.postMessage({ target: this._getIframeId(), v: '1', ...payload, silent }, '*');
	}

	/**
	 * @override
	 */
	async register(store) {
		if (this.#environmentService.isEmbeddedAsWC()) {
			const onReceive = async (event) => {
				switch (event.data.v) {
					case '1': {
						if (event.data.source === this._getIframeId()) {
							for (const property in event.data) {
								switch (property) {
									case WcMessageKeys.ADD_LAYER: {
										const {
											id,
											geoResourceIdOrData,
											options: { displayFeatureLabels = null, zoomToExtent, modifiable, ...otherOptions }
										} = event.data[property];
										const geoResourceId = modifiable ? `a_${id}` : id;
										const vgr = this.#importVectorDataService.forData(geoResourceIdOrData, { id: geoResourceId });
										const constraints = { displayFeatureLabels };
										if (vgr) {
											addLayer(id, { ...otherOptions, geoResourceId: vgr.id, constraints });
											if (modifiable) {
												const fileId = await this.#fileStorageService.getFileId(geoResourceId);
												setAdminAndFileId(geoResourceId, fileId);
											}
										} else {
											addLayer(id, { ...otherOptions, geoResourceId: geoResourceIdOrData, constraints });
										}
										if (zoomToExtent) {
											fitLayer(id);
										}
										break;
									}
									case WcMessageKeys.MODIFY_LAYER: {
										const { id, options } = event.data[property];
										modifyLayer(id, options);
										break;
									}
									case WcMessageKeys.REMOVE_LAYER: {
										const { id } = event.data[property];
										removeLayer(id);
										break;
									}
									case WcMessageKeys.MODIFY_VIEW: {
										const { zoom, center: originalCenter, rotation } = event.data[property];
										const center = isCoordinate(originalCenter)
											? this.#coordinateService.transform(originalCenter, this._detectSrid(originalCenter), this.#mapService.getSrid())
											: originalCenter;

										if (isNumber(zoom) && isCoordinate(center) && isNumber(rotation)) {
											changeZoomCenterAndRotation({ zoom, center, rotation });
										} else if (isNumber(zoom) && isCoordinate(center)) {
											changeZoomAndCenter({ zoom, center });
										} else if (isNumber(zoom) && isNumber(rotation)) {
											changeZoomAndRotation({ zoom, rotation });
										} else if (isCoordinate(center) && isNumber(rotation)) {
											changeCenterAndRotation({ center, rotation });
										} else if (isNumber(zoom)) {
											changeZoom(zoom);
										} else if (isCoordinate(center)) {
											changeCenter(center);
										} else if (isNumber(rotation)) {
											changeRotation(rotation);
										}
										break;
									}
									case WcMessageKeys.ZOOM_TO_EXTENT: {
										const { extent } = event.data[property];
										const transformedExtent = this.#coordinateService.transformExtent(
											extent,
											this._detectSrid(extent.slice(0, 2)),
											this.#mapService.getSrid()
										);
										fit(transformedExtent);
										break;
									}
									case WcMessageKeys.ZOOM_TO_LAYER_EXTENT: {
										const { id } = event.data[property];
										fitLayer(id);
										break;
									}
									case WcMessageKeys.ADD_MARKER: {
										const {
											coordinate,
											options: { id, label = null }
										} = event.data[property];

										const transformedCoordinate = this.#coordinateService.transform(
											coordinate,
											this._detectSrid(coordinate),
											this.#mapService.getSrid()
										);
										addHighlightFeatures({
											type: HighlightFeatureType.MARKER,
											data: transformedCoordinate,
											label,
											id,
											category: WcUserMarkerCategory
										});
										break;
									}
									case WcMessageKeys.REMOVE_MARKER: {
										const { id } = event.data[property];
										removeHighlightFeaturesById(id);
										break;
									}
									case WcMessageKeys.CLEAR_MARKERS: {
										removeHighlightFeaturesByCategory(WcUserMarkerCategory);
										break;
									}
									case WcMessageKeys.CLEAR_HIGHLIGHTS: {
										abortOrReset();
										break;
									}
								}
							}
						}
						break;
					}
					default:
						console.error(`Version ${event.data.v} is not supported`);
				}
			};

			this.#environmentService.getWindow().addEventListener('message', onReceive);

			const onStoreChanged = (key, newValue) => {
				// console.log(`onStoreChanged: ${key} -> ${JSON.stringify(newValue)}`);
				const payload = {};
				const oldValue = this.#values.get(key);
				// we only broadcast changes if the value really changed
				if (!equals(oldValue, newValue)) {
					this.#values.set(key, newValue);
					payload[key] = newValue;
					this._broadcast(payload, oldValue === undefined);
				}
			};

			/**
			 * "Default" store changes
			 */
			observe(
				store,
				(state) => state.position.center,
				(center) =>
					onStoreChanged(
						QueryParameters.CENTER,
						this.#coordinateService.transform(center, this.#mapService.getSrid(), this._getSridFromCenterCoordinate())
					),
				false
			);
			observe(
				store,
				(state) => state.position.zoom,
				(zoom) => onStoreChanged(QueryParameters.ZOOM, zoom),
				false
			);
			observe(
				store,
				(state) => state.position.rotation,
				(rotation) => onStoreChanged(QueryParameters.ROTATION, rotation),
				false
			);
			observe(
				store,
				(state) => state.layers.active,
				(active) =>
					onStoreChanged(
						QueryParameters.LAYER,
						active.filter((l) => !l.constraints.hidden).map((l) => l.id)
					),
				false
			);
			observe(
				store,
				(state) => state.layers.ready,
				(ready) => {
					if (ready) {
						const payload = {};
						payload[WcEvents.LOAD] = ready;
						setTimeout(() => {
							this._broadcast(payload);
						}, PublicWebComponentPlugin.ON_LOAD_EVENT_DELAY_MS /** save to work with the map now */);
					}
				},
				false
			);

			/**
			 * FeatureInfo/FeatureSelection
			 */
			observe(
				store,
				(state) => state.featureInfo.coordinate,
				() => {
					const unsubscribe = observe(
						store,
						(state) => state.featureInfo.querying,
						(querying, state) => {
							// untestable else path cause function is self-removing
							/* istanbul ignore else */
							if (!querying) {
								const transform = (featureInfo) => {
									/**
									 * We map the internal FeatureInfo to the FeatureInfo fired by the FEATURE_SELECT event
									 */
									const {
										geometry: { data: originalData },
										properties = {}
									} = featureInfo;

									const type = this._getGeomTypeFromConfiguration();
									const srid = this._getSridFromConfiguration();
									const data = this.#exportVectorDataService.forData(originalData, new SourceType(type, null, srid));
									return { data, srid, type, properties };
								};

								const items = [...state.featureInfo.current]
									.filter((featureInfo) => featureInfo.geometry)
									.map((featureInfo) => {
										const { data, srid, type, properties } = transform(featureInfo);
										return {
											label: featureInfo.title,
											properties,
											geometry: {
												type,
												srid,
												data
											}
										};
									});
								const payload = {};
								const transformedCoordinate = this.#coordinateService.transform(
									[...state.featureInfo.coordinate.payload],
									this.#mapService.getSrid(),
									this._getSridFromConfiguration()
								);
								payload[WcEvents.FEATURE_SELECT] = { features: [...items], coordinate: transformedCoordinate };
								this._broadcast(payload);
								unsubscribe();
							}
						}
					);
				}
			);

			/**
			 * Publish public GEOMETRY_CHANGE event
			 */
			const debouncedGeometryChangeBroadcast = debounced(PublicWebComponentPlugin.GEOMETRY_CHANGE_EVENT_DEBOUNCE_DELAY_MS, (payload) => {
				this._broadcast(payload);
			});
			observe(
				store,
				(state) => state.fileStorage.data,
				(data) => {
					const transform = (originalData) => {
						const type = this._getGeomTypeFromConfiguration();
						const srid = this._getSridFromConfiguration();
						const data = this.#exportVectorDataService.forData(originalData, new SourceType(type, null, srid));
						return { data, srid, type };
					};
					const payload = {};
					payload[WcEvents.GEOMETRY_CHANGE] = transform(data);

					debouncedGeometryChangeBroadcast(payload);
				}
			);
		}
	}

	_getSridFromConfiguration() {
		const sridValue = parseInt(new URLSearchParams(this.#environmentService.getWindow().location.href).get(QueryParameters.EC_SRID));
		return isNumber(sridValue) ? sridValue : /** Default SRID for export */ 4326;
	}

	_getSridFromCenterCoordinate() {
		const coordinate = fromString(new URLSearchParams(this.#environmentService.getWindow().location.href).get(QueryParameters.CENTER));
		return this._detectSrid(coordinate);
	}

	_detectSrid(coordinate) {
		return isCoordinate(coordinate) && !isWGS84Coordinate(coordinate) ? this.#mapService.getLocalProjectedSrid() : 4326;
	}

	_getGeomTypeFromConfiguration() {
		return (
			new URLSearchParams(this.#environmentService.getWindow().location.href).get(QueryParameters.EC_GEOMETRY_FORMAT) ??
			/** Default type for export*/ SourceTypeName.EWKT
		);
	}

	static get ON_LOAD_EVENT_DELAY_MS() {
		return 500;
	}
	static get GEOMETRY_CHANGE_EVENT_DEBOUNCE_DELAY_MS() {
		return 100;
	}
}
