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
 * @property {module:services/domain/sourceType~SourceTypeName} sourceType
 * @property {module:services/HttpService~MediaType} mediaType
 * @property {string} fileExtension
 * @property {Array<number>} srids
 */

/**
 * @class
 * @author thiloSchlemmer
 */
export class ExportItem extends MvuElement {
	constructor() {
		super({ exportType: null, selectedSrid: null, exportData: null });
		const { TranslationService, SourceTypeService, ExportVectorDataService } = $injector.inject(
			'TranslationService',
			'SourceTypeService',
			'ExportVectorDataService'
		);
		this._translationService = TranslationService;
		this._sourceTypeService = SourceTypeService;
		this._exportVectorDataService = ExportVectorDataService;
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
			const sourceTypeResult = this._sourceTypeService.forData(exportData);

			const dataSourceType = sourceTypeResult.sourceType;
			const targetSourceType = new SourceType(exportType.sourceType, null, selectedSrid);
			const content = this._exportVectorDataService.forData(exportData, dataSourceType, targetSourceType);
			const blob = new Blob([content], { type: exportType.mediaType });

			const fileName = `bayernAtlas.${exportType.fileExtension}`;
			this._saveAs(blob, fileName);
		};

		return exportType
			? html`<style>
						${css}
					</style>
					<div class="export-item__content">
						<div class="export-item__head">
							<div class="export-item__label">${translate(`export_item_label_${exportType.sourceType}`)}</div>
							<div class="export-item__description">${translate(`export_item_description_${exportType.sourceType}`)}</div>
						</div>
						<div class="export-item__select ba-form-element">
							<select id="srid" .value=${selectedSrid} @change="${onSridChange}" ?disabled=${exportType.srids.length === 1}>
								${exportType.srids.map((srid) => html` <option value=${srid}>EPSG:${srid}</option> `)}
							</select>
							<label for="srid" class="control-label"
								>${exportType.srids.length === 1 ? translate('export_item_srid_selection_disabled') : translate('export_item_srid_selection')}</label
							><i class="bar"></i>
						</div>
						<ba-button
							id="download-button"
							.label=${translate(`export_item_download_${exportType.sourceType}`)}
							.icon=${downloadSvg}
							.type=${'primary'}
							.disabled=${!selectedSrid || !exportData}
							@click=${onClickDownload}
						></ba-button>
					</div>`
			: html.nothing;
	}

	// FIXME: this is a prototypical implementation, should be moved to something like a FileSaveService.
	_saveAs(blob, fileName) {
		// FIXME: if refactored to a static service method...: check for valid blob(instanceof) and blob.type
		const url = window.URL.createObjectURL(blob);
		try {
			const a = document.createElement('a');
			a.href = url;
			a.download = fileName;
			a.click();
		} finally {
			window.URL.revokeObjectURL(url);
		}
	}

	/**
	 * content for export action
	 * @param {ExportType} value
	 */
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
