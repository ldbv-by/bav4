/**
 * @module modules/baseLayer/components/switcher/BaseLayerSwitcher
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { addLayer, removeLayer } from '../../../../store/layers/layers.action';
import css from './baseLayerSwitcher.css';
import { MvuElement } from '../../../MvuElement';
import { createUniqueId } from '../../../../utils/numberUtils';

const Update_Base_GeoResource_Ids = 'update_base_georesource_ids';
const Update_Layers = 'update_layers';
const Update_Is_Layers_Store_Ready = 'update_is_layers_store_ready';
/**
 * Displays and handles GeoResources defined to act as base layers.
 * @property {Array<string>} geoResourceIds Array of GeoResource ids
 * @class
 * @author taulinger
 */
export class BaseLayerSwitcher extends MvuElement {
	constructor() {
		super({
			baseGeoResourceIds: [],
			activeLayers: [],
			layersStoreReady: false
		});

		const { GeoResourceService: geoResourceService, TranslationService: translationService } = $injector.inject(
			'GeoResourceService',
			'TranslationService'
		);
		this._geoResourceService = geoResourceService;
		this._translationService = translationService;

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
			case Update_Base_GeoResource_Ids:
				return { ...model, baseGeoResourceIds: [...data] };
			case Update_Layers:
				return { ...model, activeLayers: [...data] };
			case Update_Is_Layers_Store_Ready:
				return { ...model, layersStoreReady: data };
		}
	}

	createView(model) {
		const { baseGeoResourceIds, activeLayers, layersStoreReady } = model;

		const translate = (key) => this._translationService.translate(key);

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
						if (baseGeoResourceIds.includes(activeLayers[0].geoResourceId)) {
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
				<div class="title">${translate('baselayer_switcher_header')}</div>
				<div class="baselayer__container">
					${geoRs.map(
						(geoR) => html` <button class="baselayer__button  ${geoR.id}" @click=${() => onClick(geoR)} type=${getType(geoR)}>
							<div class="baselayer__label">${geoR.label}</div>
						</button>`
					)}
				</div>
			`;
		}
		// should we render a placeholder for that case?
		return nothing;
	}

	set geoResourceIds(ids) {
		this.signal(Update_Base_GeoResource_Ids, [...ids]);
	}

	static get tag() {
		return 'ba-base-layer-switcher';
	}
}
