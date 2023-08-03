/**
 * @module modules/admin/components/layerList/LayerList
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './layerList.css';
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
		this._onSubmit = () => {};
	}

	update(type, data, model) {
		switch (type) {
			case Update_GeoResources:
				return { ...model, geoResources: data };
			case Update_FilterText:
				return { ...model, filterText: data };
		}
	}

	// draggables = [];
	// /**
	//  * @override
	//  */
	// onAfterRender() {
	// 	const elements = this.shadowRoot.querySelectorAll('.draggable');
	// 	if (this.draggables.length === 0 && elements) {
	// 		this.draggables = elements;

	// 		console.log('🚀 ~ LayerList ~ createView ~ elements:', elements);
	// 		elements.forEach((element) => {});
	// 	}
	// }

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
			const target = e.target;
			const id = e.target.id;

			e.dataTransfer.clearData();
			e.dataTransfer.setData('geoResourceId' + id, id);
			e.dataTransfer.setData('geoResourceId', id);

			const addIsDragged = () => {
				target.classList.add('isdragged');
			};

			setTimeout(addIsDragged, 0);
		};

		const onDragEnd = (event) => {
			event.target.classList.remove('isdragged');
		};

		// const elements = this.shadowRoot.querySelectorAll('.draggable');
		// // console.log('🚀 ~ LayerList ~ createView ~ this.shadowRoot:', this.shadowRoot);
		// // console.log('🚀 ~ LayerList ~ createView ~ elements:', elements);
		// elements.forEach((el) => {
		// 	// console.log('🚀 ~ LayerList ~ elements.forEach ~ el:', el);
		// });

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
							html`<li
								id="${geoResource.id}"
								class="draggable"
								draggable="true"
								@dragstart=${(e) => onDragStart(e, geoResource.id)}
								@dragend=${onDragEnd}
							>
								${geoResource.label}
							</li>`
					)}
				</ul>
			</div>
		`;
	}

	/**
	 * @property {Array} geoResources = []
	 */
	set geoResources(value) {
		this.signal(Update_GeoResources, value);
	}

	get geoResources() {
		return this.getModel().geoResources;
	}

	static get tag() {
		return 'ba-layer-list';
	}
}
