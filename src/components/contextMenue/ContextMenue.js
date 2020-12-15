import { html } from 'lit-html';
import { BaElement } from '../BaElement';
import { contextMenueClose } from './store/contextMenue.action';
import css from './contextMenue.css';


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
		this._view.style.left = pointer.x + 'px';
		this._view.style.top = pointer.y + 'px';

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
		return this._view.querySelector('.context-menu--active') !== null;
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
		const menuItems = this._view.querySelector('.context-menu__items');
		if (menuItems) {
			this._view.removeChild(menuItems);
		}
	}

	/**
	 * @override
	 */
	onWindowLoad() {
		this._view = this._root.querySelector('.context-menu');
	}

	/**
	 * @override
	 */
	createView() {
		return html`
        <style>${css}</style>
        <nav class="context-menu">
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
		const { pointer, commands } = this._state;
		if (pointer && !this._isOpen()) {
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