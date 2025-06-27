/**
 * @module modules/oaf/components/OafMask
 */
import css from './oafMask.css';
import { getOperatorDefinitions, createDefaultFilterGroup, createCqlExpression } from './oafUtils';
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection';
import addSvg from './assets/add.svg';
import { modifyLayer } from './../../../store/layers/layers.action';

const Update_Capabilities = 'update_capabilities';
const Update_Filter_Groups = 'update_filter_groups';
const Update_Layer_Id = 'update_layer_id';
const Update_Show_Console = 'update_show_console';

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

	constructor() {
		super({
			filterGroups: [],
			capabilities: [],
			layerId: -1,
			showConsole: false
		});

		const {
			StoreService: storeService,
			ImportOafService: importOafService,
			TranslationService: translationService,
			GeoResourceService: geoResourceService
		} = $injector.inject('StoreService', 'ImportOafService', 'TranslationService', 'GeoResourceService');

		this.#storeService = storeService;
		this.#importOafService = importOafService;
		this.#translationService = translationService;
		this.#geoResourceService = geoResourceService;
	}

	onInitialize() {
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
		}
	}

	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const onAddFilterGroup = () => {
			const groups = this.getModel().filterGroups;
			this.signal(Update_Filter_Groups, [...groups, createDefaultFilterGroup()]);
		};

		const onShowCqlConsole = () => {
			this.signal(Update_Show_Console, !showConsole);
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

		const { capabilities, filterGroups, showConsole } = model;

		const getFilterGroupLabel = () => {
			return this.getModel().filterGroups.length === 0 ? translate('oaf_mask_add_filter_group') : '';
		};

		const getFilterClasses = () => {
			return this.getModel().filterGroups.length === 0 ? 'no-group' : 'group';
		};

		const contentHeaderButtonsHtml = () => {
			if (!this.#capabilitiesLoaded) {
				return html`<ba-spinner></ba-spinner>`;
			}

			if (capabilities.length < 1) {
				return nothing;
			}

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
							@remove=${onRemoveFilterGroup}
							.queryables=${capabilities.queryables}
							.oafFilters=${group.oafFilters}
							@change=${onFilterGroupChanged}
						></ba-oaf-filter-group>
						${index < filterGroups.length - 1 ? orSeparatorHtml() : html`<div></div>`}
					`
				)}
			</div>`;

		const consoleModeHtml = () =>
			html` <div id="console" class="console-flex-container">
				<div class="btn-bar">
					${getOperatorDefinitions(null).map((operator) => html`<ba-button .type=${'primary'} .label=${operator.name}></ba-button>`)}
				</div>
				<textarea class="console"></textarea>
				<ba-button id="console-btn-apply" .type=${'primary'} .label=${translate('oaf_mask_button_apply')}></ba-button>
			</div>`;

		return html`
			<style>
				${css}
			</style>
			<h3 class="header">
				<span class="icon"> </span>
				<span class="text">${translate('oaf_mask_title')}</span>
			</h3>
			<div class="container">
				<div>${contentHeaderButtonsHtml()}</div>
				<div class="container-filter-groups">${showConsole ? consoleModeHtml() : uiModeHtml()}</div>
			</div>
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
		this.#capabilitiesLoaded = true;
		this.signal(Update_Capabilities, capabilities);
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
