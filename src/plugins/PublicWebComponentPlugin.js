/**
 * @module plugins/PublicWebComponentPlugin
 */
import { QueryParameters } from '../domain/queryParameters';
import { WcEvents } from '../domain/wcEvents';
import { $injector } from '../injection/index';
import { removeAndSetLayers } from '../store/layers/layers.action';
import { changeZoom } from '../store/position/position.action';
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
	#values = new Map();

	constructor() {
		super();
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this.#environmentService = environmentService;
	}

	_getIframeId() {
		return this.#environmentService.getWindow().name;
	}

	_broadcast(payload) {
		this.#environmentService.getWindow().parent.postMessage({ target: this._getIframeId(), v: '1', ...payload }, '*');
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
									case QueryParameters.LAYER: {
										const layers = event.data[property].split(',').map((l) => {
											return { id: l };
										});
										removeAndSetLayers(layers, true);
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
					this._broadcast(payload);
				}
			};

			observe(
				store,
				(state) => state.position.zoom,
				(zoom) => onStoreChanged(QueryParameters.ZOOM, zoom)
			);
			observe(
				store,
				(state) => state.layers.active,
				(active) =>
					onStoreChanged(
						QueryParameters.LAYER,
						active.filter((l) => !l.constraints.hidden).map((l) => l.geoResourceId)
					)
			);

			observe(
				store,
				(state) => state.featureInfo.coordinate,
				() => {
					const unsubscribe = observe(
						store,
						(state) => state.featureInfo.querying,
						(querying, state) => {
							//untestable else path cause function is self-removing
							/* istanbul ignore else */
							if (!querying) {
								const items = [...state.featureInfo.current]
									.filter((item) => item.geometry)
									.map((item) => ({
										label: item.title,
										geometry: item.geometry.data,
										type: item.geometry.sourceType.name,
										srid: item.geometry.sourceType.srid
									}));
								onStoreChanged(WcEvents.FEATURE_SELECT, { items, coordinate: state.featureInfo.coordinate.payload });
								unsubscribe();
							}
						}
					);
				}
			);
		}
	}
}
