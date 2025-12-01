/**
 * @module plugins/PublicWebComponentPlugin
 */
import { QueryParameters } from '../domain/queryParameters';
import { SourceType, SourceTypeName } from '../domain/sourceType';
import { WcEvents } from '../domain/wcEvents';
import { $injector } from '../injection/index';
import { addLayer, modifyLayer, removeLayer } from '../store/layers/layers.action';
import { changeZoom } from '../store/position/position.action';
import { isNumber } from '../utils/checks';
import { equals, observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

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
			MapService: mapService
		} = $injector.inject('EnvironmentService', 'ExportVectorDataService', 'CoordinateService', 'MapService');
		this.#environmentService = environmentService;
		this.#exportVectorDataService = exportVectorDataService;
		this.#coordinateService = coordinateService;
		this.#mapService = mapService;
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
			const onReceive = (event) => {
				switch (event.data.v) {
					case '1': {
						if (event.data.source === this._getIframeId()) {
							for (const property in event.data) {
								switch (property) {
									case QueryParameters.ZOOM:
										changeZoom(event.data[property]);
										break;
									case 'addLayer': {
										const { id, options } = event.data[property];
										addLayer(id, options);
										break;
									}
									case 'modifyLayer': {
										const { id, options } = event.data[property];
										modifyLayer(id, options);
										break;
									}
									case 'removeLayer': {
										const { id } = event.data[property];
										removeLayer(id);
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

			this.#environmentService.getWindow().parent.addEventListener('message', onReceive);

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
						this.#coordinateService.transform(center, this.#mapService.getSrid(), this._getSridFromConfiguration())
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
						active
							.filter((l) => !l.constraints.hidden)
							.map((l) => l.id)
							.join(',')
					),
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
								payload[WcEvents.FEATURE_SELECT] = { features: [...items], coordinate: [...state.featureInfo.coordinate.payload] };
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
					this._broadcast(payload);
				}
			);
		}
	}

	_getSridFromConfiguration() {
		const sridValue = parseInt(new URLSearchParams(this.#environmentService.getWindow().location.href).get(QueryParameters.EC_SRID));
		return isNumber(sridValue) ? sridValue : /** Default SRID for export */ 4326;
	}

	_getGeomTypeFromConfiguration() {
		return (
			new URLSearchParams(this.#environmentService.getWindow().location.href).get(QueryParameters.EC_GEOMETRY_FORMAT) ??
			/** Default type for export*/ SourceTypeName.EWKT
		);
	}
}
