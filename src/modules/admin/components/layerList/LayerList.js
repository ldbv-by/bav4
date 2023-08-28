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
			console.log('🚀 ~ LayerList ~ onDragStart ~ e:', e);
			const target = e.target;
			const id = e.target.id;

			e.dataTransfer.clearData();
			e.dataTransfer.setData('geoResourceId' + id, id);

			const addIsDragged = () => {
				target.classList.add('isdragged');
			};

			setTimeout(addIsDragged, 0);
		};

		const onDragEnd = (event) => {
			console.log('🚀 ~ LayerList ~ onDragEnd ~ event:', event);
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
				<h2>Layer List</h2>
				<input type="text" @input="${handleFilterChange}" placeholder="Filter" />

				<ul>
					${filteredGeoResources.map(
						(geoResource) =>
							html`<li id="${geoResource.id}" class="draggable" draggable="true" @dragstart=${onDragStart} @drop=${onDrop} @dragend=${onDragEnd}>
								${geoResource.label}
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

	// /**
	//  * @property {function} onDrop - Callback function
	//  */
	// set onDrop(callback) {
	// 	this._onDrop = callback;
	// }

	// get onDrop() {
	// 	return this._onDrop;
	// }

	static get tag() {
		return 'ba-layer-list';
	}
}
