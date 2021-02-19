import { html, nothing } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map.js';
import { BaElement } from '../../../BaElement';
import css from './mapContextMenu.css';
import { $injector } from '../../../../injection';
import { close as closeContextMenu } from '../../store/mapContextMenu.action';

import closeIcon from './assets/x-square.svg';

/**
 * 
 * @class
 */
export class MapContextMenu extends BaElement {

	constructor() {
		super();
		const {
			TranslationService: translastionService
		} = $injector.inject('TranslationService');

		this._translationService = translastionService;
	}


	_calculateParameter(coordinate, element) {
		//alignment: location of the event coordinate relative to the menu
		const values = { left: 0, top: 0, vAlignment: 'left', hAlignment: 'top' };
		if (!element || !coordinate) {
			return values;
		}

		//see: css classes
		const vOffset = 20;
		const offsetBorderInPercent = 0.2;
		const menuWidth = element.offsetWidth;
		const menuHeight = element.offsetHeight + vOffset;
		const windowWidth = window.innerWidth - (window.innerWidth * offsetBorderInPercent);
		const windowHeight = window.innerHeight - (window.innerHeight * offsetBorderInPercent);

		if ((windowWidth - coordinate[0]) < menuWidth) {
			values.vAlignment = 'right';
			values.left = coordinate[0] - menuWidth + 'px';
		}
		else {
			values.vAlignment = 'left';
			values.left = coordinate[0] + 'px';
		}
		if ((windowHeight - coordinate[1]) < menuHeight) {
			values.hAlignment = 'bottom';
			values.top = coordinate[1] - menuHeight + 'px';
		}
		else {
			values.hAlignment = 'top';
			values.top = coordinate[1] + vOffset + 'px';
		}
		return values;
	}

	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);
		const { coordinate, id } = this._state;

		const parameters = this._calculateParameter(coordinate, this._root.querySelector('.context-menu'));
		const style = { left: parameters.left, top: parameters.top };
		const getClasses = () => {
			const classes = [];
			if (coordinate) {
				classes.push('active');
			}
			classes.push(parameters.hAlignment + '-' + parameters.vAlignment);
			return classes.join(' ');
		};


		//get content element
		const content = coordinate ? document.getElementById(id) : nothing;

		//extract content element from the dom and render it here 
		//see: https://lit-html.polymer-project.org/guide/template-reference#supported-data-types-for-text-bindings -> Node
		return html`
        <style>${css}</style>
		<div class='context-menu $ ${getClasses()}' style=${styleMap(style)}>
			<div class='header'>${translate('map_context_menu_header')}<ba-icon class='close' icon='${closeIcon}' title=${translate('map_context_menu_close_button')} size=20 color='white'} @click=${closeContextMenu}></ba-icon></div>
			${content}
        </div>`;

	}

	/**
	 * @override
	 * @param {Object} store 
	 */
	extractState(store) {
		const { mapContextMenu: { coordinate, id } } = store;
		return { coordinate, id };
	}

	static get tag() {
		return 'ba-map-context-menu';
	}
}