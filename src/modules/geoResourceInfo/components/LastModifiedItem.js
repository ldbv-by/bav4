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

const infographic_share_collaborative =
	'<svg version="1.1" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg"><path d="m118.96 40.398c-23.597 0-11.799-29.497-44.245-29.497" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><path d="m0.97402 40.402h159.28" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><path d="m30.471 40.398c23.597 0 11.799-29.497 44.245-29.497" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><circle cx="74.791" cy="10.826" r="8.2623" style="fill:#dc09d9;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><circle cx="15.722" cy="40.398" r="8.2623" style="fill:#099ddc;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><g transform="matrix(.62516 0 0 .62516 10.721 34.967)" style="fill:currentColor"><path d="m7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6a2.24 2.24 0 0 1-0.216-1c0-1.355 0.68-2.75 1.936-3.72a6.3 6.3 0 0 0-1.936-0.28c-4 0-5 3-5 4s1 1 1 1zm-0.716-6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/></g><circle cx="155.72" cy="40.398" r="8.2623" style="fill:#099ddc;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><g transform="matrix(.62516 0 0 .62516 150.72 34.967)" style="fill:currentColor"><path d="m7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6a2.24 2.24 0 0 1-0.216-1c0-1.355 0.68-2.75 1.936-3.72a6.3 6.3 0 0 0-1.936-0.28c-4 0-5 3-5 4s1 1 1 1zm-0.716-6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/></g></svg>';
const getInfographicShareCopy = (original_text, copy_text) =>
	`<svg version="1.1" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg"><path d="m0.97402 40.402h71.28" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><path d="m30.471 40.398c23.597 0 11.799-29.497 44.245-29.497" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><circle cx="74.791" cy="10.826" r="8.2623" style="fill:#dc09d9;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><circle cx="15.722" cy="40.398" r="8.2623" style="fill:#099ddc;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><circle cx="74.791" cy="40.398" r="8.2623" style="fill:#099ddc;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><text x="86.25132" y="46.129955" style="fill:currentColor;font-family:Sans;font-size:13.333px;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;letter-spacing:0px;line-height:125%;stroke-width:.61246px;word-spacing:0px" xml:space="preserve"><tspan>${original_text}</tspan></text><text x="86.25132" y="14.129955" style="fill:currentColor;font-family:Sans;font-size:13.333px;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;letter-spacing:0px;line-height:125%;stroke-width:.61246px;word-spacing:0px" xml:space="preserve"><tspan>${copy_text}</tspan></text></svg>`;
export class LastModifiedItem extends MvuElement {
	#translationService;
	#fileStorageService;
	constructor() {
		super({ geoResourceId: null, lastModified: null });
		const { TranslationService: translationService, FileStorageService: fileStorageService } = $injector.inject(
			'TranslationService',
			'FileStorageService'
		);
		this.#translationService = translationService;
		this.#fileStorageService = fileStorageService;
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

		if (geoResourceId && isNumber(lastModified)) {
			const getDescription = (geoResourceId) => {
				if (this.#fileStorageService.isFileId(geoResourceId)) {
					return [
						this.#translationService.translate('geoResourceInfo_last_modified_description'),
						this.#translationService.translate('geoResourceInfo_last_modified_description_file_id')
					].join(' ');
				}
				if (this.#fileStorageService.isAdminId(geoResourceId)) {
					return [
						this.#translationService.translate('geoResourceInfo_last_modified_description'),
						this.#translationService.translate('geoResourceInfo_last_modified_description_admin_id')
					].join(' ');
				}

				return nothing;
			};

			const getInfoGraphic = (geoResourceId) => {
				if (this.#fileStorageService.isFileId(geoResourceId)) {
					return html`${unsafeHTML(
						getInfographicShareCopy(
							this.#translationService.translate('geoResourceInfo_infographic_share_original'),
							this.#translationService.translate('geoResourceInfo_infographic_share_copy')
						)
					)}`;
				}
				if (this.#fileStorageService.isAdminId(geoResourceId)) {
					return html`${unsafeHTML(infographic_share_collaborative)}`;
				}

				return nothing;
			};

			return html`<style>
					${css}
				</style>
				<div class="description">
					<div class="infographic">${getInfoGraphic(geoResourceId)}</div>
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
