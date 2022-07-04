import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';
import css from './kebabmenu.css';

const Update_IsCollapsed = 'update_is_collapsed';
const Update_Menu_Items = 'update_menu_items';


/**
 * @typedef {Object} MenuOption
 * @property {string} label the label of the menu item
 * @property {string} [icon] the icon of the menu item; Data-URI of Base64 encoded SVG
 * @property {function} [action] the action to perform, when user press the menu item
 * @property {boolean} [disabled] whether or not the menu item is enabled
 * @property {boolean} [isDivider] whether or not the menu item stands for a divider
 */


const DefaultMenuOption = { label: null, icon: null, action: null, disabled: false, isDivider: false };
/**
 *
 * @class
 * @author thiloSchlemmer
 */
export class KebabMenu extends MvuElement {

	constructor() {
		super({
			menuItems: [],
			isCollapsed: true
		});

	}

	update(type, data, model) {

		switch (type) {
			case Update_IsCollapsed:
				return { ...model, isCollapsed: data };
			case Update_Menu_Items:
				return {
					...model, menuItems: data.map(i => {
						return { ...DefaultMenuOption, ...i };
					})
				};
		}
	}


	/**
 * @override
 */
	createView(model) {
		const { isCollapsed, menuItems } = model;
		const onClick = () => {
			this.signal(Update_IsCollapsed, !isCollapsed);
		};

		const isCollapsedClass = {
			iscollapsed: isCollapsed
		};
		return html`
		 <style>${css}</style> 
         <button id="kebab-icon" data-test-id class='kebabmenu__button' @click=${onClick} ></button>	         
         <div class='kebab__container ${classMap(isCollapsedClass)}'>
             ${isCollapsed ? '' : this._getItems(menuItems)}
         </div>
     </div>
		`;
	}

	/**
 *
 * @param {Array<MenuItemOption>} menuItems
 * @returns
 */
	_getItems(menuItems) {
		const toHtml = (menuItem) => {
			const { label, icon, action, disabled } = menuItem;

			const customIconClass = icon ? `.icon-custom {
                mask : url("${icon}");
                -webkit-mask-image : url("${icon}");
            }` : '';

			const isDisabledClass = {
				isdisabled: disabled
			};

			return html`
            <style>
            ${customIconClass}
            </style>
            <div class='menuitem icon-custom ${classMap(isDisabledClass)}' @click=${action}>${label}</div>`;
		};

		return menuItems.map(menuItem => toHtml(menuItem));
	}

	set items(menuItemOptions) {
		this.signal(Update_Menu_Items, menuItemOptions);
	}

	static get tag() {
		return 'ba-kebab';
	}
}
