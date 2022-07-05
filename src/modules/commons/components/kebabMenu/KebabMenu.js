import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { $injector } from '../../../../injection';
import { emitFixedNotification } from '../../../../store/notifications/notifications.action';
import { MvuElement } from '../../../MvuElement';
import css from './kebabmenu.css';

const Update_IsCollapsed = 'update_is_collapsed';
const Update_Menu_Items = 'update_menu_items';
const Update_Anchor_Position = 'update_last_anchor_position';


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
			isCollapsed: true,
			anchorPosition: null
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
			case Update_Anchor_Position:
				return { ...model, anchorPosition: data };
		}
	}


	/**
 * @override
 */
	createView(model) {
		const { isCollapsed } = model;
		const onClick = (e) => {
			const rect = this.getBoundingClientRect();
			const delta = [e.x - e.offsetX, e.y - e.offsetY];
			this.signal(Update_Anchor_Position, { absolute: [rect.x, rect.y], relative: [rect.x - delta[0], rect.y - delta[1]] });
			this.signal(Update_IsCollapsed, !isCollapsed);
		};

		const menu = isCollapsed ? nothing : this._getMenuOrFixedNotification(model);
		return html`
		 <style>${css}</style> 
         <button class='anchor'>
            <span id="kebab-icon" data-test-id class='kebabmenu__button' @click=${onClick} >
            </span>
         </button>	         
         ${menu}
     </div>`;
	}

	_getMenuOrFixedNotification(model) {
		const { isCollapsed, menuItems, anchorPosition } = model;

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		if (environmentService.isTouch()) {
			emitFixedNotification(this._getItems(menuItems));
			return nothing;
		}

		const sector = anchorPosition ? this._calculateSector(anchorPosition.absolute) : 0;

		//consider css arrow offset of 10px
		const yOffset = (sector < 2 ? 0 : -1) * 35;
		const xOffset = (sector === 1 || sector === 2 ? 1 : 0) * 35;

		const style = anchorPosition ? { '--anchor-x': anchorPosition.relative[0] + xOffset + 'px', '--anchor-y': anchorPosition.relative[1] + yOffset + 'px' } : {};

		const classes = {
			iscollapsed: isCollapsed,
			sector0: sector === 0,
			sector1: sector === 1,
			sector2: sector === 2,
			sector3: sector === 3
		};

		return html`<div class='menu__container ${classMap(classes)}' style=${styleMap(style)}'>
             ${isCollapsed ? '' : this._getItems(menuItems)} 
             </div>`;

	}

	_calculateSector(coordinate) {
		const widthBorder = window.innerWidth * .66;
		const heightBorder = window.innerHeight * .66;

		//window sector the click event occurred:
		//0-1
		//3-2

		if (coordinate[0] <= widthBorder && coordinate[1] <= heightBorder) {
			return 0;
		}
		else if (coordinate[0] > widthBorder && coordinate[1] <= heightBorder) {
			return 1;
		}
		else if (coordinate[0] > widthBorder && coordinate[1] > heightBorder) {
			return 2;
		}
		return 3;
	}

	_getItems(menuItems) {
		const toHtml = (menuItem) => {
			const { label, icon, action, disabled } = menuItem;

			const getIcon = () => {
				const createBaIcon = () => html`<ba-icon .icon='${icon}' .title=${label} ></ba-icon>`;
				const createPlaceholder = () => html`<div class='menu_icon_placeholder'></div>`;
				return icon ? createBaIcon() : createPlaceholder();
			};

			const classes = {
				isdisabled: disabled
			};

			return html`            			
			<div class='menuitem ${classMap(classes)}' @click=${action}>
			${getIcon()}
			<span>${label}</span>
			</div>`;
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
