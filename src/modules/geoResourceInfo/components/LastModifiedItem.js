import { html, nothing } from '../../../../node_modules/lit-html/lit-html';
import { $injector } from '../../../injection/index';
import { isNumber } from '../../../utils/checks';
import { MvuElement } from '../../MvuElement';
import css from './lastModifiedItem.css';

const UPDATE_GEORESOURCE_ID = 'update_georesource_id';
const UPDATE_LAST_MODIFIED = 'update_last_modified';

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

			return html`<style>
					${css}
				</style>
				<div class="description">${getDescription(geoResourceId)}</div>
				<div class="container">
					<div class="title">Id:</div>
					<div class="value id">${geoResourceId}</div>
					<div class="title">${this.#translationService.translate('geoResourceInfo_last_modified')}:</div>
					<div class="value last-modified">${new Date(lastModified).toLocaleString()}</div>
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
