import { html } from 'lit-html';
import { BaElement } from '../BaElement';
import css from './contextMenue.css';


/**
 * 
 * @class
 * @author thiloSchlemmer
 */
export class ContextMenue extends BaElement {


	constructor() {
		super();
	}

	_buildContextMenue(pointer, commands) {
		console.log('try to build ContextMenu-Entries');
		this._view.style.left = pointer.x + 'px';
		this._view.style.top = pointer.y + 'px';
		console.log(pointer);

		this._clearContextItems();
		let ulElement = document.createElement('ul');
		ulElement.setAttribute('id', 'context-menu__items');
		ulElement.setAttribute('class', 'context-menu__items');
		this._view.appendChild(ulElement);

		commands.forEach((command) => {
			let liElement = document.createElement('li');
			liElement.setAttribute('class', 'context-menu__item');
			liElement.setAttribute('id', 'context-menu__item');
			liElement.insertAdjacentText('beforeend', command.label);
			liElement.addEventListener('click', command.action);

			ulElement.appendChild(liElement);
		});

		this._view.classList.add('context-menu--active');
	}

	_closeContextMenu() {
		console.log('try to close ContextMenu');
		this._view.classList.remove('context-menu--active');
		this._clearContextItems();
	}

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
		this.log('contextmenu state changed by store');
		if (pointer) {
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