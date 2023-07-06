/**
 * @module modules/baseLayer/components/switcher/BaseLayerSwitcher
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { addLayer, removeLayer } from '../../../../store/layers/layers.action';
import css from './baseLayerSwitcher.css';
import { MvuElement } from '../../../MvuElement';
import { createUniqueId } from '../../../../utils/numberUtils';

const Update_Configuration = 'update_configuration';
const Update_Layers = 'update_layers';
const Update_Is_Layers_Store_Ready = 'update_is_layers_store_ready';

/**
 * Configuration of a BaseLayerSwitcher instance.
 * @typedef BaseLayerSwitcherConfiguration
 * @property {Array<string>} managed GeoResource ids which should be managed by this BaseLayerSwitcher instance
 * @property {Array<string>} all All available GeoResource ids which should be considered as a base layer (may be empty)
 */

/**
 * Displays and handles GeoResources defined to act as base layers.
 * Component can be used alone or in conjunction with {@link BaseLayerContainer}.
 * @property {module:modules/baseLayer/components/switcher/BaseLayerSwitcher~BaseLayerSwitcherConfiguration} configuration Configuration for this BaseLayerSwitcher
 * @class
 * @author taulinger
 */
export class BaseLayerSwitcher extends MvuElement {
	constructor() {
		super({
			allBaseGeoResourceIds: [],
			baseGeoResourceIds: [],
			activeLayers: [],
			layersStoreReady: false
		});

		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
		this._geoResourceService = geoResourceService;

		this.observe(
			(store) => store.layers.active,
			(layers) => this.signal(Update_Layers, [...layers])
		);
		this.observe(
			(store) => store.layers.ready,
			(ready) => this.signal(Update_Is_Layers_Store_Ready, ready)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Configuration:
				return { ...model, baseGeoResourceIds: [...data.managed], allBaseGeoResourceIds: [...data.all] };
			case Update_Layers:
				return { ...model, activeLayers: [...data] };
			case Update_Is_Layers_Store_Ready:
				return { ...model, layersStoreReady: data };
		}
	}

	createView(model) {
		const { baseGeoResourceIds, allBaseGeoResourceIds, activeLayers, layersStoreReady } = model;

		if (layersStoreReady) {
			/**
			 * carefully differentiate between layer ids and geoResource ids!
			 */
			const currentBaseLayerGeoResourceId = activeLayers[0] ? activeLayers[0].geoResourceId : null;
			const geoRs = baseGeoResourceIds.map((grId) => this._geoResourceService.byId(grId)).filter((geoR) => !!geoR);

			const onClick = (geoR) => {
				const add = () => {
					// we create always a unique layer id
					addLayer(`${geoR.id}_${createUniqueId()}`, { zIndex: 0, geoResourceId: geoR.id });
				};

				if (activeLayers.length > 0) {
					// noting todo when requested base GeoResource already on index=0
					if (activeLayers[0].geoResourceId !== geoR.id) {
						// if we have a layer referencing a base GeoResource on index=0, we remove it
						if (allBaseGeoResourceIds.includes(activeLayers[0].geoResourceId)) {
							removeLayer(activeLayers[0].id);
						}
						// add selected layer
						add();
					}
				} else {
					add();
				}
			};

			const getType = (geoR) => {
				return geoR.id === currentBaseLayerGeoResourceId ? 'primary' : 'secondary';
			};

			return html`
				<style>
					${css}
				</style>
				<div class="baselayer__container">
					${geoRs.map(
						(geoR) =>
							html` <button class="baselayer__button  ${geoR.id}" @click=${() => onClick(geoR)} type=${getType(geoR)}>
								<div class="baselayer__label">${geoR.label}</div>
							</button>`
					)}
				</div>
			`;
		}
		// should we render a placeholder for that case?
		return nothing;
	}

	set configuration(configuration) {
		this.signal(Update_Configuration, { ...configuration });
	}

	static get tag() {
		return 'ba-base-layer-switcher';
	}
}
