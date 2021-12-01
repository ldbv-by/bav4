import { html, nothing } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map.js';
import { MvuElement } from '../../../MvuElement';
import css from './mapContextMenu.css';
import { $injector } from '../../../../injection';
import { close as closeContextMenu } from '../../../../store/mapContextMenu/mapContextMenu.action';
import closeIcon from './assets/x-square.svg';

const Update = 'update';

/**
 *
 * @class
 * @author taulinger
 */
export class MapContextMenu extends MvuElement {

	constructor() {
		super({
			coordinate: null,
			content: null
		});
		const {
			TranslationService: translastionService
		} = $injector.inject('TranslationService');

		this._translationService = translastionService;
	}

	onInitialize() {
		this.observe(state => state.mapContextMenu, data => this.signal(Update, data));
	}

	update(type, data) {
		const { coordinate, content } = data;
		switch (type) {
			case Update:
				return { coordinate: coordinate, content: content };
		}
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


	/**
	 * @override
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { coordinate, content } = model;

		if (!coordinate || !content) {
			return nothing;
		}

		/**
		  * Correct positioning of the context menu is a bit tricky, because we don't know
		  * (and can't calculate) the dimensions of the context menu and its content child before rendering.
		  * Therefore we translate the element after rendering by a css transformation.
		*/
		const sector = this._calculateSector(coordinate);
		//consider css arrow offset of 20px
		const yOffset = (sector < 2 ? 1 : -1) * 20;

		const style = { '--mouse-x': coordinate[0] + 'px', '--mouse-y': coordinate[1] + yOffset + 'px' };
		const sectorClass = 'sector-' + sector;

		return html`
        <style>${css}</style>
		<div class='context-menu ${sectorClass}' style=${styleMap(style)}>
			<div class='header'>${translate('map_contextMenu_header')}<ba-icon class='close-icon' .icon='${closeIcon}' .title=${translate('map_contextMenu_close_button')} .size=${1.5} .color=${'var(--text2)'} .color_hover=${'var(--text2)'} @click=${closeContextMenu}></ba-icon></div>
			${content}
        </div>`;
	}

	static get tag() {
		return 'ba-map-context-menu';
	}
}
