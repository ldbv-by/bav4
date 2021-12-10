import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../MvuElement';
import css from './iconselect.css';
import { $injector } from '../../../injection';
import { IconResult } from '../../../services/IconService';

const Update_Title = 'update_title';
const Update_Icons = 'update_icons';
const Update_Value = 'update_value';
const Update_Color = 'update_color';
const Update_IsCollapsed = 'update_is_collapsed';

/**
 * Component to select a Icon from a List of available Icons
 *
 * Events:
 * - onSelect()
 *
 * Properties:
 * - `value`
 * - `title`
 * - `color`
 * @class
 * @author thiloSchlemmer
 */
export class IconSelect extends MvuElement {

	constructor() {
		super({
			title: '',
			icons: [],
			color: null,
			value: null,
			isCollapsed: true
		});
		const { IconService: iconService, TranslationService: translationService } = $injector.inject('IconService', 'TranslationService');
		this._iconService = iconService;
		this._translationService = translationService;
		this._onSelect = () => { };
	}

	async _loadIcons() {
		const icons = await this._iconService.all();
		if (icons.length) {
			this.signal(Update_Icons, icons);
		}
	}


	update(type, data, model) {

		switch (type) {
			case Update_Title:
				return { ...model, title: data };
			case Update_Icons:
				return { ...model, icons: data };
			case Update_Value:
				return { ...model, value: data };
			case Update_Color:
				return { ...model, color: data };
			case Update_IsCollapsed:
				return { ...model, isCollapsed: data };
		}
	}

	/**
	 *
	 * @override
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const iconsAvailable = model.icons.length > 0;

		const getIcons = () => {
			if (!iconsAvailable) {
				this._loadIcons();
			}

			const onClick = (event) => {
				const selectedIconResult = model.icons.find(iconResult => event.currentTarget.id === 'svg_' + iconResult.id);
				this.signal(Update_Value, selectedIconResult);
				this.dispatchEvent(new CustomEvent('select', {
					detail: {
						selected: selectedIconResult
					}
				}));
				this._onSelect(selectedIconResult);
			};

			const getIcon = (iconResult) => {
				const isSelectedClass = {
					isselected: model.value === iconResult.base64
				};
				return html`<style>svg{fill:${model.color}}</style>
				<div id=svg_${iconResult.id} class='ba_catalog_item ${classMap(isSelectedClass)}' title=${translate('iconSelect_icon_hint')} @click=${onClick}>${unsafeHTML(iconResult.svg)}</div>`;
			};

			return html`${model.icons.map(iconResult => getIcon(iconResult))}`;
		};
		const onClick = () => {
			this.signal(Update_IsCollapsed, !model.isCollapsed);
		};

		const isCollapsedClass = {
			iscollapsed: model.isCollapsed
		};

		const currentIcon = model.value instanceof IconResult ? model.value.base64 : model.value;

		return html`
		<style>${css}</style>
		<div class='catalog_header'>		
			<ba-icon .icon=${currentIcon} .title=${model.title} .color=${model.color} .disabled=${!iconsAvailable} @click=${onClick}></ba-icon>			
		</div>
		<div class='ba_catalog_container ${classMap(isCollapsedClass)}'>
		    ${getIcons()}
		</div>
		`;
	}

	static get tag() {
		return 'ba-iconselect';
	}

	/**
	 * @property {string} title='' - The title of the button
	 */
	set title(value) {
		this.signal(Update_Title, value);
	}

	get title() {
		return this.getModel().title;
	}

	get icons() {
		return this.getModel().icons;
	}

	set color(value) {

		this.signal(Update_Color, value);
	}

	get color() {
		return this.getModel().color;
	}

	set value(value) {
		this.signal(Update_Value, value);
	}

	get value() {
		return this.getModel().value;
	}

	set onSelect(callback) {
		this._onSelect = callback;
	}

	get onSelect() {
		return this._onSelect;
	}
}
