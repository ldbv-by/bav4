import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map';
import { MvuElement } from '../../MvuElement';
import css from './iconselect.css';
import image from './assets/image.svg';
import { $injector } from '../../../injection';

const Update_Title = 'update_title';
const Update_Icons = 'update_icons';
const Update_Value = 'update_value';
const Update_IsCollapsed = 'update_is_collapsed';


const SVG_ENCODING_B64_FLAG = 'data:image/svg+xml;base64,';
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
		const { IconService: iconService } = $injector.inject('IconService');
		this._iconService = iconService;
		this._onSelect = () => { };
	}

	async _loadIcons() {
		const icons = await this._iconService.all();
		if (icons.length) {
			this.signal(Update_Icons, icons);
		}
	}

	_b64EncodeUnicode(unicodeString) {
		return btoa(encodeURIComponent(unicodeString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
			return String.fromCharCode(parseInt(p1, 16));
		}));
	}

	_b64DecodeUnicode(b64String) {
		return decodeURIComponent(Array.prototype.map.call(atob(b64String), (c) => {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
	}

	update(type, data, model) {

		switch (type) {
			case Update_Title:
				return { ...model, title: data };
			case Update_Icons:
				return { ...model, icons: data };
			case Update_Value:
				return { ...model, value: data };
			case Update_IsCollapsed:
				return { ...model, isCollapsed: data };
		}
	}

	/**
	 *
	 * @override
	 */
	createView(model) {

		const iconsAvailable = model.icons.length > 0;
		const getSvgAsBase64Src = (svgSrc) => {
			return SVG_ENCODING_B64_FLAG + this._b64EncodeUnicode(svgSrc);
		};

		const getIcons = () => {
			if (!iconsAvailable) {
				this._loadIcons();
			}
			const icons = [];

			const onClick = (event) => {
				this.signal(Update_Value, event.target.src);
				this.dispatchEvent(new CustomEvent('select', {
					detail: {
						selected: {
							name: event.target.id,
							svg: event.target.src
						}
					}
				}));
				this._onSelect(event);
			};

			model.icons.forEach(iconResult => {
				const isSelectedClass = {
					isselected: model.value === iconResult.name
				};
				const src = getSvgAsBase64Src(iconResult.svg);
				icons.push(html`<img id=${iconResult.name} class='ba_catalog_item ${classMap(isSelectedClass)}'  @click=${onClick} src=${src} >`);
			});
			return html`${icons}`;
		};
		const onClick = () => {
			this.signal(Update_IsCollapsed, !model.isCollapsed);
		};

		const isCollapsedClass = {
			iscollapsed: model.isCollapsed
		};

		// alternative variant without extra button
		return html`
		<style>${css}</style>
		<div class='catalog_header'>
			<ba-icon .icon=${model.value ? model.value : image} .title=${model.title} .disabled=${!iconsAvailable} @click=${onClick}></ba-icon>
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
