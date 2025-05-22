/**
 * @module modules/oaf/components/OafMask
 */
import css from './oafMask.css';
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection';
import { createUniqueId } from '../../../utils/numberUtils';

const Update_Capabilities = 'update_capabilities';
const Update_Filter_Groups = 'update_filter_groups';
const Update_Layer_Id = 'update_layer_id';
const Update_Show_Console = 'update_show_console';

/**
 * Displays and allows filtering for OGC Feature API capabilities
 *
 * @class
 * @author herrmutig
 */
export class OafMask extends MvuElement {
	#storeService;
	#geoResourceService;
	#importOafService;

	constructor() {
		super({
			filterGroups: [],
			capabilities: [],
			layerId: -1,
			showConsole: false
		});

		const {
			StoreService: storeService,
			GeoResourceService: geoResourceService,
			ImportOafService: importOafService
		} = $injector.inject('StoreService', 'GeoResourceService', 'ImportOafService');

		this.#storeService = storeService;
		this.#geoResourceService = geoResourceService;
		this.#importOafService = importOafService;
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
		const onAddFilterGroup = () => {
			const groups = this.getModel().filterGroups;
			this.signal(Update_Filter_Groups, [...groups, { id: createUniqueId(), oafFilters: [] }]);
		};

		const onShowCqlConsole = () => {
			this.signal(Update_Show_Console, !showConsole);
		};

		const onRemoveFilterGroup = (evt) => {
			this.signal(Update_Filter_Groups, this._removeFilterGroup(evt.target.getAttribute('group-id')));
		};

		const onFilterGroupChanged = (evt) => {
			const groups = this.getModel().filterGroups;
			const targetGroup = this._findFilterGroupById(evt.target.getAttribute('group-id'));
			targetGroup.oafFilters = evt.target.oafFilters;
			this.signal(Update_Filter_Groups, [...groups]);
		};

		const { capabilities, filterGroups, showConsole } = model;

		const contentHeaderButtonsHtml = () => {
			if (capabilities.length < 1) {
				return nothing;
			}

			return showConsole
				? html` <ba-button
						style="width:200px; display:inline-block;padding: 20px 0px;"
						id="btn-normal-mode"
						.label=${'Normaler Modus'}
						.type=${'primary'}
						@click=${onShowCqlConsole}
					></ba-button>`
				: html` <ba-button
							id="btn-add-filter-group"
							style="width:200px; display:inline-block; padding: 20px 0px;"
							.label=${'Neue Filtergruppe'}
							.type=${'primary'}
							@click=${onAddFilterGroup}
						></ba-button>
						<ba-button
							id="btn-expert-mode"
							style="width:200px; display:inline-block;padding: 20px 0px;"
							.label=${'Expertenmodus'}
							.type=${'primary'}
							@click=${onShowCqlConsole}
						></ba-button>`;
		};

		const orSeparatorHtml = () => html`
			<div class="separator-container">
				<div class="separator"></div>
				<div class="separator-content">ODER</div>
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
				<div class="btn-bar">${this.oparatorDefinitions.map((oparator) => html`<ba-button .type=${'primary'} .label=${oparator}></ba-button>`)}</div>
				<textarea class="console"></textarea>
				<ba-button .type=${'primary'} .label=${'Anwenden'}></ba-button>
			</div>`;

		return html`
			<style>
				${css}
			</style>
			<div class="sticky-container">${contentHeaderButtonsHtml()}</div>
			<div class="container">${showConsole ? consoleModeHtml() : uiModeHtml()}</div>
		`;
	}

	_removeFilterGroup(idToRemove) {
		return this.getModel().filterGroups.filter((group) => {
			return group.id !== Number(idToRemove);
		});
	}

	_findFilterGroupById(id) {
		return this.getModel().filterGroups.find((group) => {
			return id === group.id;
		});
	}

	_getLayer() {
		return this.#storeService
			.getStore()
			.getState()
			.layers.active.find((l) => l.id === this.layerId);
	}

	async _requestFilterCapabilities() {
		const layer = this._getLayer();
		const geoResource = this.#geoResourceService.byId(layer.geoResourceId);
		const capabilities = await this.#importOafService.getFilterCapabilities(geoResource);

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

	get oparatorDefinitions() {
		return ['equals', 'between', 'greater', 'lesser'];
	}

	static get tag() {
		return 'ba-oaf-mask';
	}
}
