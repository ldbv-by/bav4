import { html } from 'lit-html';
import { BaElement } from '../BaElement';
import { contextMenueClose } from './store/contextMenue.action';
import css from './contextMenue.css';

const NO_CONTENT = '';

/**
 * 
 * @class
 * @author thiloSchlemmer
 */
export class ContextMenue extends BaElement {


	/**
	  * Builds the content of the contextmenu based on the commands 
	  * @param {object {x: number, y: number}} pointer the pointer where user has clicked (rightclick)
	  * @param { Array { 
	  * 			label: string, 
	  * 			shortCut: string,
	  * 			action: function
	  * 		} } commands the list of command-objects
	  */
	_buildContextMenue(pointer, commands) {
		const offset = 5;
		this._view.style.left = pointer.x + offset + 'px';
		this._view.style.top = pointer.y + offset + 'px';

		this._clearContextItems();

		const menu = this._createContextMenu();
		this._view.appendChild(menu);

		commands.forEach((command) => {
			const menuItem = this._createContextMenuItem(command);
			menuItem.addEventListener('click', () => {
				command.action();
				this._closeContextMenu();
			});
			menu.appendChild(menuItem);
		});
		document.addEventListener('click', () => this._closeContextMenu());

		this._view.classList.add('context-menu--active');
	}

	/**
	 * Creates a ListItem-Element with label and shortcut Sub-Element (div) 
	 * @param {object {label: string, shortCut: string, action: function}} command   the command-object
	 * @returns {HTMLElement}
	 */
	_createContextMenuItem(command) {
		const label = command.label;
		const shortCut = command.shortCut;
		let liElement = document.createElement('li');
		liElement.setAttribute('class', 'context-menu__item');
		liElement.setAttribute('id', 'context-menu__item');

		let labelElement = document.createElement('div');
		labelElement.setAttribute('class', 'context-menu__label');

		if (typeof label === 'string' || label instanceof String) {
			labelElement.insertAdjacentText('beforeend', label);
		}
		else {
			labelElement.insertAdjacentText('beforeend', label.toString());
		}

		let shortCutElement = document.createElement('div');
		shortCutElement.setAttribute('class', 'context-menu__shortCut');
		if (shortCut) {
			shortCutElement.insertAdjacentText('beforeend', shortCut);
		}
		else {
			shortCutElement.insertAdjacentText('beforeend', '');
		}

		liElement.appendChild(labelElement);
		liElement.appendChild(shortCutElement);
		return liElement;
	}

	/**
	 * Creates a UnorderedList-Element
	 * @returns {HTMLElement}
	 */
	_createContextMenu() {
		let ulElement = document.createElement('ul');
		ulElement.setAttribute('id', 'context-menu__items');
		ulElement.setAttribute('class', 'context-menu__items');

		return ulElement;
	}

	/**
	 * Tests whether or not, the context menu is open
	 * @returns {boolean}
	 */
	_isOpen() {
		const { pointer } = this._state;
		return pointer !== false;
	}


	/**
	 * Closed the context menu by removing class-name and inner content 
	 */
	_closeContextMenu() {
		this._view.classList.remove('context-menu--active');
		this._clearContextItems();
		contextMenueClose();
	}

	/**
	 * Removes the inner content (menu items)
	 */
	_clearContextItems() {
		this._view.textContent = NO_CONTENT;
	}

	/**
	 * @override
	 */
	onWindowLoad() {
		this._view = this.shadowRoot.getElementById('context-menu');
	}

	/**
	 * @override
	 */
	createView() {
		return html`
        <style>${css}</style>
        <nav id=context-menu class="context-menu">
        </nav>`;
	}

	/**
	 * @override
	 * @param {Object} store 
	 */
	extractState(store) {
		const { contextMenue: { data } } = store;
		return data;
	}

	/**
	 * @override
	 */
	onStateChanged() {
		if (this._isOpen()) {
			const { pointer, commands } = this._state;
			this._buildContextMenue(pointer, commands);
		}
		else {
			this._closeContextMenu();
		}
	}

	static get tag() {
		return 'ba-context-menue';
	}
}