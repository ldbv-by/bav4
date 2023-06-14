/**
 * @module modules/export/components/dialog/ExportItem
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
// @ts-ignore
import css from './exportItem.css';
// @ts-ignore
import downloadSvg from './assets/download.svg';
import { SourceType } from '../../../../domain/sourceType';

const Update_Type = 'update_type';
const Update_Data = 'update_data';
const Update_Selected_Srid = 'update_selected_srid';
/**
 * @typedef {Object} ExportType
 * @property {module:domain/sourceType.SourceTypeName} sourceTypeName
 * @property {module:domain/mediaTypes.MediaType} mediaType
 * @property {Array<number>} srids
 */

/**
 * A child component of {@link ExportDialogContent|ExportDialogContent} to show options and action buttons
 * for a specific {@link module:modules/export/components/dialog/ExportItem~ExportType|ExportType}
 * @class
 * @property {module:modules/export/components/dialog/ExportItem~ExportType} exportType the type of export; including information about mime-type, filename and sourceType
 * @property {string} exportData the stringified collection of data, which should be exported
 * @author thiloSchlemmer
 */
export class ExportItem extends MvuElement {
	constructor() {
		super({ exportType: null, selectedSrid: null, exportData: null });
		const { TranslationService, ExportVectorDataService, FileSaveService } = $injector.inject(
			'TranslationService',
			'ExportVectorDataService',
			'FileSaveService'
		);
		this._translationService = TranslationService;
		this._exportVectorDataService = ExportVectorDataService;
		this._fileSaveService = FileSaveService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Type:
				return {
					...model,
					exportType: data,
					selectedSrid: data.srids[0]
				};
			case Update_Data:
				return {
					...model,
					exportData: data
				};
			case Update_Selected_Srid:
				return { ...model, selectedSrid: data };
		}
	}

	createView(model) {
		const { exportType, selectedSrid, exportData } = model;
		const translate = (key) => this._translationService.translate(key);
		const onSridChange = (e) => {
			const srid = parseInt(e.target.value);
			this.signal(Update_Selected_Srid, srid);
		};
		const onClickDownload = () => {
			const targetSourceType = new SourceType(exportType.sourceTypeName, null, selectedSrid);

			this._fileSaveService.saveAs(this._exportVectorDataService.forData(exportData, targetSourceType), exportType.mediaType);
		};
		const isDisabled = () => {
			return exportType.srids.length > 1 ? '' : 'disabled';
		};

		return exportType
			? html`<style>
						${css}
					</style>
					<div class="export-item__content">
						<div class="export-item__head">
							<div class="export-item__label">${translate(`export_item_label_${exportType.sourceTypeName}`)}</div>
							<div class="export-item__description">${translate(`export_item_description_${exportType.sourceTypeName}`)}</div>
						</div>
						<div class="export-item__select ba-form-element ${isDisabled()}">
							<select id="srid" .value=${selectedSrid} @change="${onSridChange}" ?disabled=${exportType.srids.length === 1}>
								${exportType.srids.map((srid) => html` <option value=${srid}>EPSG:${srid}</option> `)}
							</select>
							<label for="srid" class="control-label"
								>${exportType.srids.length === 1 ? translate('export_item_srid_selection_disabled') : translate('export_item_srid_selection')}</label
							><i class="bar"></i>
						</div>
						<ba-button
							id="download-button"
							.label=${translate(`export_item_download_${exportType.sourceTypeName}`)}
							.icon=${downloadSvg}
							.type=${'primary'}
							.disabled=${!selectedSrid || !exportData}
							@click=${onClickDownload}
						></ba-button>
					</div>`
			: html.nothing;
	}

	set exportType(value) {
		this.signal(Update_Type, value);
	}

	set exportData(value) {
		this.signal(Update_Data, value);
	}

	static get tag() {
		return 'ba-export-item';
	}
}
