/**
 * @module modules/commons/components/overflowMenu/OverflowMenu
 */
import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './overflowmenu.css';
import itemcss from './menuitem.css';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';
import { closeBottomSheet, openBottomSheet } from '../../../../store/bottomSheet/bottomSheet.action';

const Update_IsCollapsed = 'update_is_collapsed';
const Update_Menu_Type = 'update_menu_type';
const Update_Menu_Items = 'update_menu_items';
const Update_Anchor_Position = 'update_last_anchor_position';

/**
 * @typedef {Object} MenuOption
 * @property {string} label the label of the menu item
 * @property {string} [id] the id of the menu item
 * @property {string} [icon] the icon of the menu item; Data-URI of Base64 encoded SVG
 * @property {function} [action] the action to perform, when user press the menu item
 * @property {boolean} [disabled] whether or not the menu item is enabled
 * @property {boolean} [isDivider] whether or not the menu item stands for a divider
 */

const DefaultMenuOption = { label: null, icon: null, action: null, disabled: false, isDivider: false };

/**
 * @readonly
 * @enum {String}
 */
export const MenuTypes = Object.freeze({
	MEATBALL: 'meatball',
	KEBAB: 'kebab'
});

/**
 *
 * Properties:
 * - `items`
 * - `type`
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
		this._documentListener = { pointerdown: null, pointerup: null };
	}

	onInitialize() {
		this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');
	}

	update(type, data, model) {
		switch (type) {
			case Update_IsCollapsed:
				return { ...model, isCollapsed: data };
			case Update_Menu_Type:
				return { ...model, type: data };
			case Update_Menu_Items:
				return {
					...model,
					menuItems: data.map((i) => {
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
			if (isCollapsed) {
				this._registerDocumentListener('pointerdown');
				this._registerDocumentListener('pointerup');
			} else {
				this._deregisterDocumentListener('pointerdown');
				this._deregisterDocumentListener('pointerup');
			}
			const rect = this.getBoundingClientRect();
			const delta = [e.x - e.offsetX, e.y - e.offsetY];
			this.signal(Update_Anchor_Position, { absolute: [rect.x, rect.y], relative: [rect.x - delta[0], rect.y - delta[1]] });

			this.signal(Update_IsCollapsed, !isCollapsed);
		};

		const menu = this._getMenuOrFixedNotification(model);
		return html`
		 <style>${css}</style> 
         <button class='anchor'>
            <span id="menu-icon" data-test-id class='menu__button ${type} ' @click=${onClick} >
            </span>
			${menu}
			</button>				      
     </div>`;
	}

	_getMenuOrFixedNotification(model) {
		const { isCollapsed, menuItems, anchorPosition } = model;

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		if (environmentService.isTouch()) {
			if (isCollapsed) {
				closeBottomSheet();
			} else {
				openBottomSheet(this._getItems(menuItems));
			}
			return nothing;
		}

		/**
		 * Correct positioning of the menu is (analog to the context menu) a bit tricky, because we don't know
		 * (and can't calculate) the dimensions of the menu and its content child before rendering.
		 * Therefore we translate the element after rendering by a css transformation. We have to take the
		 * size of the web component itself into account as a offset vor the calculated anchor-position.
		 */
		const sector = anchorPosition ? this._calculateSector(anchorPosition.absolute) : 0;

		const getVector = () => {
			return {
				x: sector === 1 || sector === 2 ? 1 : 0,
				y: sector < 2 ? 0 : -1
			};
		};

		const getAnchor = () => {
			//consider css offset of this web component
			const offset = 35; //px
			const vector = getVector();
			return {
				'--anchor-x': vector.x * (anchorPosition.relative[0] + offset) + 'px',
				'--anchor-y': vector.y * (anchorPosition.relative[1] + offset) + 'px'
			};
		};

		const style = anchorPosition ? getAnchor() : {};

		const classes = {
			collapsed: isCollapsed,
			sector0: sector === 0,
			sector1: sector === 1,
			sector2: sector === 2,
			sector3: sector === 3
		};

		return html`<div class='menu__container ${classMap(classes)}' style=${styleMap(style)}'>
             ${isCollapsed ? '' : this._getItems(menuItems)} 
             </div>`;
	}

	_registerDocumentListener(type) {
		const handler = (e) => {
			const path = e.composedPath();
			if (!path.includes(this)) {
				this._closeMenu();
			}
		};
		this._documentListener[type] = handler;
		document.addEventListener(type, handler);
	}

	_deregisterDocumentListener(type) {
		document.removeEventListener(type, this._documentListener[type]);
		this._documentListener[type] = null;
	}

	_closeMenu() {
		this._deregisterDocumentListener('pointerdown');
		this._deregisterDocumentListener('pointerup');

		const closeTouch = () => {
			closeBottomSheet();
			this.signal(Update_IsCollapsed, true);
		};
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		const closeAction = environmentService.isTouch() ? closeTouch : () => this.signal(Update_IsCollapsed, true);

		closeAction();
	}

	_calculateSector(coordinate) {
		const widthBorder = window.innerWidth * 0.66;
		const heightBorder = window.innerHeight * 0.66;

		//window sector the click event occurred:
		//0-1
		//3-2

		if (coordinate[0] <= widthBorder && coordinate[1] <= heightBorder) {
			return 0;
		} else if (coordinate[0] > widthBorder && coordinate[1] <= heightBorder) {
			return 1;
		} else if (coordinate[0] > widthBorder && coordinate[1] > heightBorder) {
			return 2;
		}
		return 3;
	}

	_getItems(menuItems) {
		const toHtml = (menuItem, id) => {
			const { id: customId, label, icon, action, disabled } = menuItem;
			const menuitemId = customId ? `menuitem_${customId}` : `menuitem_${id}`;

			const getIcon = (id) => {
				const createIcon = () => {
					const iconClassName = `menuitem__icon_${id}`;
					const iconClass = `.${iconClassName} { mask : url(${icon});-webkit-mask-image : url(${icon});mask-size:cover;-webkit-mask-size:cover;}`;
					return html` <style>
							${iconClass}
						</style>
						<div class="menuitem__icon ${iconClassName}"></div>`;
				};
				const createPlaceholder = () => html`<div></div>`;
				return icon ? createIcon() : createPlaceholder();
			};

			const onPointerDown = () => {
				this._deregisterDocumentListener('pointerdown');
			};

			const onClick = (e) => {
				this._deregisterDocumentListener('pointerdown');
				this._deregisterDocumentListener('pointerup');
				e.stopPropagation();
				this._closeMenu();
				action();
			};

			const onPointerUp = (e) => {
				// stop any further event propagation to give the followed click-event a chance to fire and to be handled by the button
				e.preventDefault();
				e.stopPropagation();
			};

			const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

			const classes = {
				touch: environmentService.isTouch()
			};
			return html` <button
				id=${menuitemId}
				data-test-id
				class="menuitem ${classMap(classes)}"
				?disabled=${disabled}
				@pointerdown=${onPointerDown}
				@click=${onClick}
				@pointerup=${onPointerUp}
			>
				${getIcon(customId ? customId : id)}
				<div class="menuitem__text">${label}</div>
			</button>`;
		};

		return html`<style>
				${itemcss}</style
			>${menuItems.map((menuItem, index) => toHtml(menuItem, index))}`;
	}

	/**
	 * @property {Array<MenuOption>} items - an array of {@see MenuOption} to build the menu items from
	 */
	set items(menuItemOptions) {
		this.signal(Update_Menu_Items, menuItemOptions);
	}

	/**
	 * @property {'meatball'|'kebab'} type - the type of the menu icon
	 */
	set type(typeValue) {
		this.signal(Update_Menu_Type, typeValue);
	}

	static get tag() {
		return 'ba-overflow-menu';
	}
}
