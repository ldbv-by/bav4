/**
 * @module modules/geoResourceInfo/components/LastModifiedItem
 */
import { html, nothing } from '../../../../node_modules/lit-html/lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../injection/index';
import { isNumber } from '../../../utils/checks';
import { MvuElement } from '../../MvuElement';
import css from './lastModifiedItem.css';

const UPDATE_GEORESOURCE_ID = 'update_georesource_id';
const UPDATE_LAST_MODIFIED = 'update_last_modified';

const getInfoGraphicShare = (original_text, copy_text) =>
	`<svg version="1.1" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg"><path id="path_original" d="m0.97402 40.402h95.28" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><path id="path_copy" d="m96.716 10.901c-32.446 0-42.648 29.497-66.245 29.497l-29.613-0.053213" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><circle id="circle_copy" cx="102.79" cy="10.826" r="8.2623" style="fill:#099ddc;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><circle cx="15.722" cy="40.398" r="8.2623" style="fill:#099ddc;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><g id="circle_original"><circle cx="102.79" cy="40.398" r="8.2623" style="fill:#099ddc;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><g transform="matrix(.62516 0 0 .62516 97.514 35.192)" style="fill:currentColor"><path d="m7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6a2.24 2.24 0 0 1-0.216-1c0-1.355 0.68-2.75 1.936-3.72a6.3 6.3 0 0 0-1.936-0.28c-4 0-5 3-5 4s1 1 1 1zm-0.716-6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/></g></g><text id="text_original" x="116.25132" y="46.129955" style="fill:currentColor;font-family:Sans;font-size:13.333px;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;letter-spacing:0px;line-height:125%;stroke-width:.61246px;word-spacing:0px" xml:space="preserve"><tspan>${original_text}</tspan></text><text id="text_copy" x="116.25132" y="14.129955" style="fill:currentColor;font-family:Sans;font-size:13.333px;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;letter-spacing:0px;line-height:125%;stroke-width:.61246px;word-spacing:0px" xml:space="preserve"><tspan>${copy_text}</tspan></text></svg>`;

export class LastModifiedItem extends MvuElement {
	#translationService;
	#fileStorageService;
	#geoResourceService;

	constructor() {
		super({ geoResourceId: null, lastModified: null });
		const {
			TranslationService: translationService,
			FileStorageService: fileStorageService,
			GeoResourceService: geoResourceService
		} = $injector.inject('TranslationService', 'FileStorageService', 'GeoResourceService');
		this.#translationService = translationService;
		this.#fileStorageService = fileStorageService;
		this.#geoResourceService = geoResourceService;
	}
	update(type, data, model) {
		switch (type) {
			case UPDATE_GEORESOURCE_ID:
				return { ...model, geoResourceId: data };
			case UPDATE_LAST_MODIFIED:
				return { ...model, lastModified: data };
		}
	}

	/**
	 *@override
	 */
	createView(model) {
		const { geoResourceId, lastModified } = model;
		const geoResource = this.#geoResourceService.byId(geoResourceId);

		if (geoResourceId && isNumber(lastModified)) {
			const getDescription = (geoResourceId) => {
				if (this.#fileStorageService.isFileId(geoResourceId)) {
					return [
						this.#translationService.translate('geoResourceInfo_last_modified_description'),
						this.#translationService.translate(
							`geoResourceInfo_last_modified_description_${geoResource.collaborativeData ? 'collaborative' : 'copy'}`
						)
					].join(' ');
				}
				return nothing;
			};

			const getInfoGraphic = (geoResourceId) => {
				if (this.#fileStorageService.isFileId(geoResourceId)) {
					return html`${unsafeHTML(
						getInfoGraphicShare(
							this.#translationService.translate('geoResourceInfo_infographic_collaboration_original'),
							this.#translationService.translate('geoResourceInfo_infographic_collaboration_copy')
						)
					)}`;
				}

				return nothing;
			};

			return html`<style>
					${css}
				</style>
				<div class="description">
					<div class="infographic ${geoResource.collaborativeData ? 'collaborative' : 'copy'}">${getInfoGraphic(geoResourceId)}</div>
					<div class="description-text">${getDescription(geoResourceId)}</div>
				</div>
				<div class="container">
					<div class="title">${this.#translationService.translate('geoResourceInfo_last_modified')}:</div>
					<div class="value last-modified">${new Date(lastModified).toLocaleString()}</div>
				</div>
				<div class="container">
					<div class="title">Id:</div>
					<div class="value id">${geoResourceId}</div>
				</div>`;
		}
		return nothing;
	}
	static get tag() {
		return 'ba-last-modified-item';
	}

	set geoResourceId(value) {
		this.signal(UPDATE_GEORESOURCE_ID, value);
	}

	set lastModified(value) {
		if (isNumber(value)) {
			this.signal(UPDATE_LAST_MODIFIED, value);
		}
	}
}
