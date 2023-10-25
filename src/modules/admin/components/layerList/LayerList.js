/**
 * @module modules/admin/components/layerList/LayerList
 */
// @ts-ignore
import { html } from 'lit-html';
// @ts-ignore
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
// @ts-ignore
import css from './layerList.css';
// @ts-ignore
import { nothing } from 'lit-html';

const Update_GeoResources = 'lpdate_geoResources';
const Update_FilterText = 'lpdate_filterText';

/**
 * Contains
 *
 * @class
 */
export class LayerList extends MvuElement {
	constructor() {
		super({
			geoResources: [],
			filterText: ''
		});

		const {
			ConfigService: configService,
			TranslationService: translationService,
			SecurityService: securityService
		} = $injector.inject('ConfigService', 'TranslationService', 'SecurityService');

		this._configService = configService;
		this._translationService = translationService;
		this._securityService = securityService;
		// this._onDrop = () => {};

		this._refreshLayers = () => {};
	}

	update(type, data, model) {
		switch (type) {
			case Update_GeoResources:
				return { ...model, geoResources: data };
			case Update_FilterText:
				return { ...model, filterText: data };
		}
	}

	createView(model) {
		const { geoResources, filterText } = model;

		if (geoResources === null || (geoResources && geoResources.length === 0)) {
			return nothing;
		}

		const filteredGeoResources = geoResources.filter((resource) => resource.label.toLowerCase().includes(filterText.toLowerCase()));

		const handleFilterChange = (event) => {
			const filterText = event.target.value;
			this.signal(Update_FilterText, filterText);
		};

		const onDragStart = (e) => {
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ LayerList ~ createView ~ onDragStart ~ e:', e);
			const target = e.target;
			const id = target.id;
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ LayerList ~ createView ~ onDragStart ~ id:', id);

			e.dataTransfer.clearData();
			e.dataTransfer.setData('geoResourceId' + id, id);

			const addIsDragged = () => {
				target.classList.add('isdragged');
			};

			setTimeout(addIsDragged, 0);
		};

		const onDragEnd = (event) => {
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ LayerList ~ onDragEnd ~ event:', event);
			event.target.classList.remove('isdragged');
		};

		const onDrop = (e) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ file: LayerTree.js:348 ~ onDrop ~ e:', e);
		};

		return html`
			<style>
				${css}
			</style>

			<div>
				<h2>Layer List - Verfügbare Ebenen</h2>

				Verfügbare Ebenen:
				<input type="text" @input="${handleFilterChange}" placeholder="Filter" />

				<button id="refreshButton" @click="${() => this._refreshLayers()}">refresh</button>

				<ul>
					${filteredGeoResources.map(
						(geoResource) =>
							html`<li id="${geoResource.id}" class="draggable" draggable="true" @dragstart=${onDragStart} @drop=${onDrop} @dragend=${onDragEnd}>
								${geoResource.label} (${geoResource.id})
							</li>`
					)}
				</ul>
			</div>
		`;
	}
	// @drop=${this._onDrop}

	/**
	 * @property {Array} geoResources = []
	 */
	set geoResources(value) {
		this.signal(Update_GeoResources, value);
	}

	get geoResources() {
		return this.getModel().geoResources;
	}

	/**
	 * @property {function} refreshLayers - Callback function
	 */
	set refreshLayers(callback) {
		this._refreshLayers = callback;
	}

	get onDrop() {
		return this._refreshLayers;
	}

	static get tag() {
		return 'ba-layer-list';
	}
}
