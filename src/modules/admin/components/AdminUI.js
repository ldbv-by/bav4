/**
 * @module modules/admin/components/AdminUI
 */
import css from './adminUI.css';
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection/index';
import { nothing } from '../../../../node_modules/ol/pixel';

const Update_Geo_Resources = 'update_geo_resources';
const Update_Topics = 'update_topics';

/**
 * Container element for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class AdminUI extends MvuElement {
	constructor() {
		super({
			topics: [],
			geoResources: []
		});

		const { AdminCatalogService: adminCatalogService } = $injector.inject('AdminCatalogService');
		this._adminCatalogService = adminCatalogService;
	}

	/**
	 * @override
	 */
	onInitialize() {
		this._requestTopics();
		this._requestGeoResources();
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Geo_Resources:
				return { ...model, geoResources: [...data] };
			case Update_Topics:
				return { ...model, topics: [...data] };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { geoResources, topics } = model;
		if (geoResources.length === 0 || topics.length === 0) return nothing;

		const onDragStart = (evt, geoResource) => {
			evt.dataTransfer.dropEffect = 'move';
			evt.dataTransfer.effectAllowed = 'move';
			//@ts-ignore
			this.shadowRoot.querySelector('ba-catalog').dragContext = { ...geoResource };
		};

		return html`
			<style>
				${css}
			</style>

			<div class="grid-container">
				<ba-catalog></ba-catalog>

				<div id="geo-resource-explorer" class="gr25">
					<div class="menu-bar gr100">
						<div class="geo-resource-button-bar">
							<input id="geo-resource-search-input" class="gr75" type="text" placeholder="Geo Resource filtern" />
							<button>Refresh</button>
						</div>
					</div>
					<div id="geo-resource-explorer-content">
						${geoResources.map(
							(resource) =>
								html`<div draggable="true" class="geo-resource draggable" @dragstart=${(evt) => onDragStart(evt, resource)}>${resource.label}</div>`
						)}
					</div>
				</div>
			</div>
		`;
	}

	async _requestTopics() {
		const topics = await this._adminCatalogService.getTopics();
		this.signal(Update_Topics, topics);
	}

	async _requestGeoResources() {
		const resources = await this._adminCatalogService.getGeoResources();
		this.signal(Update_Geo_Resources, resources);
	}

	static get tag() {
		return 'ba-admin-ui';
	}
}
