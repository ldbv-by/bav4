/**
 * @module modules/admin/components/layerTree/LayerTree
 */
// @ts-ignore
import { html } from 'lit-html';
// @ts-ignore
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
// @ts-ignore
import css from './layerTree.css';
import { nothing } from '../../../../../node_modules/lit-html/lit-html';

import { setCurrentTopicId as updateStore } from '../../../../store/admin/admin.action';

const Update_SelectedTopic = 'update_selectedtopic';
const Update_Topics = 'update_topics';
const Update_CatalogWithResourceData = 'update_catalogWithResourceData';
const Update_Layers = 'update_layers';

const hasChildrenClass = 'has-children';
const showChildrenClass = 'show-children';
const droppableClass = 'droppable';

/**
 * Contains
 *
 * @class
 */
export class LayerTree extends MvuElement {
	constructor() {
		super({
			topics: [],
			catalogWithResourceData: [],
			layers: [],
			selectedTopicId: ''
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

	// onInitialize() {
	// 	this.observeModel('catalogWithResourceData', () => {
	// 		this._initDragAndDrop();
	// 	});
	// }

	// _initDragAndDrop() {
	// 	console.log('🚀 ~ LayerTree ~ _initDragAndDrop');
	// 	const droppables = this.shadowRoot.querySelectorAll('.droppable');
	// 	console.log('🚀 ~ LayerTree ~ _initDragAndDrop ~ this.shadowRoot:', this.shadowRoot);
	// 	console.log('🚀 ~ LayerTree ~ _initDragAndDrop ~ droppables:', droppables);

	// 	// for (let i = 0; i < droppables.length; i++) {
	// 	// 	droppables[i].addEventListener('dragover', function (event) {
	// 	// 		event.preventDefault();
	// 	// 		// @ts-ignore
	// 	// 		event.target.classList.add('drag-over');
	// 	// 	});

	// 	// 	droppables[i].addEventListener('dragleave', function (event) {
	// 	// 		// @ts-ignore
	// 	// 		event.target.classList.remove('drag-over');
	// 	// 	});

	// 	// 	// @ts-ignore
	// 	// }
	// }

	update(type, data, model) {
		const sortChildrenById = (entry) => {
			if (entry.children) {
				entry.children.sort((a, b) => a.id - b.id);
			}
		};

		switch (type) {
			case Update_SelectedTopic:
				return { ...model, selectedTopicId: data };
			case Update_Topics:
				return { ...model, topics: data };
			case Update_CatalogWithResourceData:
				if (data && data.length > 0) {
					data.sort((a, b) => a.id - b.id);

					data.forEach((item) => sortChildrenById(item));
				}
				return { ...model, catalogWithResourceData: data };
			case Update_Layers:
				return { ...model, layers: data };
		}
	}

	createView(model) {
		const { topics, catalogWithResourceData } = model; // todo , selectedTopicId

		if (
			catalogWithResourceData === null ||
			(catalogWithResourceData && catalogWithResourceData.length === 0) ||
			topics === null ||
			(topics && topics.length === 0)
		) {
			return nothing;
		}

		// this._initDragAndDrop();
		// console.log('🚀 ~ LayerTree ~ createView ~ this._initDragAndDrop() from create view');

		// const dumdum = () => {
		// 	this._initDragAndDrop();
		// };
		// console.log('🚀 ~ LayerTree ~ createView ~ this._initDragAndDrop() from create view dumdum');
		// dumdum();

		const handleCategoryClick = (event) => {
			const li = event.currentTarget;

			const ul = li.querySelector('ul'); // Get the child <ul> element

			if (ul) {
				li.classList.toggle(showChildrenClass);
			}
		};

		const onDragOver = (e, catalogEntry) => {
			// console.log('🚀 ~ LayerTree ~ onDragOver ~ catalogEntry:', catalogEntry);
			e.target.classList.remove('isdragged');
			e.target.classList.add('drag-over');
			e.preventDefault();
			// const droppables = this.shadowRoot.querySelectorAll('span.droppable');
			// console.log('🚀 ~ LayerTree ~ onDragOver ~ droppables:', droppables);
		};

		const onDragLeave = (e) => {
			// console.log('🚀 ~ LayerTree ~ onDragLeave ~ e:', e);
			e.target.classList.add('isdragged');
			e.target.classList.remove('drag-over');
			e.preventDefault();

			// // todo remove dum dum
			// console.log('🚀 ~ LayerTree ~ createView ~ this._initDragAndDrop() from create view onDragLeave');
			// this._initDragAndDrop();
		};

		const handleEditClick = (catalogEntry) => {
			console.log('🚀 ~ LayerTree ~ createView ~ catalogEntry:', catalogEntry);
		};
		const handleDeleteClick = (catalogEntry) => {
			console.log('🚀 ~ LayerTree ~ handleDeleteClick ~ catalogEntry:', catalogEntry);
		};

		if (topics) {
			return html`
				<style>
					${css}
				</style>

				<div>
					<h2>Layer Tree</h2>
					<select @change="${this.handleTopicChange}">
						${topics.map((topic) => html` <option value="${topic._id}">${topic._label}</option> `)}
					</select>

					<ul>
						${catalogWithResourceData.map(
							(catalogEntry) => html`
								<li @click="${handleCategoryClick}" class="${catalogEntry.children ? 'has-children' : ''}">
									<span
										draggable="true"
										class="${catalogEntry.children ? hasChildrenClass + ' ' + droppableClass : droppableClass}"
										@dragover=${(e) => onDragOver(e, catalogEntry)}
										@dragleave=${onDragLeave}
										>${catalogEntry.label}</span
									>
									${catalogEntry.children
										? html`
												<button @click="${() => handleEditClick(catalogEntry)}">Edit</button>
												<button @click="${() => handleDeleteClick(catalogEntry)}">X</button>
												<ul>
													${catalogEntry.children.map(
														(child) =>
															html`<li>
																<span class="${droppableClass}" @dragover=${(e) => onDragOver(e, catalogEntry)} @dragleave=${onDragLeave}
																	>${child.label}</span
																>
															</li>`
													)}
												</ul>
										  `
										: html`<button @click="${() => handleDeleteClick(catalogEntry)}">X</button>`}

									<i class="uil uil-draggabledots"></i>
								</li>
							`
						)}
					</ul>
				</div>
			`;
		}
		return nothing;
	}

	handleTopicChange(event) {
		const selectedTopicId = event.target.value;
		updateStore(selectedTopicId);
	}

	/**
	 * @property {Array} topics = []
	 */
	set topics(value) {
		this.signal(Update_Topics, value);
	}

	get topics() {
		return this.getModel().topics;
	}

	/**
	 * @property {Array} catalogWithResourceData = []
	 */
	set catalogWithResourceData(value) {
		this.signal(Update_CatalogWithResourceData, value);
	}

	get catalogWithResourceData() {
		return this.getModel().catalogWithResourceData;
	}

	/**
	 * @property {Array} layers = []
	 */
	set layers(value) {
		this.signal(Update_Layers, value);
	}

	get layers() {
		return this.getModel().layers;
	}

	/**
	 * @property {string} selectedTheme = []
	 */
	set selectedTopic(value) {
		this.signal(Update_SelectedTopic, value);
	}

	get selectedTopic() {
		return this.getModel().selectedTheme;
	}

	static get tag() {
		return 'ba-layer-tree';
	}
}
