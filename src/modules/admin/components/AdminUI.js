/**
 * @module modules/admin/components/AdminUI
 */
import css from './adminUI.css';
import { html } from 'lit-html';
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
	update(type, data, model) {}

	/**
	 * @override
	 */
	createView(model) {
		const onDragStart = (evt) => {
			evt.dataTransfer.dropEffect = 'move';
			evt.dataTransfer.effectAllowed = 'move';
			console.log('Drag start');
		};

		return html`
			<style>
				${css}
			</style>

			<div class="grid-container">
				<div id="theme-tree-editor" class="gr50">
					<div class="menu-bar space-between gr100">
						<div class="theme-tree-select-container">
							<select>
								<option>Tree A</option>
								<option>Tree B</option>
								<option>Tree C</option>
							</select>
						</div>
						<div class="theme-button-bar">
							<button>Speichern</button>
							<button>Veröffentlichen</button>
						</div>
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
						<div draggable="true" class="geo-resource draggable" @dragstart=${onDragStart}>Drag And Drop Resource</div>
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
