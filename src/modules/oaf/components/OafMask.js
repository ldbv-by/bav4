/**
 * @module modules/oaf/components/OafMask
 */
import css from './oafMask.css';
import { getOperatorDefinitions, createDefaultFilterGroup, createCqlExpression } from '../utils/oafUtils';
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection';
import addSvg from './assets/add.svg';
import loadingSvg from './assets/loading.svg';

import { LayerState, modifyLayer } from './../../../store/layers/layers.action';

const Update_Capabilities = 'update_capabilities';
const Update_Filter_Groups = 'update_filter_groups';
const Update_Show_Console = 'update_show_console';
const Update_Layer_Id = 'update_layer_id';
const Update_Layer_Properties = 'update_layer_properties';

/**
 * Displays and allows filtering for OGC Feature API capabilities.
 *
 * @property {string} layerId=-1 The layerId identifies what layer this mask gets and what filter capabilities are applied
 * @property {string} showConsole=false Shows the CQL Console when "true". Otherwise, the normal UI Mode of this mask.
 *
 * @class
 * @author herrmutig
 */
export class OafMask extends MvuElement {
	#storeService;
	#importOafService;
	#translationService;
	#geoResourceService;
	#capabilitiesLoaded;
	#parserService;

	constructor() {
		super({
			filterGroups: [],
			capabilities: [],
			layerId: -1,
			showConsole: false,
			layerProperties: {
				title: null,
				featureCount: null,
				state: LayerState.LOADING
			}
		});

		const {
			StoreService: storeService,
			ImportOafService: importOafService,
			TranslationService: translationService,
			GeoResourceService: geoResourceService,
			OafMaskParserService: parserService
		} = $injector.inject('StoreService', 'ImportOafService', 'TranslationService', 'GeoResourceService', 'OafMaskParserService');

		this.#storeService = storeService;
		this.#importOafService = importOafService;
		this.#translationService = translationService;
		this.#geoResourceService = geoResourceService;
		this.#parserService = parserService;
	}

	onInitialize() {
		this.observe(
			(store) => store.layers.active.find((l) => l.id === this.layerId),
			(layer) => {
				const properties = this.getModel().layerProperties;
				this.signal(Update_Layer_Properties, { ...properties, featureCount: layer.props?.featureCount ?? null, state: layer.state });
			}
		);

		const geoResource = this.#geoResourceService.byId(this._getLayer().geoResourceId);
		this.signal(Update_Layer_Properties, { ...this.getModel().layerProperties, title: geoResource.label });
		this._requestFilterCapabilities();
	}

	update(type, data, model) {
		switch (type) {
			case Update_Capabilities:
				return { ...model, capabilities: data };
			case Update_Filter_Groups:
				return { ...model, filterGroups: [...data] };
			case Update_Show_Console:
				return { ...model, showConsole: data };
			case Update_Layer_Id:
				return { ...model, layerId: data };
			case Update_Layer_Properties:
				return { ...model, layerProperties: data };
		}
	}

	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { layerProperties, capabilities, filterGroups, showConsole } = model;

		const onAddFilterGroup = () => {
			const groups = this.getModel().filterGroups;
			this.signal(Update_Filter_Groups, [...groups, createDefaultFilterGroup()]);
		};

		const onShowCqlConsole = () => {
			this.signal(Update_Show_Console, !showConsole);
		};

		const onDuplicateFilterGroup = (evt) => {
			const group = this._findFilterGroupById(evt.target.getAttribute('group-id'));
			const duplicate = { ...createDefaultFilterGroup(), oafFilters: [...group.oafFilters] };
			this.signal(Update_Filter_Groups, [...this.getModel().filterGroups, duplicate]);
		};

		const onRemoveFilterGroup = (evt) => {
			const groups = this._removeFilterGroup(evt.target.getAttribute('group-id'));
			this.signal(Update_Filter_Groups, groups);
			this._updateLayer(groups);
		};

		const onFilterGroupChanged = (evt) => {
			const groups = this.getModel().filterGroups;
			const targetGroup = this._findFilterGroupById(evt.target.getAttribute('group-id'));
			targetGroup.oafFilters = evt.target.oafFilters;
			this.signal(Update_Filter_Groups, groups);
			this._updateLayer(groups);
		};

		const getFilterGroupLabel = () => {
			return this.getModel().filterGroups.length === 0 ? translate('oaf_mask_add_filter_group') : '';
		};

		const getFilterClasses = () => {
			return this.getModel().filterGroups.length === 0 ? 'no-group' : 'group';
		};

