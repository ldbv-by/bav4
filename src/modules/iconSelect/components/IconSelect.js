import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { classMap } from 'lit-html/directives/class-map';
import { MvuElement } from '../../MvuElement';
import css from './iconselect.css';
import image from './assets/image.svg';
import { $injector } from '../../../injection';
import { IconResult } from '../services/IconService';

const Update_Title = 'update_title';
const Update_Icons = 'update_icons';
const Update_Value = 'update_value';
const Update_Color = 'update_color';
const Update_IsCollapsed = 'update_is_collapsed';

/**
 * Events:
 * - onSelect()
 *
 * Properties:
 * - `images`
 * - `value`
 * - `title`

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
				const selectedIconResult = model.icons.find(iconResult => event.currentTarget.id === 'svg_' + iconResult.name);
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
					isselected: model.value === iconResult.toBase64()
				};
				return html`<style>svg{fill:${model.color}}</style>
				<div id=svg_${iconResult.name} class='ba_catalog_item ${classMap(isSelectedClass)}' @click=${onClick}>${unsafeHTML(iconResult.svg)}</div>`;
			};

			return html`${model.icons.map(iconResult => getIcon(iconResult))}`;
		};
		const onClick = () => {
			this.signal(Update_IsCollapsed, !model.isCollapsed);
		};

		const isCollapsedClass = {
			iscollapsed: model.isCollapsed
		};

		const currentIcon = model.value ? (typeof(model.value) === IconResult ? model.value.toBase64() : model.value) : image;
		return html`
		<style>${css}</style>
		<div class='catalog_header'>		
			<ba-icon .icon=${currentIcon} .title=${model.title} .color=${model.color} .disabled=${!iconsAvailable} @click=${onClick}></ba-icon>
			${model.value ? nothing : html`<span class='icon_hint'>${translate('iconSelect_icon_hint')}</span>`}
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

	set images(value) {
		this.signal(Update_Icons, value);
	}

	get images() {
		return this.getModel().images;
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
