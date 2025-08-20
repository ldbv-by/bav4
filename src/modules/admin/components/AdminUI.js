/**
 * @module modules/admin/components/AdminUI
 */
import css from './adminUI.css';
import { html } from 'lit-html';
import { getTree } from '../catalogTreeMock';
import { MvuElement } from '../../MvuElement';

/**
 * Container element for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class AdminUI extends MvuElement {
	constructor() {
		super({});
	}

	/**
	 * @override
	 */
	onInitialize() {}

	/**
	 * @override
	 */
	createView() {
		const onDragStart = (evt) => {
			evt.dataTransfer.dropEffect = 'move';
			evt.dataTransfer.effectAllowed = 'move';
			//@ts-ignore
			this.shadowRoot.querySelector('ba-catalog').dragContext = { label: 'My DragItem' };
		};

		return html`
			<style>
				${css}
			</style>

			<div class="grid-container">
				<div id="catalog-editor" class="gr50">
					<div class="menu-bar space-between gr100">
						<div class="catalog-select-container">
							<select>
								<option>Catalog A</option>
								<option>Catalog B</option>
								<option>Catalog C</option>
							</select>
						</div>
						<div class="catalog-button-bar">
							<button>Entwurf speichern</button>
							<button>Veröffentlichen</button>
						</div>
					</div>
					<div class="container">
						<ba-catalog .catalogTree=${getTree()}></ba-catalog>
					</div>
				</div>
				<div id="geo-resource-explorer" class="gr25">
					<div class="menu-bar gr100">
						<div class="geo-resource-button-bar">
							<input id="geo-resource-search-input" class="gr75" type="text" placeholder="Geo Resource filtern" />
							<button>Refresh</button>
						</div>
					</div>
					<div id="geo-resource-explorer-content">
						<div draggable="true" class="geo-resource draggable" @dragstart=${onDragStart}>Drag And Drop Resource</div>
						<div draggable="true" class="geo-resource draggable" @dragstart=${onDragStart}>Drag And Drop Resource</div>
						<div draggable="true" class="geo-resource draggable" @dragstart=${onDragStart}>Drag And Drop Resource</div>
					</div>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-admin-ui';
	}
}