		const contentHeaderButtonsHtml = () => {
			return showConsole
				? html` <ba-button id="btn-normal-mode" .label=${translate('oaf_mask_ui_mode')} .type=${'secondary'} @click=${onShowCqlConsole}></ba-button>`
				: html` <ba-button
							id="btn-add-filter-group"
							.title=${translate('oaf_mask_add_filter_group')}
							.label=${getFilterGroupLabel()}
							.type=${'primary'}
							.icon=${addSvg}
							@click=${onAddFilterGroup}
							class=${getFilterClasses()}
						></ba-button>
						<ba-button id="btn-expert-mode" .label=${translate('oaf_mask_console_mode')} c @click=${onShowCqlConsole}></ba-button>`;
		};

		const orSeparatorHtml = () => html`
			<div class="separator-container">
				<div class="separator"></div>
				<div class="separator-content">${translate('oaf_mask_or')}</div>
				<div class="separator"></div>
			</div>
		`;

		const uiModeHtml = () =>
			html` <div id="filter-groups">
				${repeat(
					filterGroups,
					(group) => group.id,
					(group, index) => html`
						<ba-oaf-filter-group
							group-id=${group.id}
							.queryables=${capabilities.queryables}
							.oafFilters=${group.oafFilters}
							@change=${onFilterGroupChanged}
							@duplicate=${onDuplicateFilterGroup}
							@remove=${onRemoveFilterGroup}
						></ba-oaf-filter-group>
						${index < filterGroups.length - 1 ? orSeparatorHtml() : html`<div></div>`}
					`
				)}
			</div>`;

		const consoleModeHtml = () =>
			html`<div id="console" class="console-flex-container">
				<div class="btn-bar">
					${getOperatorDefinitions(null).map((operator) => html`<ba-button .type=${'primary'} .label=${operator.name}></ba-button>`)}
				</div>
				<textarea class="console"></textarea>
				<ba-button id="console-btn-apply" .type=${'primary'} .label=${translate('oaf_mask_button_apply')}></ba-button>
			</div>`;

		const getInfoBar = () => {
			const title = translate(`layerManager_title_layerState_${layerProperties.state}`);

			switch (layerProperties.state) {
				case LayerState.LOADING:
					return html`<h3 id="filter-results">
						${translate('oaf_mask_filter_results')}
						<ba-icon
							.icon="${loadingSvg}"
							.title="${title}"
							.size=${'1.3'}
							.color=${'var(--primary-color)'}
							.color_hover="${'var(--primary-color)'}"
							class="loading"
						></ba-icon>
					</h3> `;

				case LayerState.INCOMPLETE_DATA:
				case LayerState.OK:
					return html`<h3 id="filter-results">${translate('oaf_mask_filter_results')} ${layerProperties.featureCount}</h3>`;
			}
		};

		const content = () => {
			if (!this.#capabilitiesLoaded) {
				return html`<ba-spinner></ba-spinner>`;
			}

			if (capabilities.length < 1) {
				return nothing;
			}

			return html`
				<div class="container">
					<div class="info-bar">${getInfoBar()}</div>
				</div>
				<div class="container">
					<div>${contentHeaderButtonsHtml()}</div>
					<div class="container-filter-groups">${showConsole ? consoleModeHtml() : uiModeHtml()}</div>
				</div>
			`;
		};

		return html`
			<style>
				${css}
			</style>
			<h3 class="header">
				<span class="icon"> </span>
				<span class="text">${layerProperties.title ?? translate('oaf_mask_title')}</span>
			</h3>
			${content()}
		`;
	}

	_updateLayer(filterGroups) {
		const expression = createCqlExpression(filterGroups);
		modifyLayer(this.layerId, { filter: expression === '' ? null : expression });
	}

	_removeFilterGroup(idToRemove) {
		return this.getModel().filterGroups.filter((group) => {
			return group.id !== Number(idToRemove);
		});
	}

	_findFilterGroupById(id) {
		return this.getModel().filterGroups.find((group) => {
			return Number(id) === group.id;
		});
	}

	_getLayer() {
		return this.#storeService
			.getStore()
			.getState()
			.layers.active.find((l) => l.id === this.layerId);
	}

	async _requestFilterCapabilities() {
		this.#capabilitiesLoaded = false;
		const layer = this._getLayer();
		const geoResource = this.#geoResourceService.byId(layer.geoResourceId);
		const capabilities = await this.#importOafService.getFilterCapabilities(geoResource);
		const cqlString = layer.constraints.filter;

		this.#capabilitiesLoaded = true;
		this.signal(Update_Capabilities, capabilities);

		if (cqlString && capabilities.queryables.length > 0) {
			const parsedFilterGroups = this.#parserService.parse(cqlString, capabilities.queryables);
			this.signal(Update_Filter_Groups, parsedFilterGroups);
		}
	}

	get layerId() {
		return this.getModel().layerId;
	}

	set layerId(value) {
		this.signal(Update_Layer_Id, value);
	}

	get showConsole() {
		return this.getModel().showConsole;
	}

	set showConsole(value) {
		this.signal(Update_Show_Console, value);
	}

	static get tag() {
		return 'ba-oaf-mask';
	}
}
