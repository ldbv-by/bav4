/**
 * @module modules/examples/ogc/components/OgcFeaturesMask
 */
import { html } from 'lit-html';
import { when } from 'lit-html/directives/when.js';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection';
import css from './oafMask.css';

const Update_Capabilities = 'update_capabilities';
const Update_Filter_Group = 'update_filter_group';

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
			filterGroups: [],
			capabilities: []
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
				return { ...model, filterGroups: [...model.filterGroups, {}] };
		}
	}

	createView(model) {
		const onAddFilterGroup = (evt) => {
			this.signal(Update_Filter_Group);
		};

		const onShowCqlConsole = (evt) => {
			console.log('Show Cql Console');
		};

		const orSeperatorHtml = html`
			<div class="seperator-container">
				<div class="seperator"></div>
				<div class="seperator-content">ODER</div>
				<div class="seperator"></div>
			</div>
		`;

		const { capabilities, filterGroups } = model;

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				<div class="sticky-container">
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
				<div class="grid-container">
					${filterGroups.map(
						(group, index) => html`
							<div class="grid-filter-group-container">
								<ba-oaf-filter-group .queryables=${capabilities.queryables}></ba-oaf-filter-group>
								${when(
									index < filterGroups.length - 1,
									() => orSeperatorHtml,
									() => html`<div></div>`
								)}
							</div>
						`
					)}
				</div>
			</div>
		`;
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
