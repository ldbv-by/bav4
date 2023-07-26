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

	onInitialize() {
		// this._getCategoryOptions();

		const xxx = () => {
			const droppables = this.shadowRoot.querySelectorAll('span');
			console.log('🚀 ~ LayerTree ~ createView ~ this.shadowRoot:', this.shadowRoot);
			console.log('🚀 ~ LayerTree ~ createView ~ droppables:', droppables);

			for (let i = 0; i < droppables.length; i++) {
				droppables[i].addEventListener('dragover', function (event) {
					event.preventDefault();
					// @ts-ignore
					event.target.classList.add('drag-over');
				});

				droppables[i].addEventListener('dragleave', function (event) {
					// @ts-ignore
					event.target.classList.remove('drag-over');
				});

				// @ts-ignore
			}
		};
		xxx();
	}

	update(type, data, model) {
		switch (type) {
			case Update_SelectedTopic:
				return { ...model, selectedTopicId: data };
			case Update_Topics:
				return { ...model, topics: data };
			case Update_CatalogWithResourceData:
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

		const handleCategoryClick = (event) => {
			const li = event.currentTarget;

			const ul = li.querySelector('ul'); // Get the child <ul> element

			if (ul) {
				li.classList.toggle(showChildrenClass);
			}
		};

		const onDragOver = (e, catalogEntry) => {
			console.log('🚀 ~ LayerTree ~ onDragOver ~ catalogEntry:', catalogEntry);
			e.target.classList.remove('isdragged');
			e.target.classList.add('drag-over');
			e.preventDefault();
			const droppables = this.shadowRoot.querySelectorAll('span.droppable');
			console.log('🚀 ~ LayerTree ~ onDragOver ~ droppables:', droppables);
		};

		const onDragLeave = (e) => {
			console.log('🚀 ~ LayerTree ~ onDragOver ~ e:', e);
			e.target.classList.add('isdragged');
			e.target.classList.remove('drag-over');
			e.preventDefault();
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
								<li @click="${handleCategoryClick}">
									<span
										class="${catalogEntry.children ? hasChildrenClass + ' ' + droppableClass : ''}"
										@dragover=${(e) => onDragOver(e, catalogEntry)}
										@dragleave=${onDragLeave}
										>${catalogEntry.label}</span
									>
									${catalogEntry.children
										? html`
												<ul>
													${catalogEntry.children.map((child) => html`<li>${child.label}</li>`)}
												</ul>
										  `
										: ''}
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
