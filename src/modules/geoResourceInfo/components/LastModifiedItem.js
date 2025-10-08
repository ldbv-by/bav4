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

const infographic_share_a =
	'<svg  viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ><defs><linearGradient id="linearGradient7" x1="81.284" x2="89.195" y1="33.138" y2="33.138" gradientTransform="matrix(2.2297 0 0 2.2297 -28.522 -33.343)" gradientUnits="userSpaceOnUse"><stop style="stop-color:#099ddc" offset=".49559"/><stop style="stop-color:#dc09d9" offset=".49822"/></linearGradient></defs><path d="m118.96 40.398c-23.597 0-11.799-29.497-44.245-29.497" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><path d="m0.97402 40.402h159.28" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><path d="m30.471 40.398c23.597 0 11.799-29.497 44.245-29.497" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><circle cx="161.53" cy="40.544" r="8.2623" style="fill:url(#linearGradient7);stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><circle cx="74.791" cy="10.826" r="8.2623" style="fill:#dc09d9;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><circle cx="15.722" cy="40.398" r="8.2623" style="fill:#099ddc;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1148;stroke:currentColor"/><text x="10.900002" y="44.892979" style="fill:currentColor;font-family:Sans;font-size:23.597px;letter-spacing:0px;line-height:125%;stroke-width:.58993px;word-spacing:0px" xml:space="preserve"><tspan x="10.900002" y="44.892979" style="fill:currentColor;font-family:Sans;font-feature-settings:normal;font-size:14.158px;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;stroke-width:.58993px">A</tspan></text><text x="156.71936" y="44.589321" style="fill:currentColor;font-family:Sans;font-size:23.597px;letter-spacing:0px;line-height:125%;stroke-width:.58993px;word-spacing:0px" xml:space="preserve"><tspan x="156.71936" y="44.589321" style="fill:currentColor;font-family:Sans;font-feature-settings:normal;font-size:14.158px;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;stroke-width:.58993px">A</tspan></text></svg>';
const infographic_share_f =
	'<svg version="1.1" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg"><path d="m0.67679 40.377h165.36" style="fill:none;stroke-width:2.3148;stroke:currentColor"/><path d="m30.687 40.372c12.249 0 9.7994-30.623 46.547-30.623h88.807" style="fill:none;stroke-width:2.3148;stroke:currentColor"/><circle cx="166.75" cy="40.523" r="8.5779" style="fill:#099ddc;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1574;stroke:currentColor"/><circle cx="76.701" cy="9.6707" r="8.5779" style="fill:#dc09d9;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1574;stroke:currentColor"/><circle cx="15.988" cy="40.372" r="8.5779" style="fill:#099ddc;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1574;stroke:currentColor"/><circle cx="166.12" cy="9.6707" r="8.5779" style="fill:#dc09d9;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.1574;stroke:currentColor"/><text x="10.938501" y="44.762768" style="fill:currentColor;font-family:Sans;font-size:24.498px;letter-spacing:0px;line-height:125%;stroke-width:.61246px;word-spacing:0px" xml:space="preserve"><tspan x="10.938501" y="44.762768" style="fill:currentColor;font-family:Sans;font-feature-settings:normal;font-size:14.699px;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;stroke-width:.61246px">A</tspan></text><text x="161.67656" y="45.282993" style="fill:currentColor;font-family:Sans;font-size:24.498px;letter-spacing:0px;line-height:125%;stroke-width:.61246px;word-spacing:0px" xml:space="preserve"><tspan x="161.67656" y="45.282993" style="fill:currentColor;font-family:Sans;font-feature-settings:normal;font-size:14.699px;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;stroke-width:.61246px">A</tspan></text></svg>';
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
				if (this.#fileStorageService.isFileId(geoResourceId) || this.#fileStorageService.isAdminId(geoResourceId)) {
					const descriptionParts = [this.#translationService.translate('geoResourceInfo_last_modified_description')];

					if (this.#fileStorageService.isFileId(geoResourceId)) {
						descriptionParts.push(this.#translationService.translate('geoResourceInfo_last_modified_description_file_id'));
					}
					if (this.#fileStorageService.isAdminId(geoResourceId)) {
						descriptionParts.push(this.#translationService.translate('geoResourceInfo_last_modified_description_admin_id'));
					}
					return descriptionParts.join(' ');
				}
				return nothing;
			};

			const getInfoGraphic = (geoResourceId) => {
				if (this.#fileStorageService.isFileId(geoResourceId) || this.#fileStorageService.isAdminId(geoResourceId)) {
					if (this.#fileStorageService.isFileId(geoResourceId)) {
						return html`${unsafeHTML(infographic_share_f)}`;
					}
					if (this.#fileStorageService.isAdminId(geoResourceId)) {
						return html`${unsafeHTML(infographic_share_a)}`;
					}
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
