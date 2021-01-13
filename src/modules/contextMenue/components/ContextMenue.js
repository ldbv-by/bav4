import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { contextMenueClose } from '../store/contextMenue.action';
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
	  * @private 
	  */
	_buildContextMenue(pointer, commands) {
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

		const menuPlacement = this._calculateMenuPlacement(pointer);

		this._view.style.left = menuPlacement.left;
		this._view.style.top = menuPlacement.top;
		this._view.classList.add('context-menu--active');
	}

	/**
	 * Calculates the placement of the menu inside the window.
	 * If the needed space of the menu is in conflict with the
	 * existing space on the bottom or on the right side of the 
	 * baseCoordinate, then the placement will be adjusted accordingly.
	 * @private   
	 */
	_calculateMenuPlacement(baseCoordinate) {
		const offset = 5;
		const offsetBorderInPercent = 0.2;
		const menuWidth = this._view.offsetWidth + offset;
		const menuHeight = this._view.offsetHeight + offset;

		let placement = { left: undefined, top: undefined };

		const windowWidth = window.innerWidth - (window.innerWidth * offsetBorderInPercent);
		const windowHeight = window.innerHeight - (window.innerHeight * offsetBorderInPercent);

		if ((windowWidth - baseCoordinate.x) < menuWidth) {
			placement.left = baseCoordinate.x - menuWidth + 'px';
		}
		else {
			placement.left = baseCoordinate.x + offset + 'px';
		}
		if ((windowHeight - baseCoordinate.y) < menuHeight) {
			placement.top = baseCoordinate.y - menuHeight + 'px';
		}
		else {
			placement.top = baseCoordinate.y + offset + 'px';
		}
		return placement;
	}

	/**
	 * Creates a ListItem-Element with label and shortcut Sub-Element (div) 
	 * @private 
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
	 * @private 
	 */
	_createContextMenu() {
		let ulElement = document.createElement('ul');
		ulElement.setAttribute('id', 'context-menu__items');
		ulElement.setAttribute('class', 'context-menu__items');

		return ulElement;
	}

	/**
	 * Tests whether or not, the context menu is open
	 * @private 
	 */
	_isOpen() {
		const { pointer } = this._state;
		return pointer !== false;
	}


	/**
	 * Closed the context menu by removing class-name and inner content 
	 * @private
	 */
	_closeContextMenu() {
		this._view.classList.remove('context-menu--active');
		this._clearContextItems();
		document.removeEventListener('click', () => this._closeContextMenu());
		contextMenueClose();
	}

	/**
	 * Removes the inner content (menu items)
	 * @private
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