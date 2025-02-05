/**
 * @module plugins/LegendPlugin
 */
import { BaPlugin } from './BaPlugin';
import { observe } from '../utils/storeUtils';
import { setLegendItems } from '../store/legend/legend.action';
import { $injector } from '../injection/index';

export class LegendPlugin extends BaPlugin {
	constructor() {
		super();

		const { WmsCapabilitiesService } = $injector.inject('WmsCapabilitiesService');
		this._wmsCapabilitiesService = WmsCapabilitiesService;
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const updateLegendItems = (activeLayers, previewLayers) => {
			const previewLayersTitles = previewLayers.map((l) => l.title);
			activeLayers = activeLayers.filter((l) => !previewLayersTitles.includes(l.title));

			const sortedActiveLayers = activeLayers.sort((a, b) => a.title.localeCompare(b.title));
			setLegendItems([...previewLayers, ...sortedActiveLayers]);
		};

		let activeLayers = [];
		let previewLayers = [];
		let legendActive = false;

		// A synchronization object:
		// Make sure that the last action always takes precedence.
		// Do this by capturing the parameters and after an "async await"
		// checking if parameters have changed.
		const syncObject = {
			onActiveLayersChange: null,
			onPreviewIdChange: null
		};

		const onActiveLayersChange = async (layers) => {
			// save current parameters in global state
			syncObject.onActiveLayersChange = layers;

			const wmsLayers = await Promise.all(layers.filter((l) => l.visible).map((l) => this._wmsCapabilitiesService.getWmsLayers(l.geoResourceId)));

			// check if another event was triggered => current run is obsolete => abort
			if (syncObject.onActiveLayersChange !== layers) {
				return;
			}

			activeLayers = wmsLayers.flat(1);

			updateLegendItems(activeLayers, previewLayers);
		};

		const onPreviewIdChange = async (geoResourceId) => {
			if (!legendActive) {
				return;
			}

			// save current parameters in global state
			syncObject.onPreviewIdChange = geoResourceId;

			const wmsLayers = geoResourceId ? await this._wmsCapabilitiesService.getWmsLayers(geoResourceId) : [];

			// check if another event was triggered => current run is obsolete => abort
			if (syncObject.onPreviewIdChange !== geoResourceId) {
				return;
			}

			previewLayers = wmsLayers;

			updateLegendItems(activeLayers, previewLayers);
		};

		observe(
			store,
			(state) => state.legend.legendActive,
			(value) => (legendActive = value)
		);
		observe(store, (state) => state.layers.active, onActiveLayersChange, false);
		observe(store, (state) => state.legend.legendGeoresourceId, onPreviewIdChange);
	}
}
