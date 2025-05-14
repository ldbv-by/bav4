/**
 * @module modules/examples/ogc/components/OgcFeaturesMask
 */
import { html } from 'lit-html';
import { when } from 'lit-html/directives/when.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection';
import css from './oafMask.css';
import { createUniqueId } from '../../../utils/numberUtils';

const Update_Capabilities = 'update_capabilities';
const Update_Filter_Group = 'update_filter_group';
const Update_Show_Console = 'update_show_console';

/**
 * Displays and allows filtering for OGC Feature API capabilities
 *
 * @class
 * @author herrmutig
 */
export class OafMask extends MvuElement {
	#geoResourceService;
	#importOafService;

	constructor() {
		super({
			filterGroupIds: [],
			capabilities: [],
			showConsole: false
		});

		const { GeoResourceService: geoResourceService, ImportOafService: importOafService } = $injector.inject('GeoResourceService', 'ImportOafService');

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
			case Update_Filter_Group:
				return { ...model, filterGroupIds: [...data] };
			case Update_Show_Console:
				return { ...model, showConsole: data };
		}
	}

	createView(model) {
		const onAddFilterGroup = () => {
			const groups = this.getModel().filterGroupIds;
			this.signal(Update_Filter_Group, [...groups, createUniqueId()]);
		};

		const onShowCqlConsole = () => {
			this.signal(Update_Show_Console, !showConsole);
		};

		const removeFilterGroup = (evt) => {
			const groups = this.getModel().filterGroupIds;
			this.signal(Update_Filter_Group, this._removeFilterGroup(evt.target.getAttribute('group-id')));
		};

		const orSeperatorHtml = html`
			<div class="seperator-container">
				<div class="seperator"></div>
				<div class="seperator-content">ODER</div>
				<div class="seperator"></div>
			</div>
		`;

		const { capabilities, filterGroupIds, showConsole } = model;

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				${showConsole
					? html`<div class="sticky-container">
								<ba-button
									style="width:200px; display:inline-block;padding: 20px 0px;"
									.label=${'Normaler Modus'}
									.type=${'primary'}
									@click=${onShowCqlConsole}
								></ba-button>
							</div>
							<div class="console-flex-container">
								<div class="btn-bar">
									<ba-button .type=${'primary'} .label=${'Größer Gleich'}></ba-button>
									<ba-button .type=${'primary'} .label=${'Kleiner Gleich'}></ba-button>
									<ba-button .type=${'primary'} .label=${'Größer'}></ba-button>
									<ba-button .type=${'primary'} .label=${'Kleiner'}></ba-button>
									<ba-button .type=${'primary'} .label=${'Gleich'}></ba-button>
									<ba-button .type=${'primary'} .label=${'Ungleich'}></ba-button>
									<ba-button .type=${'primary'} .label=${'Enthält'}></ba-button>
								</div>
								<textarea class="console"></textarea>
								<ba-button .type=${'primary'} .label=${'Anwenden'}></ba-button>
							</div>`
					: html`<div class="sticky-container">
								<ba-button
									style="width:200px; display:inline-block; padding: 20px 0px;"
									.label=${'Neue Filtergruppe'}
									.type=${'primary'}
									@click=${onAddFilterGroup}
								></ba-button>
								<ba-button
									style="width:200px; display:inline-block;padding: 20px 0px;"
									.label=${'Expertenmodus'}
									.type=${'primary'}
									@click=${onShowCqlConsole}
								></ba-button>
							</div>
							<div class="flex-hscroll-container">
								${repeat(
									filterGroupIds,
									(groupId) => groupId,
									(groupId, index) =>
										html` <div class="filter-group-container">
											<ba-oaf-filter-group
												group-id=${groupId}
												@remove=${removeFilterGroup}
												.queryables=${capabilities.queryables}
											></ba-oaf-filter-group>
											${when(
												index < filterGroupIds.length - 1,
												() => orSeperatorHtml,
												() => html`<div></div>`
											)}
										</div>`
								)}
							</div>`}
			</div>
		`;
	}

	_removeFilterGroup(idToRemove) {
		return this.getModel().filterGroupIds.filter((id) => {
			return id != idToRemove;
		});
	}

	async _requestFilterCapabilities() {
		const geoResource = this.#geoResourceService.byId('');
		const capabilities = await this.#importOafService.getFilterCapabilities(geoResource);

		this.signal(Update_Capabilities, capabilities);
	}

	static get tag() {
		return 'ba-oaf-mask';
	}
}
