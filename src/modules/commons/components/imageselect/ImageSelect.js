import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map';
import { MvuElement } from '../../../MvuElement';
import css from './imageselect.css';
import image from './assets/image.svg';

const Update_Title = 'update_title';
const Update_Images = 'update_images';
const Update_Value = 'update_value';
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
export class ImageSelect extends MvuElement {

	constructor() {
		super({
			title: '',
			images: [],
			value: null,
			isCollapsed: true
		});

		this._onSelect = () => { };
	}

	update(type, data, model) {

		switch (type) {
			case Update_Title:
				return { ...model, title: data };
			case Update_Images:
				return { ...model, images: data };
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

		const imagesAvailable = !model.images.length;
		const getImages = () => {
			if (imagesAvailable) {
				return nothing;
			}
			const images = [];

			const onClick = (event) => {
				this.signal(Update_Value, event.target.src);
				this.dispatchEvent(new CustomEvent('select', {
					detail: { selected: event.target.src }
				}));
				this._onSelect(event);
			};

			model.images.forEach(iconSrc => {
				const isSelectedClass = {
					isselected: model.value === iconSrc
				};
				images.push(html`<img class='ba_catalog_item ${classMap(isSelectedClass)}'  @click=${onClick} src=${iconSrc} >`);
			});
			return html`${images}`;
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
			<ba-icon .icon=${model.value ? model.value : image} .title=${model.title} .disabled=${imagesAvailable} @click=${onClick}></ba-icon>
		</div>
		<div class='ba_catalog_container ${classMap(isCollapsedClass)}'>
		    ${getImages()}
		</div>
		`;
	}

	static get tag() {
		return 'ba-imageselect';
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
		this.signal(Update_Images, value);
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
