import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { BaElement } from '../../BaElement';
import { contextMenueClose } from '../store/contextMenue.action';
import css from './contextMenue.css';

/**
 * 
 * @class
 * @author thiloSchlemmer
 */
export class ContextMenue extends BaElement {

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

		const placement = { left: undefined, top: undefined };

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
	 * @override
	 */
	onWindowLoad() {
		this._view = this.shadowRoot.getElementById('context-menu');
	}

	/**
	 * @override
	 */
	createView(state) {
		const { pointer, commands } = state;
		const isOpen = pointer !== false;
		const onClick = (command) => {
			command.action();
			contextMenueClose();
		};
		let menuStyle = {};
		if (isOpen) {
			const placement = this._calculateMenuPlacement(pointer);
			menuStyle = { left:placement.left, top:placement.top };
		}

		const classes = {
			context_menu_active:isOpen			
		};
		
		return html`
        <style>${css}</style>
		<nav id=context-menu class='context-menu ${classMap(classes)}' style=${styleMap(menuStyle)} >
			${isOpen ? html`<ul id='context-menu__items' class='context-menu__items'>
				${repeat(commands, (command) => command.label, (command, index) => html`
				<li class='context-menu__item' id='context-menu__item_${index}' title=${command.label} @click=${() => onClick(command)}>
				<div class='context-menu__label'>${command.label}</div>
				<div class='context-menu__shortCut'>${command.shortCut ? command.shortCut : nothing}</div>
				</li>`)}
			</ul>` : nothing}
        </nav>`;
	}

	/**
	 * @override
	 * @param {Object} globalState 
	 */
	extractState(globalState) {
		const { contextMenue: { data } } = globalState;
		return data;
	}


	static get tag() {
		return 'ba-context-menue';
	}
}