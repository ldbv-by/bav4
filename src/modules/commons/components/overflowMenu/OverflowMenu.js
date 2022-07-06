import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { $injector } from '../../../../injection';
import { clearFixedNotification, emitFixedNotification } from '../../../../store/notifications/notifications.action';
import { MvuElement } from '../../../MvuElement';
import css from './overflowmenu.css';
import itemcss from './menuitem.css';

const Update_IsCollapsed = 'update_is_collapsed';
const Update_Menu_Type = 'update_menu_type';
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
 * @enum
 */
export const MenuTypes = Object.freeze({
	MEATBALL: 'meatball',
	KEBAB: 'kebab',
	valueOf: raw => {
		switch (raw) {
			case 'meatball':
				return MenuTypes.MEATBALL;
			case 'kebab':
				return MenuTypes.KEBAB;
		}
		return null;
	}
});

/**
 *
 * @class
 * @author thiloSchlemmer
 */
export class OverflowMenu extends MvuElement {

	constructor() {
		super({
			type: MenuTypes.MEATBALL,
			menuItems: [],
			isCollapsed: true,
			anchorPosition: null
		});

	}

	update(type, data, model) {
		switch (type) {
			case Update_IsCollapsed:
				return { ...model, isCollapsed: data };
			case Update_Menu_Type:
				return { ...model, type: data };
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
		const { isCollapsed, type } = model;
		const onClick = (e) => {
			e.preventDefault();
			e.stopPropagation();
			const rect = this.getBoundingClientRect();
			const delta = [e.x - e.offsetX, e.y - e.offsetY];
			this.signal(Update_Anchor_Position, { absolute: [rect.x, rect.y], relative: [rect.x - delta[0], rect.y - delta[1]] });
			this.signal(Update_IsCollapsed, !isCollapsed);

			this._registerDocumentListener();
		};

		const menu = isCollapsed ? nothing : this._getMenuOrFixedNotification(model);
		return html`
		 <style>${css}</style> 
         <button class='anchor'>
            <span id="menu-icon" data-test-id class='menu__button ${type} ' @click=${onClick} >
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

	_registerDocumentListener() {
		const handler = () => {
			document.removeEventListener('pointerup', handler);
			const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
			const closeAction = environmentService.isTouch() ? clearFixedNotification : () => this.signal(Update_IsCollapsed, true);

			closeAction();
		};

		document.addEventListener('pointerup', handler);
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
		const toHtml = (menuItem, id) => {
			const { label, icon, action, disabled } = menuItem;

			const getIcon = (id) => {
				const createIcon = () => {
					const iconClassName = `menuitem__icon_${id}`;
					const iconClass = `.${iconClassName} { mask : url(${icon});-webkit-mask-image : url(${icon});mask-size:cover;-webkit-mask-size:cover;}`;
					return html`
					<style>
					${iconClass}
					</style>
					<div class='menuitem__icon ${iconClassName}' ></div>`;
				};
				const createPlaceholder = () => html`<div></div>`;
				return icon ? createIcon() : createPlaceholder();
			};

			return html`            			
			<button class='menuitem' ?disabled=${disabled} .title=${label} @pointerdown=${action}>
				${getIcon(id)}
				<div class="menuitem__text">${label}</div>
			</button>`;
		};

		return html`<style>${itemcss}
		</style>${menuItems.map((menuItem, index) => toHtml(menuItem, index))}`;
	}

	set items(menuItemOptions) {
		this.signal(Update_Menu_Items, menuItemOptions);
	}

	set type(typeValue) {

		const type = MenuTypes.valueOf(typeValue);
		if (type) {
			this.signal(Update_Menu_Type, type);
		}
	}

	static get tag() {
		return 'ba-overflow-menu';
	}
}
